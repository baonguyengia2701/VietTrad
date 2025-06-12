const mongoose = require('mongoose');
const config = require('../config/config');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample blog data
const sampleBlogs = [
  {
    title: 'Làng gốm Hương Canh - Nơi lưu giữ hồn gốm Việt',
    excerpt: 'Làng gốm Hương Canh, xã Dữu Lâu, thành phố Việt Trì, tỉnh Phú Thọ là một trong những làng nghề gốm sứ lâu đời nhất của Việt Nam với hơn 500 năm lịch sử.',
    content: `
      <h2>Lịch sử hình thành</h2>
      <p>Làng gốm Hương Canh có lịch sử hình thành và phát triển từ thế kỷ XV, với truyền thống nghề gốm được truyền từ đời này qua đời khác. Những nghệ nhân đầu tiên đã chọn nơi này để làm nghề vì có đất sét tốt và gần sông Lô, thuận tiện cho việc vận chuyển.</p>
      
      <h2>Đặc sản nổi tiếng</h2>
      <p>Sản phẩm gốm Hương Canh nổi tiếng với:</p>
      <ul>
        <li>Chậu kiểng các loại với nhiều kích cỡ khác nhau</li>
        <li>Chum, vại đựng nước, rượu với độ bền cao</li>
        <li>Đồ trang trí nội thất như bình hoa, tượng trang trí</li>
        <li>Đồ gia dụng như nồi, niêu, thố</li>
      </ul>
      
      <h2>Kỹ thuật sản xuất</h2>
      <p>Quy trình sản xuất gốm Hương Canh trải qua nhiều công đoạn phức tạp từ việc chọn đất sét, nhào trộn, tạo hình, sấy khô đến nung trong lò. Nhiệt độ nung dao động từ 900-1000 độ C, tạo nên những sản phẩm có độ bền cao và màu sắc đặc trưng.</p>
      
      <h2>Thách thức hiện tại</h2>
      <p>Hiện nay, làng gốm Hương Canh đang đối mặt với nhiều thách thức như khan hiếm nguyên liệu, ô nhiễm môi trường và sự cạnh tranh từ các sản phẩm công nghiệp. Tuy nhiên, với sự hỗ trợ của chính quyền và ý thức bảo tồn của người dân, nghề gốm Hương Canh vẫn đang được duy trì và phát triển.</p>
    `,
    featuredImage: 'https://dantra.vn/assets/san-pham/2023_09/lang-gom-huong-canh.jpg',
    category: 'làng gốm',
    tags: ['gốm sứ', 'truyền thống', 'Phú Thọ', 'nghề thủ công'],
    location: {
      province: 'Phú Thọ',
      district: 'Việt Trì',
      ward: 'Dữu Lâu',
      address: 'Làng Hương Canh, xã Dữu Lâu'
    },
    craftsman: {
      name: 'Nghệ nhân Nguyễn Văn Thành',
      age: 68,
      experience: '45 năm kinh nghiệm',
      story: 'Ông Thành bắt đầu học nghề từ năm 15 tuổi, kế thừa nghề truyền thống của gia đình qua 4 đời.'
    },
    isPublished: true,
    publishedAt: new Date('2024-03-24'),
    views: 1250,
    likes: 89
  },
  {
    title: 'Làng dệt Hồi Quan - Tinh hoa nghệ thuật dệt truyền thống',
    excerpt: 'Làng dệt Hồi Quan, thuộc xã Đình Bảng, huyện Từ Sơn, tỉnh Bắc Ninh, nổi tiếng với nghề dệt lụa và thổ cẩm có tuổi đời hàng trăm năm.',
    content: `
      <h2>Nguồn gốc và lịch sử</h2>
      <p>Làng dệt Hồi Quan có nguồn gốc từ thế kỷ XVII, được hình thành bởi những nghệ nhân dệt lụa di cư từ các vùng khác đến. Nghề dệt ở đây phát triển mạnh mẽ nhờ vào truyền thống lâu đời và kỹ thuật tinh xảo được truyền từ thế hệ này sang thế hệ khác.</p>
      
      <h2>Sản phẩm đặc trưng</h2>
      <p>Các sản phẩm nổi tiếng của làng dệt Hồi Quan:</p>
      <ul>
        <li>Lụa tơ tằm với chất lượng cao cấp</li>
        <li>Thổ cẩm với họa tiết truyền thống</li>
        <li>Vải lanh, vải cotton thủ công</li>
        <li>Khăn lụa, khăn choàng cao cấp</li>
      </ul>
      
      <h2>Quy trình sản xuất</h2>
      <p>Quy trình dệt truyền thống bao gồm các bước: chọn tơ, nhuộm màu bằng nguyên liệu thiên nhiên, thiết kế họa tiết, và dệt trên khung cửi thủ công. Mỗi sản phẩm đều mang dấu ấn riêng của nghệ nhân.</p>
      
      <h2>Bảo tồn và phát triển</h2>
      <p>Hiện nay, làng dệt Hồi Quan đang nỗ lực kết hợp giữa kỹ thuật truyền thống và công nghệ hiện đại để tạo ra những sản phẩm vừa giữ được nét đẹp cổ điển vừa phù hợp với thị hiếu hiện đại.</p>
    `,
    featuredImage: 'https://dantra.vn/assets/san-pham/2023_09/lang-det-hoi-quan.jpg',
    category: 'làng dệt',
    tags: ['dệt may', 'lụa', 'thổ cẩm', 'Bắc Ninh'],
    location: {
      province: 'Bắc Ninh',
      district: 'Từ Sơn',
      ward: 'Đình Bảng',
      address: 'Làng Hồi Quan, xã Đình Bảng'
    },
    craftsman: {
      name: 'Nghệ nhân Phan Thị Ý',
      age: 72,
      experience: '50 năm kinh nghiệm',
      story: 'Bà Ý là một trong những nghệ nhân dệt cuối cùng còn lại của làng, đã dành cả cuộc đời để bảo tồn nghề dệt truyền thống.'
    },
    isPublished: true,
    publishedAt: new Date('2024-07-14'),
    views: 980,
    likes: 67
  },
  {
    title: 'Làng dao Tất Tác - Nơi rèn luyện tinh hoa thép Việt',
    excerpt: 'Làng dao Tất Tác, xã Từ Sơn, huyện Từ Sơn, tỉnh Bắc Ninh, nổi tiếng với nghề rèn dao, kéo có lịch sử hàng trăm năm và sản phẩm chất lượng cao.',
    content: `
      <h2>Lịch sử nghề rèn</h2>
      <p>Nghề rèn dao kéo ở Tất Tác có lịch sử từ thế kỷ XVIII, ban đầu chỉ để phục vụ nhu cầu địa phương. Qua thời gian, nhờ vào tay nghề khéo léo và kinh nghiệm tích lũy, các sản phẩm của làng đã nổi tiếng khắp cả nước.</p>
      
      <h2>Đặc điểm sản phẩm</h2>
      <p>Dao kéo Tất Tác nổi tiếng với:</p>
      <ul>
        <li>Chất liệu thép cao cấp, độ bền cao</li>
        <li>Thiết kế tinh xảo, sắc bén</li>
        <li>Đa dạng về chủng loại: dao bếp, dao câu, kéo may</li>
        <li>Họa tiết khắc chạm trang trí độc đáo</li>
      </ul>
      
      <h2>Kỹ thuật rèn</h2>
      <p>Quy trình rèn dao gồm nhiều công đoạn: chọn thép, nung đỏ, rèn tạo hình, mài sắc, và hoàn thiện. Mỗi sản phẩm đều được rèn thủ công 100% và trải qua nhiều lần kiểm tra chất lượng.</p>
      
      <h2>Thách thức và cơ hội</h2>
      <p>Trong bối cảnh hội nhập, nghề rèn Tất Tác đang tìm cách kết hợp giữa kỹ thuật truyền thống và công nghệ hiện đại để tạo ra những sản phẩm có thể cạnh tranh trên thị trường quốc tế.</p>
    `,
    featuredImage: 'https://dantra.vn/assets/san-pham/2023_09/lang-dao-tat-tac.jpg',
    category: 'làng dao',
    tags: ['rèn dao', 'thủ công', 'kim khí', 'Bắc Ninh'],
    location: {
      province: 'Bắc Ninh',
      district: 'Từ Sơn',
      ward: 'Từ Sơn',
      address: 'Làng Tất Tác'
    },
    craftsman: {
      name: 'Nghệ nhân Nguyễn Văn Tiến',
      age: 55,
      experience: '35 năm kinh nghiệm',
      story: 'Ông Tiến là thế hệ thứ 3 trong gia đình theo nghề rèn, đã sáng tạo ra nhiều mẫu dao độc đáo.'
    },
    isPublished: true,
    publishedAt: new Date('2024-04-28'),
    views: 1100,
    likes: 78
  },
  {
    title: 'Làng vàng bạc Châu Khê - Điểm nhấn nghệ thuật kim hoàn',
    excerpt: 'Làng Châu Khê, xã Châu Khê, huyện Từ Sơn, tỉnh Bắc Ninh, là cái nôi của nghề chế tác vàng bạc với lịch sử phát triển lâu đời và kỹ thuật tinh xảo.',
    content: `
      <h2>Khởi nguồn nghề vàng bạc</h2>
      <p>Nghề chế tác vàng bạc ở Châu Khê bắt đầu từ thế kỷ XVII, khi những thợ kim hoàn đầu tiên định cư tại đây. Với tài năng và sự sáng tạo, họ đã tạo nên những sản phẩm kim hoàn tinh xảo, được ưa chuộng bởi hoàng gia và quý tộc.</p>
      
      <h2>Sản phẩm tiêu biểu</h2>
      <p>Các sản phẩm nổi tiếng của làng Châu Khê:</p>
      <ul>
        <li>Trang sức vàng bạc: nhẫn, dây chuyền, lắc tay</li>
        <li>Đồ thờ cúng: chân nến, lư hương, tượng Phật</li>
        <li>Đồ trang trí nội thất: khay, đĩa, bình hoa</li>
        <li>Sản phẩm đặc chế theo yêu cầu</li>
      </ul>
      
      <h2>Kỹ thuật chế tác</h2>
      <p>Quy trình chế tác kim hoàn Châu Khê bao gồm: thiết kế, chia tỷ lệ, đúc, chạm khắc, đánh bóng. Mỗi sản phẩm đều mang dấu ấn riêng của nghệ nhân với kỹ thuật chạm khắc thủ công tinh xảo.</p>
      
      <h2>Giá trị văn hóa</h2>
      <p>Ngoài giá trị kinh tế, các sản phẩm kim hoàn Châu Khê còn mang giá trị văn hóa cao, thể hiện qua các họa tiết truyền thống như rồng phụng, hoa sen, và các biểu tượng phong thủy.</p>
    `,
    featuredImage: 'https://dantra.vn/assets/san-pham/2023_09/lang-vang-bac-chau-khe.jpg',
    category: 'làng vàng bạc',
    tags: ['kim hoàn', 'vàng bạc', 'thủ công', 'Bắc Ninh'],
    location: {
      province: 'Bắc Ninh',
      district: 'Từ Sơn',
      ward: 'Châu Khê',
      address: 'Làng Châu Khê'
    },
    craftsman: {
      name: 'Nghệ nhân Nguyễn Văn Long',
      age: 62,
      experience: '40 năm kinh nghiệm',
      story: 'Ông Long là một trong những nghệ nhân kim hoàn được công nhận ở cấp tỉnh, đã tạo ra nhiều tác phẩm nghệ thuật có giá trị cao.'
    },
    isPublished: true,
    publishedAt: new Date('2024-07-14'),
    views: 890,
    likes: 56
  },
  {
    title: 'Làng thêu cung đình Đông Cứu - Nghệ thuật kim chỉ hoàng gia',
    excerpt: 'Làng thêu Đông Cứu, xã Dũng Tiến, huyện Thường Tín, Hà Nội, là nơi lưu giữ nghệ thuật thêu cung đình với kỹ thuật thêu kim tuyến tinh xảo và độc đáo.',
    content: `
      <h2>Lịch sử hình thành</h2>
      <p>Nghề thêu ở Đông Cứu có nguồn gốc từ thế kỷ XIX, được hình thành để phục vụ cung đình nhà Nguyễn. Các nghệ nhân ở đây đã thành thạo kỹ thuật thêu kim tuyến, tạo ra những sản phẩm sang trọng dành cho hoàng gia.</p>
      
      <h2>Đặc sản nổi bật</h2>
      <p>Sản phẩm thêu Đông Cứu bao gồm:</p>
      <ul>
        <li>Áo dài thêu tay cao cấp</li>
        <li>Tranh thêu phong cảnh, chân dung</li>
        <li>Khăn, khăn choàng thêu hoa văn</li>
        <li>Đồ trang trí nội thất thêu kim tuyến</li>
      </ul>
      
      <h2>Kỹ thuật thêu</h2>
      <p>Kỹ thuật thêu Đông Cứu sử dụng chỉ tơ tằm, chỉ vàng, chỉ bạc với các mũi thêu truyền thống như thêu phẳng, thêu nổi, thêu kim tuyến. Mỗi sản phẩm đều được thêu hoàn toàn bằng tay với độ tinh xảo cao.</p>
      
      <h2>Giá trị nghệ thuật</h2>
      <p>Sản phẩm thêu Đông Cứu không chỉ có giá trị thương mại mà còn là tác phẩm nghệ thuật, thể hiện tài năng và sự tỉ mỉ của người thợ thêu Việt Nam.</p>
    `,
    featuredImage: 'https://dantra.vn/assets/san-pham/2023_09/lang-theu-dong-cuu.jpg',
    category: 'làng thêu',
    tags: ['thêu', 'kim tuyến', 'cung đình', 'Hà Nội'],
    location: {
      province: 'Hà Nội',
      district: 'Thường Tín',
      ward: 'Dũng Tiến',
      address: 'Làng Đông Cứu'
    },
    craftsman: {
      name: 'Nghệ nhân Nguyễn Thị Hoa',
      age: 58,
      experience: '35 năm kinh nghiệm',
      story: 'Bà Hoa là một trong những nghệ nhân thêu hàng đầu của làng, đã thêu nhiều tác phẩm được trưng bày tại các bảo tàng.'
    },
    isPublished: true,
    publishedAt: new Date('2024-11-15'),
    views: 750,
    likes: 45
  },
  {
    title: 'Làng nghề Sơn Đồng - Điêu khắc gỗ nghệ thuật',
    excerpt: 'Làng Sơn Đồng, xã Sơn Đồng, huyện Hoài Đức, Hà Nội, nổi tiếng với nghề điêu khắc gỗ và sơn son thiếp vàng có lịch sử hơn 1000 năm.',
    content: `
      <h2>Truyền thống nghìn năm</h2>
      <p>Làng nghề Sơn Đồng có lịch sử phát triển hơn 1000 năm, chuyên về điêu khắc gỗ, sơn son thiếp vàng. Nghề này được hình thành để phục vụ việc xây dựng các công trình kiến trúc truyền thống như chùa, đình, đền.</p>
      
      <h2>Sản phẩm chính</h2>
      <p>Các sản phẩm tiêu biểu của làng Sơn Đồng:</p>
      <ul>
        <li>Hoành phi, câu đối sơn son thiếp vàng</li>
        <li>Tượng gỗ thờ cúng các loại</li>
        <li>Đồ nội thất gỗ cao cấp</li>
        <li>Sản phẩm mỹ nghệ trang trí</li>
      </ul>
      
      <h2>Quy trình chế tác</h2>
      <p>Quy trình sản xuất gồm: chọn gỗ, thiết kế, cắt tạo hình, chạm khắc, sơn lót, sơn son, thiếp vàng. Mỗi sản phẩm đều được làm thủ công 100% với độ tỉ mỉ cao.</p>
      
      <h2>Giá trị di sản</h2>
      <p>Nghề điêu khắc gỗ Sơn Đồng đã được UNESCO công nhận là Di sản văn hóa phi vật thể của nhân loại, thể hiện tầm quan trọng của nghề này trong việc bảo tồn văn hóa truyền thống.</p>
    `,
    featuredImage: 'https://dantra.vn/assets/san-pham/2023_09/lang-son-dong.jpg',
    category: 'khác',
    tags: ['điêu khắc', 'gỗ', 'sơn son thiếp vàng', 'Hà Nội'],
    location: {
      province: 'Hà Nội',
      district: 'Hoài Đức',
      ward: 'Sơn Đồng',
      address: 'Làng Sơn Đồng'
    },
    craftsman: {
      name: 'Nghệ nhân Nguyễn Văn Sơn',
      age: 65,
      experience: '45 năm kinh nghiệm',
      story: 'Ông Sơn là nghệ nhân ưu tú cấp quốc gia, đã tham gia chế tác nhiều công trình quan trọng như Văn Miếu, Ngọc Sơn.'
    },
    isPublished: true,
    publishedAt: new Date('2024-07-14'),
    views: 1350,
    likes: 92
  }
];

// Helper function to create slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
    .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
    .replace(/[íìỉĩị]/g, 'i')
    .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
    .replace(/[úùủũụưứừửữự]/g, 'u')
    .replace(/[ýỳỷỹỵ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Seed function
const seedBlogs = async () => {
  try {
    // Find admin user for author
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('Cleared existing blogs');

    // Add author and slug to each blog
    const blogsWithAuthor = sampleBlogs.map(blog => ({
      ...blog,
      author: adminUser._id,
      slug: createSlug(blog.title)
    }));

    // Insert sample blogs
    const insertedBlogs = await Blog.insertMany(blogsWithAuthor);
    console.log(`Inserted ${insertedBlogs.length} sample blogs`);

    // Add some comments to blogs
    const comments = [
      {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        content: 'Bài viết rất hay và bổ ích. Cám ơn tác giả đã chia sẻ!',
        isApproved: true
      },
      {
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        content: 'Tôi rất yêu thích các làng nghề truyền thống. Mong sẽ có thêm nhiều bài viết như thế này.',
        isApproved: true
      },
      {
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        content: 'Thông tin rất chi tiết và chính xác. Đã học được nhiều điều mới.',
        isApproved: true
      }
    ];

    // Add comments to some blogs
    for (let i = 0; i < Math.min(3, insertedBlogs.length); i++) {
      const blog = insertedBlogs[i];
      blog.comments.push(...comments);
      await blog.save();
    }

    console.log('Added sample comments to blogs');
    console.log('Blog seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding blogs:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed script
const runSeed = async () => {
  await connectDB();
  await seedBlogs();
};

// Only run if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedBlogs }; 