const OpenAI = require('openai');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');

// Khởi tạo OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Chat với AI Assistant để tìm sản phẩm
// @route   POST /api/ai/chat
// @access  Public
const chatWithAssistant = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Tin nhắn không được để trống');
  }

  try {
    // Lấy dữ liệu sản phẩm để AI có thể tham khảo
    const products = await Product.find({ isActive: true })
      .select('name description category categoryName brand brandName price tags specifications')
      .populate('category', 'name')
      .populate('brand', 'name')
      .limit(50);

    const categories = await Category.find({ isActive: true }).select('name description');
    const brands = await Brand.find({ isActive: true }).select('name description');

    // Tạo context cho AI về sản phẩm
    const productContext = products.map(product => ({
      id: product._id,
      name: product.name,
      description: product.description,
      category: product.categoryName,
      brand: product.brandName,
      price: product.price,
      tags: product.tags,
      material: product.specifications?.material,
      origin: product.specifications?.origin
    }));

    const systemPrompt = `
Bạn là trợ lý AI thông minh của VietTrad - nền tảng thương mại điện tử chuyên về sản phẩm thủ công truyền thống Việt Nam.

NHIỆM VỤ:
- Giúp khách hàng tìm sản phẩm phù hợp dựa trên nhu cầu của họ
- Tư vấn sản phẩm một cách thân thiện và chuyên nghiệp
- Cung cấp thông tin chi tiết về sản phẩm, giá cả, chất liệu
- Gợi ý sản phẩm thay thế hoặc tương tự

DANH MỤC SẢN PHẨM: ${JSON.stringify(categories)}
THƯƠNG HIỆU: ${JSON.stringify(brands)}
SẢN PHẨM HIỆN CÓ: ${JSON.stringify(productContext)}

QUY TÁC TRỰC TIẾP:
1. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
2. Khi tìm được sản phẩm phù hợp, đưa ra tối đa 3-5 gợi ý tốt nhất
3. Bao gồm ID sản phẩm trong phản hồi để frontend có thể hiển thị
4. Giải thích tại sao sản phẩm phù hợp với nhu cầu của khách hàng
5. Hỏi thêm thông tin nếu cần để tư vấn chính xác hơn

ĐỊNH DẠNG PHẢN HỒI:
Khi gợi ý sản phẩm, sử dụng format sau:
[PRODUCT_ID:product_id_here] Tên sản phẩm - Giá - Lý do phù hợp

Ví dụ:
[PRODUCT_ID:64f123abc] Áo dài truyền thống - 1,200,000đ - Phù hợp cho dịp Tết, chất liệu lụa cao cấp
`;

    // Tạo cuộc hội thoại với OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Trích xuất product IDs từ phản hồi của AI
    const productIds = [];
    const productIdRegex = /\[PRODUCT_ID:([^\]]+)\]/g;
    let match;
    while ((match = productIdRegex.exec(aiResponse)) !== null) {
      productIds.push(match[1]);
    }

    // Lấy thông tin chi tiết của các sản phẩm được gợi ý
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
      conversationId: Date.now() + Math.random().toString(36).substr(2, 9)
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500);
    throw new Error('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại!');
  }
});

// @desc    Tìm kiếm sản phẩm thông minh bằng AI
// @route   POST /api/ai/smart-search
// @access  Public
const smartProductSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    res.status(400);
    throw new Error('Từ khóa tìm kiếm không được để trống');
  }

  try {
    // Sử dụng AI để phân tích ý định tìm kiếm
    const searchAnalysisPrompt = `
Phân tích ý định tìm kiếm của người dùng và trả về JSON với các thông tin sau:
- category: danh mục sản phẩm (nếu có)
- priceRange: khoảng giá mong muốn (nếu có)
- material: chất liệu mong muốn (nếu có)
- occasion: dịp sử dụng (nếu có)
- keywords: từ khóa chính để tìm kiếm
- searchType: loại tìm kiếm (product, category, brand, general)

Truy vấn của người dùng: "${query}"

Trả về chỉ JSON, không có text khác:
`;

    const analysisCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: searchAnalysisPrompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    let searchCriteria;
    try {
      searchCriteria = JSON.parse(analysisCompletion.choices[0].message.content);
    } catch (parseError) {
      // Fallback nếu AI không trả về JSON hợp lệ
      searchCriteria = {
        keywords: query,
        searchType: 'general'
      };
    }

    // Xây dựng query MongoDB dựa trên phân tích của AI
    let mongoQuery = { isActive: true };
    let sortOptions = {};

    // Text search
    if (searchCriteria.keywords) {
      mongoQuery.$text = { $search: searchCriteria.keywords };
      sortOptions.score = { $meta: 'textScore' };
    }

    // Price range
    if (searchCriteria.priceRange) {
      if (searchCriteria.priceRange.min) mongoQuery.price = { $gte: searchCriteria.priceRange.min };
      if (searchCriteria.priceRange.max) {
        mongoQuery.price = { ...mongoQuery.price, $lte: searchCriteria.priceRange.max };
      }
    }

    // Material
    if (searchCriteria.material) {
      mongoQuery['specifications.material'] = new RegExp(searchCriteria.material, 'i');
    }

    // Category
    if (searchCriteria.category) {
      mongoQuery.categoryName = new RegExp(searchCriteria.category, 'i');
    }

    // Thực hiện tìm kiếm
    const products = await Product.find(mongoQuery)
      .select('name images price originalPrice discount description shortDescription category brand averageRating numOfReviews slug specifications tags')
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ ...sortOptions, averageRating: -1, numOfReviews: -1 })
      .limit(20);

    res.json({
      products,
      searchCriteria,
      totalFound: products.length,
      query: query
    });

  } catch (error) {
    console.error('Smart Search Error:', error);
    res.status(500);
    throw new Error('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại!');
  }
});

// @desc    Lấy gợi ý sản phẩm tương tự
// @route   POST /api/ai/similar-products
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('ID sản phẩm không được để trống');
  }

  try {
    // Lấy thông tin sản phẩm gốc
    const baseProduct = await Product.findById(productId)
      .populate('category', 'name')
      .populate('brand', 'name');

    if (!baseProduct) {
      res.status(404);
      throw new Error('Không tìm thấy sản phẩm');
    }

    // Tìm sản phẩm tương tự dựa trên category, brand, price range, tags
    const priceRange = {
      min: baseProduct.price * 0.7,
      max: baseProduct.price * 1.3
    };

    const similarProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: baseProduct.category },
        { brand: baseProduct.brand },
        { 
          price: { 
            $gte: priceRange.min, 
            $lte: priceRange.max 
          }
        },
        { tags: { $in: baseProduct.tags } }
      ]
    })
      .select('name images price originalPrice discount description shortDescription category brand averageRating numOfReviews slug')
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort({ averageRating: -1, numOfReviews: -1 })
      .limit(8);

    res.json({
      baseProduct: {
        id: baseProduct._id,
        name: baseProduct.name,
        category: baseProduct.categoryName,
        brand: baseProduct.brandName,
        price: baseProduct.price
      },
      similarProducts,
      totalFound: similarProducts.length
    });

  } catch (error) {
    console.error('Similar Products Error:', error);
    res.status(500);
    throw new Error('Có lỗi xảy ra khi tìm sản phẩm tương tự. Vui lòng thử lại!');
  }
});

module.exports = {
  chatWithAssistant,
  smartProductSearch,
  getSimilarProducts,
}; 