const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');
const Review = require('../models/reviewModel');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Product ID (auto-generated)
 *           readOnly: true
 *         name:
 *           type: string
 *           description: Product name
 *         slug:
 *           type: string
 *           description: Product slug for SEO (auto-generated from name)
 *           readOnly: true
 *         description:
 *           type: string
 *           description: Product description
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Product image URLs
 *         price:
 *           type: number
 *           description: Product price
 *         discount:
 *           type: number
 *           description: Discount percentage (0-100)
 *         category:
 *           type: string
 *           description: Category ID
 *         categoryName:
 *           type: string
 *           description: Category name (auto-populated)
 *           readOnly: true
 *         brand:
 *           type: string
 *           description: Brand ID
 *         brandName:
 *           type: string
 *           description: Brand name (auto-populated)
 *           readOnly: true
 *         countInStock:
 *           type: number
 *           description: Stock quantity
 *         variants:
 *           type: object
 *           properties:
 *             title:
 *               type: array
 *               items:
 *                 type: string
 *               description: Danh sách các tiêu đề của sản phẩm
 *             size:
 *               type: array
 *               items:
 *                 type: string
 *               description: Danh sách các kích thước của sản phẩm
 *           description: Các biến thể của sản phẩm
 *         sold:
 *           type: number
 *           description: Number of items sold
 *           readOnly: true
 *         averageRating:
 *           type: number
 *           description: Average rating (0-5)
 *           readOnly: true
 *         numOfReviews:
 *           type: number
 *           description: Number of reviews
 *           readOnly: true
 *         discountedPrice:
 *           type: number
 *           description: Price after discount (calculated)
 *           readOnly: true
 *         isFeatured:
 *           type: boolean
 *           description: Whether product is featured
 *         isActive:
 *           type: boolean
 *           description: Whether product is active
 *           readOnly: true
 *     CreateProduct:
 *       type: object
 *       required:
 *         - name
 *         - images
 *         - price
 *         - description
 *         - countInStock
 *         - brand
 *         - category
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Product image URLs
 *         price:
 *           type: number
 *           description: Product price
 *         discount:
 *           type: number
 *           description: Discount percentage (0-100)
 *           default: 0
 *         description:
 *           type: string
 *           description: Product description
 *         countInStock:
 *           type: number
 *           description: Stock quantity
 *         brand:
 *           type: string
 *           description: Brand ID (must be a valid brand ObjectId)
 *         category:
 *           type: string
 *           description: Category ID (must be a valid category ObjectId)
 *         variants:
 *           type: object
 *           required:
 *             - title
 *             - size
 *           properties:
 *             title:
 *               type: array
 *               items:
 *                 type: string
 *               description: Danh sách các tiêu đề của sản phẩm
 *             size:
 *               type: array
 *               items:
 *                 type: string
 *               description: Danh sách các kích thước của sản phẩm
 *           description: Các biến thể của sản phẩm
 *       example:
 *         name: "Bình Hoa Men San Hô Tráng, Lọ Hoa Đẹp Decor Gốm Sứ Bát Tràng"
 *         images: [
 *           "https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6nr5y3p5lco4c.webp",
 *           "https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6nr5y3p1dmg30.webp"
 *         ]
 *         price: 280000
 *         discount: 15
 *         description: "Các mẫu bình hoa đều là hàng thủ công mỹ nghệ bằng chính tay của nghệ nhân làng gốm cổ truyền Bát Tràng. Các lọ có thể thay đổi 5% kích thước do nhiệt độ lửa trong lò không ổn định."
 *         countInStock: 5
 *         brand: "60f1b2b3c9e4a12345678901"
 *         category: "60f1b2b3c9e4a12345678902"
 *         variants: {
 *           title: ["Đũa trắc duôi trai vuông", "Đũa trắc duôi trai tròn"],
 *           size: ["Gắc con cá trai nâu", "Gắc con cá trai đen"]
 *         }
 *     UpdateProduct:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Product name
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Product image URLs
 *         price:
 *           type: number
 *           description: Product price
 *         discount:
 *           type: number
 *           description: Discount percentage (0-100)
 *         description:
 *           type: string
 *           description: Product description
 *         countInStock:
 *           type: number
 *           description: Stock quantity
 *         brand:
 *           type: string
 *           description: Brand ID (must be a valid brand ObjectId)
 *         category:
 *           type: string
 *           description: Category ID (must be a valid category ObjectId)
 *         isActive:
 *           type: boolean
 *           description: Whether product is active
 *         variants:
 *           type: object
 *           required:
 *             - title
 *             - size
 *           properties:
 *             title:
 *               type: array
 *               items:
 *                 type: string
 *               description: Danh sách các tiêu đề của sản phẩm
 *             size:
 *               type: array
 *               items:
 *                 type: string
 *               description: Danh sách các kích thước của sản phẩm
 *           description: Các biến thể của sản phẩm
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filtering and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, price_asc, price_desc, bestseller, rating]
 *           default: newest
 *         description: Sort option
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive products (admin only)
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      category,
      brand,
      minPrice,
      maxPrice,
      sort = 'newest',
      search,
      includeInactive = false
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    let filter = {};
    
    // Only filter by isActive if not including inactive products
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Category filter
    if (category && category !== 'all') {
      filter.categoryName = category;
    }

    // Brand filter
    if (brand && brand !== 'all') {
      filter.brandName = brand;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { categoryName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'bestseller':
        sortOptions = { sold: -1, averageRating: -1 };
        break;
      case 'rating':
        sortOptions = { averageRating: -1, numOfReviews: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    // Get products with pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('brand', 'name slug')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.json({
      products,
      pagination: {
        page: pageNumber,
        pages: totalPages,
        total: totalProducts,
        limit: limitNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all active categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug')
      .sort({ order: 1, name: 1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/brands:
 *   get:
 *     summary: Get all active brands
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Successfully retrieved brands
 */
router.get('/brands', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .select('name slug')
      .sort({ order: 1, name: 1 });
    
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Successfully retrieved featured products
 */
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.findFeatured(parseInt(limit));
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/bestsellers:
 *   get:
 *     summary: Get bestselling products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 8
 *         description: Number of products to return
 *     responses:
 *       200:
 *         description: Successfully retrieved bestselling products
 */
router.get('/bestsellers', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const products = await Product.findBestsellers(parseInt(limit));
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Successfully retrieved product
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('brand', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}/related:
 *   get:
 *     summary: Get related products
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *         description: Number of related products to return
 *     responses:
 *       200:
 *         description: Successfully retrieved related products
 *       404:
 *         description: Product not found
 */
router.get('/:id/related', async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }

    const relatedProducts = await Product.findRelatedProducts(
      product._id,
      product.category,
      parseInt(limit)
    );

    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews
 *       404:
 *         description: Product not found
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }

    const [reviews, totalReviews] = await Promise.all([
      Review.find({ product: req.params.id, isApproved: true })
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Review.countDocuments({ product: req.params.id, isApproved: true })
    ]);

    const totalPages = Math.ceil(totalReviews / limitNumber);

    res.json({
      reviews,
      pagination: {
        page: pageNumber,
        pages: totalPages,
        total: totalReviews,
        limit: limitNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   post:
 *     summary: Add a review for a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: req.params.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const review = new Review({
      user: req.user._id,
      product: req.params.id,
      rating: Number(rating),
      comment
    });

    await review.save();

    res.status(201).json({ message: 'Đánh giá đã được thêm thành công', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     description: |
 *       Create a new product. You need valid category and brand ObjectIDs.
 *       To get real IDs:
 *       - Categories: GET /api/products/categories
 *       - Brands: GET /api/products/brands
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      name,
      price,
      images,
      brand,
      category,
      countInStock,
      description,
      discount,
      variants
    } = req.body;

    // Get category and brand names
    const [categoryDoc, brandDoc] = await Promise.all([
      Category.findById(category),
      Brand.findById(brand)
    ]);

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Danh mục không tồn tại' });
    }

    if (!brandDoc) {
      return res.status(400).json({ message: 'Thương hiệu không tồn tại' });
    }

    const product = new Product({
      name,
      price,
      images,
      brand,
      brandName: brandDoc.name,
      category,
      categoryName: categoryDoc.name,
      countInStock,
      description,
      discount: discount || 0,
      variants: variants || {},
      
      // Set default values for other fields
      tags: [categoryDoc.name, brandDoc.name],
      specifications: {
        origin: 'Vietnam'
      },
      isFeatured: false
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProduct'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }

    const {
      name,
      description,
      images,
      price,
      discount,
      category,
      brand,
      countInStock,
      isActive,
      variants
    } = req.body;

    // Update category and brand names if they changed
    if (category && category !== product.category.toString()) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(400).json({ message: 'Danh mục không tồn tại' });
      }
      product.category = category;
      product.categoryName = categoryDoc.name;
    }

    if (brand && brand !== product.brand.toString()) {
      const brandDoc = await Brand.findById(brand);
      if (!brandDoc) {
        return res.status(400).json({ message: 'Thương hiệu không tồn tại' });
      }
      product.brand = brand;
      product.brandName = brandDoc.name;
    }

    // Update other fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (images) product.images = images;
    if (price) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (isActive !== undefined) product.isActive = isActive;
    if (variants) product.variants = variants;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({ message: 'Sản phẩm đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 