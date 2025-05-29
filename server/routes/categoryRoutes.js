const express = require('express');
const router = express.Router();
const Category = require('../models/categoryModel');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         id:
 *           type: string
 *           description: Category ID
 *         name:
 *           type: string
 *           description: Category name
 *         slug:
 *           type: string
 *           description: Category slug for SEO
 *         description:
 *           type: string
 *           description: Category description
 *         image:
 *           type: string
 *           description: Category image URL
 *         isActive:
 *           type: boolean
 *           description: Whether category is active
 *         parentCategory:
 *           type: string
 *           description: Parent category ID
 *         order:
 *           type: number
 *           description: Display order
 *     CreateCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Category name
 *       example:
 *         name: "Gốm sứ"
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Successfully retrieved categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let filter = {};
    
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ order: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Successfully retrieved category
 *       404:
 *         description: Category not found
 */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Successfully retrieved category
 *       404:
 *         description: Category not found
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    }).populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategory'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name } = req.body;

    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim('-');

    // Check if category name or generated slug already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }]
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: 'Tên danh mục đã tồn tại' 
      });
    }

    const category = new Category({
      name,
      slug,
      description: '',
      image: '',
      parentCategory: null,
      order: 0,
      isActive: true
    });

    const createdCategory = await category.save();

    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 */
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    }

    const { name, slug, description, image, parentCategory, order, isActive } = req.body;

    // Check if name or slug conflicts with other categories
    if (name || slug) {
      const conflictConditions = [];
      
      // Chỉ kiểm tra tên nếu tên mới khác với tên hiện tại
      if (name && name !== category.name) {
        conflictConditions.push({ name: name });
      }
      
      // Chỉ kiểm tra slug nếu slug mới khác với slug hiện tại
      if (slug && slug !== category.slug) {
        conflictConditions.push({ slug: slug });
      }

      // Chỉ thực hiện kiểm tra nếu có điều kiện conflict
      if (conflictConditions.length > 0) {
        const existingCategory = await Category.findOne({
          _id: { $ne: req.params.id },
          $or: conflictConditions
        });
        
        if (existingCategory) {
          return res.status(400).json({ 
            message: 'Tên hoặc slug danh mục đã tồn tại' 
          });
        }
      }
    }

    // Validate parent category if provided
    if (parentCategory && parentCategory !== category.parentCategory?.toString()) {
      if (parentCategory === req.params.id) {
        return res.status(400).json({ 
          message: 'Danh mục không thể là con của chính nó' 
        });
      }

      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ 
          message: 'Danh mục cha không tồn tại' 
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    const updatedCategory = await category.save();
    await updatedCategory.populate('parentCategory', 'name slug');

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Category has products or subcategories
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 */
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    }

    // Check if category has subcategories
    const subcategories = await Category.countDocuments({ 
      parentCategory: req.params.id 
    });

    if (subcategories > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa danh mục có danh mục con' 
      });
    }

    // Check if category has products
    const Product = require('../models/productModel');
    const products = await Product.countDocuments({ 
      category: req.params.id,
      isActive: true 
    });

    if (products > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa danh mục có sản phẩm' 
      });
    }

    await category.deleteOne();

    res.json({ message: 'Danh mục đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}/toggle:
 *   patch:
 *     summary: Toggle category active status (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Category not found
 */
router.patch('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    }

    category.isActive = !category.isActive;
    const updatedCategory = await category.save();

    res.json({
      message: `Danh mục đã được ${updatedCategory.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`,
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}/products:
 *   get:
 *     summary: Get products by category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
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
 *     responses:
 *       200:
 *         description: Successfully retrieved products
 *       404:
 *         description: Category not found
 */
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    }

    const Product = require('../models/productModel');
    
    const [products, totalProducts] = await Promise.all([
      Product.find({ 
        category: req.params.id,
        isActive: true 
      })
        .populate('category', 'name slug')
        .populate('brand', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Product.countDocuments({ 
        category: req.params.id,
        isActive: true 
      })
    ]);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.json({
      category,
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

module.exports = router; 