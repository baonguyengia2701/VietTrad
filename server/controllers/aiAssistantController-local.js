const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');

// Local AI Assistant - Không cần API key, không cần internet
// Sử dụng rule-based system và keyword matching

// @desc    Chat với Local AI Assistant (Offline)
// @route   POST /api/ai/chat-local
// @access  Public
const chatWithLocalAI = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Tin nhắn không được để trống');
  }

  try {
    // Phân tích tin nhắn và tạo response
    console.log('💬 User message:', message);
    const analysis = analyzeMessage(message);
    console.log('🔍 Analysis result:', analysis);
    
    const products = await findRelevantProducts(analysis);
    const response = generateResponse(analysis, products);

    res.json({
      message: response.message,
      suggestedProducts: products.slice(0, 5), // Tối đa 5 sản phẩm
      conversationId: Date.now() + Math.random().toString(36).substr(2, 9),
      note: 'Trợ lý AI offline - Không cần internet',
      debug: {
        analysis: analysis,
        productsFound: products.length
      }
    });

  } catch (error) {
    console.error('Local AI Error:', error);
    res.status(500);
    throw new Error('Có lỗi xảy ra. Vui lòng thử lại!');
  }
});

// Phân tích tin nhắn của người dùng
function analyzeMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  const analysis = {
    intent: 'general',
    categories: [],
    priceRange: null,
    materials: [],
    occasions: [],
    keywords: [],
    sentiment: 'neutral'
  };

  // 1. Phát hiện ý định (Intent Detection)
  const intents = {
    search: ['tìm', 'tìm kiếm', 'muốn', 'cần', 'có', 'bán'],
    price: ['giá', 'bao nhiêu', 'rẻ', 'đắt', 'tiền', 'k', 'triệu'],
    recommendation: ['gợi ý', 'tư vấn', 'nên', 'chọn', 'phù hợp'],
    greeting: ['chào', 'hello', 'hi', 'xin chào'],
    thanks: ['cảm ơn', 'thanks', 'thank you']
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      analysis.intent = intent;
      break;
    }
  }

  // 2. Phát hiện danh mục
  const categories = {
    'áo dài': ['áo dài', 'áo truyền thống'],
    'thủ công': ['thủ công', 'làm tay', 'handmade'],
    'trang trí': ['trang trí', 'decor', 'decoration'],
    'gia dụng': ['gia dụng', 'nhà bếp', 'kitchen', 'bát', 'chén', 'đĩa', 'bộ ăn'],
    'trang sức': ['trang sức', 'jewelry', 'đồ trang sức'],
    'quà tặng': ['quà', 'gift', 'tặng', 'set', 'bộ quà'],
    'gốm sứ': ['gốm', 'sứ', 'ceramic', 'bát tràng', 'chu đậu']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      analysis.categories.push(category);
    }
  }

  // 3. Phát hiện khoảng giá
  const priceRegex = /(\d+)k?(?:\s*-\s*(\d+)k?)?/g;
  const priceMatches = [...lowerMessage.matchAll(priceRegex)];
  
  if (priceMatches.length > 0) {
    const match = priceMatches[0];
    const min = parseInt(match[1]) * (match[1].includes('k') ? 1000 : 1);
    const max = match[2] ? parseInt(match[2]) * (match[2].includes('k') ? 1000 : 1) : min * 2;
    
    analysis.priceRange = { min, max };
  }

  // Phát hiện giá dưới/trên
  if (lowerMessage.includes('dưới')) {
    const match = lowerMessage.match(/dưới\s*(\d+)k?/);
    if (match) {
      const price = parseInt(match[1]) * (match[0].includes('k') ? 1000 : 1);
      analysis.priceRange = { min: 0, max: price };
    }
  }

  if (lowerMessage.includes('trên')) {
    const match = lowerMessage.match(/trên\s*(\d+)k?/);
    if (match) {
      const price = parseInt(match[1]) * (match[0].includes('k') ? 1000 : 1);
      analysis.priceRange = { min: price, max: 10000000 };
    }
  }

  // 4. Phát hiện chất liệu
  const materials = ['tre', 'nứa', 'gỗ', 'lụa', 'cotton', 'vải', 'ceramic', 'gốm'];
  analysis.materials = materials.filter(material => lowerMessage.includes(material));

  // 5. Phát hiện dịp
  const occasions = {
    'tết': ['tết', 'năm mới', 'xuân'],
    'cưới': ['cưới', 'wedding', 'hôn lễ'],
    '8/3': ['8/3', 'phụ nữ', 'women'],
    'sinh nhật': ['sinh nhật', 'birthday']
  };

  for (const [occasion, keywords] of Object.entries(occasions)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      analysis.occasions.push(occasion);
    }
  }

  return analysis;
}

// Tìm sản phẩm liên quan dựa trên phân tích
async function findRelevantProducts(analysis) {
  let query = { isActive: true };
  let searchQueries = [];

  try {
    // Tìm theo danh mục
    if (analysis.categories.length > 0) {
      for (const cat of analysis.categories) {
        searchQueries.push(
          { categoryName: new RegExp(cat, 'i') },
          { name: new RegExp(cat, 'i') },
          { tags: { $in: [new RegExp(cat, 'i')] } }
        );
      }
    }

    // Tìm theo chất liệu
    if (analysis.materials.length > 0) {
      for (const material of analysis.materials) {
        searchQueries.push(
          { 'specifications.material': new RegExp(material, 'i') },
          { name: new RegExp(material, 'i') },
          { tags: { $in: [new RegExp(material, 'i')] } }
        );
      }
    }

    // Nếu có search queries, thêm vào $or
    if (searchQueries.length > 0) {
      query.$or = searchQueries;
    }

    // Tìm theo khoảng giá
    if (analysis.priceRange) {
      query.price = {
        $gte: analysis.priceRange.min,
        $lte: analysis.priceRange.max
      };
    }

    console.log('🔍 Local AI Query:', JSON.stringify(query, null, 2));

    const products = await Product.find(query)
      .select('_id name images price originalPrice discount description shortDescription category brand averageRating numOfReviews slug tags specifications')
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ averageRating: -1, numOfReviews: -1 })
      .limit(10);

    // Debug log để kiểm tra dữ liệu
    if (products.length > 0) {
      console.log('📦 Sample product data:', {
        name: products[0].name,
        images: products[0].images,
        price: products[0].price,
        category: products[0].category,
        slug: products[0].slug
      });
    }

    console.log(`✅ Found ${products.length} products`);
    return products;

  } catch (error) {
    console.error('❌ Error finding products:', error);
    
    // Fallback: Tìm tất cả sản phẩm active
    try {
      const fallbackProducts = await Product.find({ isActive: true })
        .select('_id name images price originalPrice discount description shortDescription category brand averageRating numOfReviews slug')
        .populate('category', 'name')
        .populate('brand', 'name')
        .sort({ averageRating: -1 })
        .limit(5);
      
      console.log(`🔄 Fallback: Found ${fallbackProducts.length} products`);
      return fallbackProducts;
    } catch (fallbackError) {
      console.error('❌ Fallback error:', fallbackError);
      return [];
    }
  }
}

// Tạo response dựa trên phân tích và sản phẩm
function generateResponse(analysis, products) {
  let message = '';

  switch (analysis.intent) {
    case 'greeting':
      message = 'Xin chào! Tôi là trợ lý của VietTrad. Tôi có thể giúp bạn tìm kiếm sản phẩm thủ công truyền thống Việt Nam. Bạn đang tìm kiếm gì hôm nay?';
      break;

    case 'thanks':
      message = 'Rất vui được giúp đỡ bạn! Nếu có thêm câu hỏi nào khác, đừng ngại hỏi nhé. Chúc bạn mua sắm vui vẻ!';
      break;

    case 'search':
    case 'recommendation':
      message = generateProductRecommendation(analysis, products);
      break;

    case 'price':
      message = generatePriceResponse(analysis, products);
      break;

    default:
      if (products.length > 0) {
        message = `Dựa trên tin nhắn của bạn, tôi tìm thấy ${products.length} sản phẩm có thể phù hợp:\n\n`;
        products.slice(0, 3).forEach((product, index) => {
          message += `${index + 1}. [PRODUCT_ID:${product._id}] ${product.name} - ${product.price.toLocaleString()}đ\n`;
        });
        message += '\nBạn có thể click vào sản phẩm để xem chi tiết nhé!';
      } else {
        message = 'Tôi hiểu bạn quan tâm đến sản phẩm của chúng tôi. Bạn có thể cho tôi biết cụ thể hơn về sản phẩm bạn muốn tìm không? Ví dụ: "Tôi muốn tìm quà tặng Tết", "Sản phẩm gốm sứ", "Áo dài truyền thống"...';
      }
  }

  return { message };
}

function generateProductRecommendation(analysis, products) {
  let message = '';

  if (analysis.categories.length > 0) {
    message += `Tôi hiểu bạn quan tâm đến ${analysis.categories.join(', ')}. `;
  }

  if (analysis.priceRange) {
    message += `Với ngân sách từ ${analysis.priceRange.min.toLocaleString()}đ đến ${analysis.priceRange.max.toLocaleString()}đ, `;
  }

  if (analysis.occasions.length > 0) {
    message += `Cho dịp ${analysis.occasions.join(', ')}, `;
  }

  if (products.length > 0) {
    message += `tôi gợi ý ${products.length} sản phẩm sau đây:\n\n`;
    
    products.slice(0, 3).forEach((product, index) => {
      message += `${index + 1}. [PRODUCT_ID:${product._id}] ${product.name} - ${product.price.toLocaleString()}đ\n`;
      message += `   ${product.shortDescription || product.description.substring(0, 100)}...\n\n`;
    });

    message += 'Bạn có thể click vào sản phẩm để xem chi tiết nhé!';
  } else {
    message += 'rất tiếc tôi không tìm thấy sản phẩm phù hợp. Bạn có thể thử với từ khóa khác hoặc mở rộng tiêu chí tìm kiếm không?';
  }

  return message;
}

function generatePriceResponse(analysis, products) {
  if (products.length === 0) {
    return 'Tôi cần thêm thông tin về sản phẩm bạn quan tâm để có thể tư vấn giá chính xác. Bạn có thể nói rõ hơn về loại sản phẩm không?';
  }

  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  let message = `Về giá cả của các sản phẩm liên quan:\n\n`;
  message += `• Giá thấp nhất: ${minPrice.toLocaleString()}đ\n`;
  message += `• Giá cao nhất: ${maxPrice.toLocaleString()}đ\n`;
  message += `• Giá trung bình: ${Math.round(avgPrice).toLocaleString()}đ\n\n`;
  
  message += `Dưới đây là một số sản phẩm cụ thể:\n`;
  
  products.slice(0, 3).forEach((product, index) => {
    message += `${index + 1}. [PRODUCT_ID:${product._id}] ${product.name} - ${product.price.toLocaleString()}đ\n`;
  });

  return message;
}

module.exports = {
  chatWithLocalAI,
}; 