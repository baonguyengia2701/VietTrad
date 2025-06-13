// Entry point cho Render deployment
// File này sẽ chạy server từ thư mục server/

// Cấu hình path cho dotenv trước khi require server
const path = require('path');
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Load environment variables từ root hoặc server directory
require('dotenv').config({ 
  path: path.resolve(__dirname, '.env') 
});

// Nếu không tìm thấy .env ở root, thử tìm trong server/
if (!process.env.MONGO_URI) {
  require('dotenv').config({ 
    path: path.resolve(__dirname, 'server', '.env') 
  });
}

console.log('🚀 Starting VietTrad server...');
require('./server/server.js'); 