const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viettrad');
    console.log('MongoDB connected');
    
    const Product = require('../models/productModel');
    const Order = require('../models/orderModel');
    const { isSoldStatus, updateSoldCount } = require('../utils/orderUtils');
    
    console.log('🧪 Testing sold count logic...\n');
    
    // Test 1: Kiểm tra isSoldStatus function
    console.log('📋 Test 1: isSoldStatus function');
    const testStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'received', 'cancelled'];
    testStatuses.forEach(status => {
      const isSold = isSoldStatus(status);
      console.log(`   ${status}: ${isSold ? '✅ Sold' : '❌ Not Sold'}`);
    });
    
    // Test 2: Kiểm tra một số đơn hàng mẫu
    console.log('\n📋 Test 2: Sample orders analysis');
    const sampleOrders = await Order.find()
      .populate('orderItems.product', 'name sold')
      .limit(5)
      .select('orderNumber status orderItems');
    
    if (sampleOrders.length > 0) {
      sampleOrders.forEach(order => {
        const isSold = isSoldStatus(order.status);
        console.log(`   Order ${order.orderNumber}: ${order.status} -> ${isSold ? 'Counted in sold' : 'Not counted'}`);
        
        order.orderItems.forEach(item => {
          if (item.product) {
            console.log(`     - ${item.product.name}: qty=${item.quantity}, current sold=${item.product.sold}`);
          }
        });
      });
    } else {
      console.log('   No orders found');
    }
    
    // Test 3: Thống kê tổng quan
    console.log('\n📋 Test 3: Overall statistics');
    const totalOrders = await Order.countDocuments();
    const soldOrders = await Order.countDocuments({ 
      status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } 
    });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    console.log(`   Total orders: ${totalOrders}`);
    console.log(`   Sold orders (confirmed+): ${soldOrders}`);
    console.log(`   Pending orders: ${pendingOrders}`);
    console.log(`   Cancelled orders: ${cancelledOrders}`);
    
    // Test 4: Top selling products
    console.log('\n📋 Test 4: Top selling products');
    const topProducts = await Product.find({ sold: { $gt: 0 } })
      .sort({ sold: -1 })
      .limit(5)
      .select('name sold countInStock');
    
    if (topProducts.length > 0) {
      topProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Sold: ${product.sold}, Stock: ${product.countInStock}`);
      });
    } else {
      console.log('   No products with sales found');
    }
    
    // Test 5: Validation check
    console.log('\n📋 Test 5: Data validation');
    const productsWithNegativeSold = await Product.countDocuments({ sold: { $lt: 0 } });
    const productsWithNegativeStock = await Product.countDocuments({ countInStock: { $lt: 0 } });
    
    console.log(`   Products with negative sold: ${productsWithNegativeSold}`);
    console.log(`   Products with negative stock: ${productsWithNegativeStock}`);
    
    if (productsWithNegativeSold === 0 && productsWithNegativeStock === 0) {
      console.log('   ✅ All data looks good!');
    } else {
      console.log('   ⚠️ Found data inconsistencies');
    }
    
    console.log('\n🎉 Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
};

connectDB(); 