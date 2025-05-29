const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/viettrad');
    console.log('MongoDB connected');
    
    const Product = require('./models/productModel');
    
    // Đếm tổng số sản phẩm
    const totalProducts = await Product.countDocuments();
    console.log('Tổng số sản phẩm trong DB:', totalProducts);
    
    // Đếm sản phẩm active
    const activeProducts = await Product.countDocuments({ isActive: true });
    console.log('Số sản phẩm active:', activeProducts);
    
    // Lấy tất cả sản phẩm để kiểm tra giá
    const allProducts = await Product.find().select('name price isActive categoryName brandName');
    console.log('\n=== TẤT CẢ SẢN PHẨM VÀ GIÁ ===');
    allProducts.forEach(p => {
      console.log(`- ${p.name} | Giá: ${p.price.toLocaleString('vi-VN')}đ | Active: ${p.isActive}`);
    });
    
    // Kiểm tra filter giá <= 770000
    const priceLimit = 770000;
    const productsUnderLimit = await Product.find({ 
      isActive: true, 
      price: { $lte: priceLimit } 
    }).select('name price');
    
    console.log(`\n=== SẢN PHẨM CÓ GIÁ <= ${priceLimit.toLocaleString('vi-VN')}đ ===`);
    console.log(`Số lượng: ${productsUnderLimit.length}`);
    productsUnderLimit.forEach(p => {
      console.log(`- ${p.name} | Giá: ${p.price.toLocaleString('vi-VN')}đ`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

connectDB(); 