const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');

// Sử dụng Hugging Face API (miễn phí)
const { HfInference } = require('@huggingface/inference');

// Khởi tạo Hugging Face client (không cần API key)
const hf = new HfInference();

// @desc    Chat với AI Assistant (Free version)
// @route   POST /api/ai/chat
// @access  Public
const chatWithAssistantFree = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Tin nhắn không được để trống');
  }

  try {
    // Lấy dữ liệu sản phẩm
    const products = await Product.find({ isActive: true })
      .select('name description category categoryName brand brandName price tags specifications')
      .populate('category', 'name')
      .populate('brand', 'name')
      .limit(20); // Giảm số lượng để tối ưu

    const categories = await Category.find({ isActive: true }).select('name description');
    const brands = await Brand.find({ isActive: true }).select('name description');

    // Tạo context ngắn gọn
    const productContext = products.map(product => ({
      id: product._id,
      name: product.name,
      category: product.categoryName,
      brand: product.brandName,
      price: product.price
    }));

    // Prompt đơn giản cho model miễn phí
    const prompt = `
Bạn là trợ lý bán hàng VietTrad. Hãy tư vấn sản phẩm thủ công Việt Nam.

Sản phẩm có sẵn: ${JSON.stringify(productContext.slice(0, 10))}

Khách hàng hỏi: ${message}

Hãy trả lời ngắn gọn, thân thiện và gợi ý sản phẩm phù hợp (nếu có).
Format: [PRODUCT_ID:id] Tên sản phẩm khi gợi ý.
`;

    // Sử dụng Hugging Face text generation
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: prompt,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.7,
        return_full_text: false
      }
    });

    let aiResponse = response.generated_text || 'Xin lỗi, tôi không hiểu yêu cầu của bạn. Bạn có thể nói rõ hơn được không?';

    // Fallback response nếu model không phản hồi tốt
    if (aiResponse.length < 10) {
      aiResponse = generateFallbackResponse(message, productContext);
    }

    // Trích xuất product IDs
    const productIds = [];
    const productIdRegex = /\[PRODUCT_ID:([^\]]+)\]/g;
    let match;
    while ((match = productIdRegex.exec(aiResponse)) !== null) {
      productIds.push(match[1]);
    }

    // Lấy thông tin sản phẩm được gợi ý
    let suggestedProducts = [];
    if (productIds.length > 0) {
      suggestedProducts = await Product.find({ 
        _id: { $in: productIds },
        isActive: true 
      })
        .select('name images price originalPrice discount description shortDescription category brand averageRating numOfReviews slug')
        .populate('category', 'name')
        .populate('brand', 'name');
    }

    res.json({
      message: aiResponse,
      suggestedProducts,
      conversationId: Date.now() + Math.random().toString(36).substr(2, 9),
      note: 'Sử dụng AI miễn phí - Hugging Face'
    });

  } catch (error) {
    console.error('AI Chat Free Error:', error);
    
    // Fallback response nếu có lỗi
    const fallbackResponse = generateFallbackResponse(message, []);
    
    res.json({
      message: fallbackResponse,
      suggestedProducts: [],
      conversationId: Date.now() + Math.random().toString(36).substr(2, 9),
      note: 'Chế độ fallback - Không sử dụng AI'
    });
  }
});

// Function tạo response fallback không cần AI
function generateFallbackResponse(message, productContext) {
  const lowerMessage = message.toLowerCase();
  
  // Các từ khóa thông dụng
  const keywords = {
    'tết': 'Tôi hiểu bạn đang tìm sản phẩm cho Tết! Chúng tôi có nhiều sản phẩm truyền thống như áo dài, đồ trang trí Tết, quà tặng ý nghĩa.',
    'áo dài': 'Áo dài truyền thống là sản phẩm đặc trưng của chúng tôi. Bạn có thể xem các mẫu áo dài trong danh mục Thời trang.',
    'tre': 'Sản phẩm từ tre rất phong phú! Chúng tôi có đồ gia dụng, trang trí, và nhiều sản phẩm thủ công từ tre.',
    'quà tặng': 'Bạn đang tìm quà tặng? Chúng tôi có nhiều sản phẩm thủ công độc đáo, phù hợp làm quà.',
    'giá': 'Về giá cả, chúng tôi có sản phẩm đa dạng từ 100k đến vài triệu. Bạn có ngân sách cụ thể không?'
  };
  
  // Tìm từ khóa phù hợp
  for (const [keyword, response] of Object.entries(keywords)) {
    if (lowerMessage.includes(keyword)) {
      return response + ' Bạn có thể xem thêm trong danh mục sản phẩm hoặc liên hệ với chúng tôi để được tư vấn chi tiết!';
    }
  }
  
  // Response mặc định
  return 'Cảm ơn bạn đã quan tâm đến VietTrad! Chúng tôi chuyên cung cấp sản phẩm thủ công truyền thống Việt Nam. Bạn có thể duyệt qua các danh mục sản phẩm hoặc cho tôi biết bạn đang tìm kiếm gì cụ thể?';
}

// @desc    Tìm kiếm sản phẩm đơn giản (không cần AI)
// @route   POST /api/ai/simple-search
// @access  Public
const simpleProductSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error('Từ khóa tìm kiếm không được để trống');
  }

  try {
    // Tìm kiếm đơn giản bằng text search
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { tags: new RegExp(query, 'i') },
        { categoryName: new RegExp(query, 'i') },
        { brandName: new RegExp(query, 'i') }
      ]
    })
      .select('name images price originalPrice discount description shortDescription category brand averageRating numOfReviews slug')
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ averageRating: -1, numOfReviews: -1 })
      .limit(20);

    // Phân tích đơn giản
    const searchCriteria = {
      keywords: query,
      searchType: 'simple',
      note: 'Tìm kiếm thông thường - không sử dụng AI'
    };

    res.json({
      products,
      searchCriteria,
      totalFound: products.length,
      query: query
    });

  } catch (error) {
    console.error('Simple Search Error:', error);
    res.status(500);
    throw new Error('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!');
  }
});

module.exports = {
  chatWithAssistantFree,
  simpleProductSearch,
}; 