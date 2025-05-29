const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const User = require('./models/userModel');

// Sample order data for testing
const sampleOrderData = {
  orderItems: [
    {
      product: '6735a5f82e1006edec7b2fc2', // Replace with a real product ID
      name: 'Test Product',
      image: 'https://example.com/image.jpg',
      price: 100000,
      quantity: 1,
      selectedVariant: {
        title: 'Màu xanh',
        size: 'Size M',
        price: 0
      }
    }
  ],
  shippingInfo: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '0123456789',
    address: '123 Test Street',
    city: 'Ho Chi Minh',
    district: 'District 1',
    ward: 'Ward 1',
    note: 'Test note'
  },
  paymentMethod: 'cod',
  shippingMethod: 'standard',
  itemsPrice: 100000,
  shippingPrice: 30000,
  discountPrice: 0,
  voucherCode: '',
  voucherDiscount: 0,
  totalPrice: 130000
};

async function debugOrderCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/viettrad', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if product exists
    console.log('\n🔍 Checking product...');
    const product = await Product.findOne().limit(1);
    if (!product) {
      console.log('❌ No products found in database');
      return;
    }
    
    console.log('✅ Found product:', {
      id: product._id,
      name: product.name,
      variants: product.variants,
      countInStock: product.countInStock
    });

    // Update sample data with real product ID
    sampleOrderData.orderItems[0].product = product._id.toString();
    sampleOrderData.orderItems[0].name = product.name;
    sampleOrderData.orderItems[0].image = product.images[0];
    sampleOrderData.orderItems[0].price = product.price;

    // Check if user exists
    console.log('\n🔍 Checking user...');
    const user = await User.findOne().limit(1);
    if (!user) {
      console.log('❌ No users found in database');
      return;
    }
    console.log('✅ Found user:', user.email);

    // Test order validation
    console.log('\n🧪 Testing order validation...');
    
    // Generate order number
    const orderNumber = await Order.generateOrderNumber();
    console.log('✅ Generated order number:', orderNumber);

    // Create order
    console.log('\n📦 Creating order...');
    const order = new Order({
      user: user._id,
      orderNumber,
      ...sampleOrderData
    });

    console.log('Order data before save:', JSON.stringify(order.toObject(), null, 2));

    const savedOrder = await order.save();
    console.log('✅ Order created successfully!');
    console.log('Order ID:', savedOrder._id);
    console.log('Order Number:', savedOrder.orderNumber);

    // Test with variants validation
    console.log('\n🔍 Testing variant validation...');
    if (product.variants && product.variants.title && product.variants.title.length > 0) {
      console.log('Product has variants:');
      console.log('- Titles:', product.variants.title);
      console.log('- Sizes:', product.variants.size);
      
      const testVariant = {
        title: product.variants.title[0] || '',
        size: product.variants.size[0] || '',
        price: 0
      };
      
      console.log('Testing with variant:', testVariant);
      
      // Test another order with real variants
      const orderWithVariants = new Order({
        user: user._id,
        orderNumber: await Order.generateOrderNumber(),
        orderItems: [{
          ...sampleOrderData.orderItems[0],
          selectedVariant: testVariant
        }],
        shippingInfo: sampleOrderData.shippingInfo,
        paymentMethod: sampleOrderData.paymentMethod,
        shippingMethod: sampleOrderData.shippingMethod,
        itemsPrice: sampleOrderData.itemsPrice,
        shippingPrice: sampleOrderData.shippingPrice,
        discountPrice: sampleOrderData.discountPrice,
        voucherCode: sampleOrderData.voucherCode,
        voucherDiscount: sampleOrderData.voucherDiscount,
        totalPrice: sampleOrderData.totalPrice
      });
      
      const savedOrderWithVariants = await orderWithVariants.save();
      console.log('✅ Order with variants created successfully!');
      console.log('Order ID:', savedOrderWithVariants._id);
    } else {
      console.log('Product has no variants or empty variants');
    }

  } catch (error) {
    console.error('❌ Debug error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      Object.values(error.errors).forEach(err => {
        console.error(`- ${err.path}: ${err.message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run debug if called directly
if (require.main === module) {
  debugOrderCreation();
}

module.exports = { debugOrderCreation }; 