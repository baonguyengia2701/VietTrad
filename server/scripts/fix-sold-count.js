const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viettrad');
    console.log('MongoDB connected');
    
    const Product = require('../models/productModel');
    const Order = require('../models/orderModel');
    
    console.log('🔄 Starting sold count fix...');
    
    // Reset tất cả sold count về 0
    await Product.updateMany({}, { $set: { sold: 0 } });
    console.log('✅ Reset all product sold counts to 0');
    
    // Lấy tất cả đơn hàng có trạng thái confirmed trở lên
    const soldStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const orders = await Order.find({ 
      status: { $in: soldStatuses } 
    }).select('orderItems status orderNumber');
    
    console.log(`📊 Found ${orders.length} orders with sold status`);
    
    // Tạo map để tính tổng sold cho mỗi sản phẩm
    const soldMap = new Map();
    
    for (const order of orders) {
      for (const item of order.orderItems) {
        const productId = item.product.toString();
        const currentSold = soldMap.get(productId) || 0;
        soldMap.set(productId, currentSold + item.quantity);
      }
    }
    
    console.log(`📈 Processing ${soldMap.size} unique products`);
    
    // Cập nhật sold count cho từng sản phẩm
    let updatedCount = 0;
    for (const [productId, soldCount] of soldMap) {
      try {
        const result = await Product.findByIdAndUpdate(
          productId,
          { $set: { sold: soldCount } },
          { new: true }
        );
        
        if (result) {
          console.log(`✅ Updated product ${result.name}: sold = ${soldCount}`);
          updatedCount++;
        } else {
          console.log(`⚠️ Product not found: ${productId}`);
        }
      } catch (error) {
        console.error(`❌ Error updating product ${productId}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Orders processed: ${orders.length}`);
    console.log(`   - Products updated: ${updatedCount}`);
    console.log(`   - Sold statuses: ${soldStatuses.join(', ')}`);
    
    // Hiển thị một số sản phẩm có sold count cao nhất
    const topProducts = await Product.find({ sold: { $gt: 0 } })
      .sort({ sold: -1 })
      .limit(10)
      .select('name sold');
    
    if (topProducts.length > 0) {
      console.log(`\n🏆 Top selling products:`);
      topProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}: ${product.sold} sold`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

connectDB(); 