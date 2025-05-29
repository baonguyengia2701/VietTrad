const express = require('express');
const router = express.Router();
const Brand = require('../models/brandModel');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Brand:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         id:
 *           type: string
 *           description: Brand ID
 *         name:
 *           type: string
 *           description: Brand name
 *         slug:
 *           type: string
 *           description: Brand slug for SEO
 *         description:
 *           type: string
 *           description: Brand description
 *         logo:
 *           type: string
 *           description: Brand logo URL
 *         website:
 *           type: string
 *           description: Brand website URL
 *         isActive:
 *           type: boolean
 *           description: Whether brand is active
 *         order:
 *           type: number
 *           description: Display order
 *     CreateBrand:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Brand name
 *       example:
 *         name: "Làng nghề Bát Tràng"
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Get all brands
 *     tags: [Brands]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Successfully retrieved brands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 */
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let filter = {};
    
    if (active !== undefined) {
      filter.isActive = active === 'true';
    }

    const brands = await Brand.find(filter)
      .sort({ order: 1, name: 1 });

    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Successfully retrieved brand
 *       404:
 *         description: Brand not found
 */
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy' });
    }

    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/brands/slug/{slug}:
 *   get:
 *     summary: Get brand by slug
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand slug
 *     responses:
 *       200:
 *         description: Successfully retrieved brand
 *       404:
 *         description: Brand not found
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const brand = await Brand.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy' });
    }

    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Create a new brand (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBrand'
 *     responses:
 *       201:
 *         description: Brand created successfully
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

    // Check if brand name or generated slug already exists
    const existingBrand = await Brand.findOne({
      $or: [{ name }, { slug }]
    });

    if (existingBrand) {
      return res.status(400).json({ 
        message: 'Tên thương hiệu đã tồn tại' 
      });
    }

    const brand = new Brand({
      name,
      slug,
      description: '',
      logo: '',
      website: '',
      order: 0,
      isActive: true
    });

    const createdBrand = await brand.save();

    res.status(201).json(createdBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     summary: Update a brand (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBrand'
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Brand not found
 */
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy' });
    }

    const { name, slug, description, logo, website, order, isActive } = req.body;

    // Check if name or slug conflicts with other brands
    if (name || slug) {
      const conflictQuery = {
        _id: { $ne: req.params.id }
      };
      
      if (name && name !== brand.name) {
        conflictQuery.name = name;
      }
      
      if (slug && slug !== brand.slug) {
        conflictQuery.slug = slug;
      }

      const existingBrand = await Brand.findOne(conflictQuery);
      if (existingBrand) {
        return res.status(400).json({ 
          message: 'Tên hoặc slug thương hiệu đã tồn tại' 
        });
      }
    }

    // Update fields
    if (name) brand.name = name;
    if (slug) brand.slug = slug;
    if (description !== undefined) brand.description = description;
    if (logo !== undefined) brand.logo = logo;
    if (website !== undefined) brand.website = website;
    if (order !== undefined) brand.order = order;
    if (isActive !== undefined) brand.isActive = isActive;

    const updatedBrand = await brand.save();

    res.json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     summary: Delete a brand (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       400:
 *         description: Brand has products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Brand not found
 */
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy' });
    }

    // Check if brand has products
    const Product = require('../models/productModel');
    const products = await Product.countDocuments({ 
      brand: req.params.id,
      isActive: true 
    });

    if (products > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa thương hiệu có sản phẩm' 
      });
    }

    await brand.deleteOne();

    res.json({ message: 'Thương hiệu đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/brands/{id}/toggle:
 *   patch:
 *     summary: Toggle brand active status (Admin only)
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Brand not found
 */
router.patch('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy' });
    }

    brand.isActive = !brand.isActive;
    const updatedBrand = await brand.save();

    res.json({
      message: `Thương hiệu đã được ${updatedBrand.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`,
      brand: updatedBrand
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/brands/{id}/products:
 *   get:
 *     summary: Get products by brand
 *     tags: [Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
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
 *         description: Brand not found
 */
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 8 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Thương hiệu không tìm thấy' });
    }

    const Product = require('../models/productModel');
    
    const [products, totalProducts] = await Promise.all([
      Product.find({ 
        brand: req.params.id,
        isActive: true 
      })
        .populate('category', 'name slug')
        .populate('brand', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Product.countDocuments({ 
        brand: req.params.id,
        isActive: true 
      })
    ]);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.json({
      brand,
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