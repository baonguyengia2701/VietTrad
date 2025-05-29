const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');

// Mock data từ frontend
const mockProducts = [
  {
    "name": "Bát sứ hoa đào Bát Tràng",
    "image": [
      "https://down-vn.img.susercontent.com/file/sg-11134201-22120-ruko8osu2tkvd7.webp",
      "https://down-vn.img.susercontent.com/file/748f0ec675e4efca8a931e777cb38904.webp"
    ],
    "price": 55000.0,
    "rating": 4.5,
    "discount": 0.0,
    "description": "Bát sứ hoa đào là dòng sản phẩm cao cấp của sứ Bát Tràng. Với chất men dày dặn và sứ dày bền, hoa văn sắc nét, dòng sản phẩm này đã gây ấn tượng mạnh và là sản phẩm không thể thiếu trong mâm cơm gia đình Việt.",
    "countInStock": 30.0,
    "selled": 125,
    "brand": "Làng nghề Bát Tràng",
    "category": "Gốm sứ"
  },
  {
    "name": "Bộ ấm chén men xanh lục vẽ vàng kim gốm Bát Tràng",
    "image": [
      "https://down-vn.img.susercontent.com/file/60a86ef626154b22b550eea0447786d4.webp",
      "https://down-vn.img.susercontent.com/file/ee0eb89c10620050b26fdc19461337f0.webp"
    ],
    "price": 420000.0,
    "rating": 4.8,
    "discount": 15.0,
    "description": "Bộ ấm chén men xanh lục gốm Bát Tràng, kẻ viền vàng kim vô cùng bắt mắt và sang trọng, lịch sự, mua set kèm khay mứt đồng bộ tô điểm cho phòng khách nhà bạn đặc biệt các dịp lễ Tết.",
    "countInStock": 10.0,
    "selled": 67,
    "brand": "Làng nghề Bát Tràng",
    "category": "Gốm sứ"
  },
  {
    "name": "Đĩa Gốm Sứ Bát Tràng Cao Cấp Men Xanh Đá 01- Vựa Gốm",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m8qae60lp8ci48@resize_w900_nl.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m8qagnjmooef93@resize_w900_nl.webp"
    ],
    "price": 100000.0,
    "rating": 4.2,
    "discount": 10.0,
    "description": "Đĩa Gốm Sứ Bát Tràng Cao Cấp Men Ngọc Trai - Vựa Gốm là sản phẩm được làm từ chất liệu gốm sứ cao cấp, vô cùng an toàn cho mọi gia đình, có sự đa dạng về mẫu mã cũng như kiểu dáng, họa tiết đơn giản tinh tế cũng không kém phần sang trọng giúp cho bữa cơm của mọi người trở nên đẹp mắt, ngon miệng hơn.",
    "countInStock": 10.0,
    "selled": 89,
    "brand": "Làng nghề Bát Tràng",
    "category": "Gốm sứ"
  },
  {
    "name": "Bộ quà tặng Bếp xinh 2 đôi đũa và 2 gác đũa",
    "image": [
      "https://down-vn.img.susercontent.com/file/sg-11134201-22110-h8w1v9zrnxjvb6.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lw5q8n0w7nz574.webp"
    ],
    "price": 238000.0,
    "rating": 4.6,
    "discount": 5.0,
    "description": "Bộ quà tặng Bếp xinh bao gồm 2 đôi đũa gỗ cao cấp và 2 gác đũa tinh tế, là món quà ý nghĩa cho gia đình và bạn bè.",
    "countInStock": 25.0,
    "selled": 43,
    "brand": "Bếp Xinh",
    "category": "Đồ gỗ"
  },
  {
    "name": "Bộ quà tặng Bếp xinh 6 gác đũa",
    "image": [
      "https://product.hstatic.net/1000399027/product/1dscf1874__2__03c7857e65ba4815a186658dfbede916_master.jpg",
      "https://product.hstatic.net/1000399027/product/1dscf1892__2__9965b47cd5b94ff08763089f07c97bba_master.jpg"
    ],
    "price": 258000.0,
    "rating": 4.3,
    "discount": 0.0,
    "description": "Bộ 6 gác đũa thiết kế tinh xảo, phù hợp cho các bữa cơm gia đình lớn hoặc các buổi tiệc.",
    "countInStock": 15.0,
    "selled": 32,
    "brand": "Bếp Xinh",
    "category": "Đồ gỗ"
  },
  {
    "name": "Đũa gỗ mun",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lk5u5n67lgp113.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm6v6o78msr224.webp"
    ],
    "price": 36000.0,
    "rating": 4.1,
    "discount": 0.0,
    "description": "Đũa gỗ mun cao cấp, bền đẹp và an toàn cho sức khỏe, là lựa chọn hoàn hảo cho mọi gia đình.",
    "countInStock": 0.0,
    "selled": 156,
    "brand": "Thủ công truyền thống",
    "category": "Đồ gỗ"
  },
  {
    "name": "Khăn tắm to linen - Ngưa Trắng Silk",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lxvmn8p5ewij59.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ly7o9q6f9xkk70.webp"
    ],
    "price": 295000.0,
    "rating": 4.7,
    "discount": 20.0,
    "description": "Khăn tắm linen cao cấp từ thương hiệu Ngưa Trắng Silk, chất liệu tự nhiên, thấm hút tốt và thân thiện với làn da.",
    "countInStock": 8.0,
    "selled": 78,
    "brand": "Ngưa Trắng Silk",
    "category": "Dệt may"
  },
  {
    "name": "Set nến thơm handmade cao cấp",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm2j8x9k3l4r2a.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ln3k9y0l4m5s3b.webp"
    ],
    "price": 180000.0,
    "rating": 4.4,
    "discount": 12.0,
    "description": "Bộ nến thơm handmade với hương thơm tự nhiên, tạo không gian thư giãn cho ngôi nhà của bạn.",
    "countInStock": 20.0,
    "selled": 95,
    "brand": "Handmade Việt",
    "category": "Trang trí"
  },
  {
    "name": "Hộp đựng trà gỗ truyền thống",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ln3k8m5p7qx945.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lo4l9n6q8ry056.webp"
    ],
    "price": 320000.0,
    "rating": 4.6,
    "discount": 8.0,
    "description": "Hộp đựng trà bằng gỗ tự nhiên, thiết kế truyền thống Việt Nam, giúp bảo quản trà tốt nhất.",
    "countInStock": 12.0,
    "selled": 54,
    "brand": "Thủ công truyền thống",
    "category": "Đồ gỗ"
  },
  {
    "name": "Tượng gốm Phật Di Lặc",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lp4m9n6q8st156.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lq5n0o7p9ut267.webp"
    ],
    "price": 450000.0,
    "rating": 4.9,
    "discount": 0.0,
    "description": "Tượng Phật Di Lặc bằng gốm sứ Bát Tràng, mang lại may mắn và thịnh vượng cho gia đình.",
    "countInStock": 5.0,
    "selled": 23,
    "brand": "Làng nghề Bát Tràng",
    "category": "Gốm sứ"
  },
  {
    "name": "Bình hoa gốm men rạn",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lq5n8o7p9uv267.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lr6o1p8q0ww378.webp"
    ],
    "price": 280000.0,
    "rating": 4.3,
    "discount": 15.0,
    "description": "Bình hoa gốm men rạn cổ điển, tạo điểm nhấn trang trí cho không gian sống.",
    "countInStock": 18.0,
    "selled": 67,
    "brand": "Làng nghề Bát Tràng",
    "category": "Gốm sứ"
  },
  {
    "name": "Khay trà gỗ tre tự nhiên",
    "image": [
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lr6o9p8q0wx378.webp",
      "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ls7p2q9r1xy489.webp"
    ],
    "price": 150000.0,
    "rating": 4.2,
    "discount": 0.0,
    "description": "Khay trà bằng gỗ tre tự nhiên, thiết kế đơn giản và tiện dụng cho việc thưởng trà.",
    "countInStock": 22.0,
    "selled": 88,
    "brand": "Tre Việt",
    "category": "Mây tre đan"
  }
];

// Dữ liệu categories
const categories = [
  { name: 'Gốm sứ', slug: 'gom-su', description: 'Sản phẩm gốm sứ truyền thống Việt Nam' },
  { name: 'Đồ gỗ', slug: 'do-go', description: 'Đồ gỗ thủ công truyền thống' },
  { name: 'Dệt may', slug: 'det-may', description: 'Sản phẩm dệt may thủ công' },
  { name: 'Trang trí', slug: 'trang-tri', description: 'Đồ trang trí nội thất' },
  { name: 'Mây tre đan', slug: 'may-tre-dan', description: 'Sản phẩm mây tre đan truyền thống' },
];

// Dữ liệu brands
const brands = [
  { name: 'Làng nghề Bát Tràng', slug: 'lang-nghe-bat-trang', description: 'Thương hiệu gốm sứ Bát Tràng' },
  { name: 'Bếp Xinh', slug: 'bep-xinh', description: 'Thương hiệu đồ gia dụng cao cấp' },
  { name: 'Thủ công truyền thống', slug: 'thu-cong-truyen-thong', description: 'Thương hiệu thủ công mỹ nghệ' },
  { name: 'Ngưa Trắng Silk', slug: 'ngua-trang-silk', description: 'Thương hiệu dệt may cao cấp' },
  { name: 'Handmade Việt', slug: 'handmade-viet', description: 'Thương hiệu handmade Việt Nam' },
  { name: 'Tre Việt', slug: 'tre-viet', description: 'Thương hiệu sản phẩm tre' },
];

const seedProducts = async () => {
  try {
    console.log('🔄 Bắt đầu seed dữ liệu sản phẩm...');

    // Xóa dữ liệu cũ
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});

    // Tạo categories
    console.log('📁 Tạo categories...');
    const createdCategories = await Category.insertMany(categories.map((cat, index) => ({
      ...cat,
      order: index + 1,
      isActive: true
    })));

    // Tạo brands
    console.log('🏢 Tạo brands...');
    const createdBrands = await Brand.insertMany(brands.map((brand, index) => ({
      ...brand,
      order: index + 1,
      isActive: true
    })));

    // Tạo mapping cho category và brand
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat;
    });

    const brandMap = {};
    createdBrands.forEach(brand => {
      brandMap[brand.name] = brand;
    });

    // Tạo products
    console.log('📦 Tạo products...');
    const productsToCreate = mockProducts.map(product => {
      const category = categoryMap[product.category];
      const brand = brandMap[product.brand];
      
      if (!category || !brand) {
        console.log(`⚠️ Không tìm thấy category hoặc brand cho sản phẩm: ${product.name}`);
        return null;
      }

      // Generate slug từ name
      const slug = product.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim('-');

      return {
        name: product.name,
        slug: slug,
        description: product.description,
        images: product.image,
        price: product.price,
        discount: product.discount,
        category: category._id,
        categoryName: category.name,
        brand: brand._id,
        brandName: brand.name,
        countInStock: product.countInStock,
        sold: product.selled,
        averageRating: product.rating,
        numOfReviews: Math.floor(product.selled / 5), // Giả lập số reviews
        isActive: true,
        isFeatured: product.rating >= 4.5,
        tags: [category.name, brand.name]
      };
    }).filter(product => product !== null);

    const createdProducts = await Product.insertMany(productsToCreate);

    console.log(`✅ Đã tạo thành công:`);
    console.log(`   - ${createdCategories.length} categories`);
    console.log(`   - ${createdBrands.length} brands`);
    console.log(`   - ${createdProducts.length} products`);

    return {
      categories: createdCategories,
      brands: createdBrands,
      products: createdProducts
    };
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

module.exports = {
  seedProducts,
  mockProducts,
  categories,
  brands
}; 