const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getLatestBlogs,
  getBlogCategories,
  addComment,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublishStatus
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: API quản lý blog/bài viết về làng nghề
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Lấy danh sách blog với phân trang và lọc
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Số lượng blog mỗi trang
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, làng gốm, làng dệt, làng dao, làng vàng bạc, làng thêu, khác]
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề, nội dung hoặc tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [publishedAt, views, likes]
 *           default: publishedAt
 *         description: Sắp xếp theo trường
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Lấy danh sách blog thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogListResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Tạo blog mới (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBlogRequest'
 *     responses:
 *       201:
 *         description: Tạo blog thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 */

/**
 * @swagger
 * /api/blogs/featured:
 *   get:
 *     summary: Lấy danh sách blog nổi bật
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Số lượng blog nổi bật
 *     responses:
 *       200:
 *         description: Lấy blog nổi bật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/blogs/latest:
 *   get:
 *     summary: Lấy danh sách blog mới nhất
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Số lượng blog mới nhất
 *     responses:
 *       200:
 *         description: Lấy blog mới nhất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/blogs/categories:
 *   get:
 *     summary: Lấy danh sách danh mục blog với số lượng
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Lấy danh mục thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlogCategory'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Lấy chi tiết blog theo slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của blog
 *         example: "lang-gom-huong-canh-noi-luu-giu-hon-gom-viet"
 *     responses:
 *       200:
 *         description: Lấy chi tiết blog thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogDetailResponse'
 *       404:
 *         description: Không tìm thấy blog
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/blogs/{slug}/comments:
 *   post:
 *     summary: Thêm bình luận vào blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug của blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCommentRequest'
 *     responses:
 *       201:
 *         description: Thêm bình luận thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Bình luận của bạn đã được gửi và đang chờ duyệt"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy blog
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Cập nhật blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBlogRequest'
 *     responses:
 *       200:
 *         description: Cập nhật blog thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy blog
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Xóa blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *     responses:
 *       200:
 *         description: Xóa blog thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Xóa bài viết thành công"
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy blog
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/blogs/{id}/publish:
 *   patch:
 *     summary: Thay đổi trạng thái xuất bản blog (Admin only)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *     responses:
 *       200:
 *         description: Thay đổi trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã xuất bản bài viết"
 *                 data:
 *                   $ref: '#/components/schemas/Blog'
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy blog
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Public routes
router.route('/')
  .get(getBlogs)
  .post(protect, admin, createBlog);

// Specific routes first (before dynamic params)
router.get('/featured', getFeaturedBlogs);
router.get('/latest', getLatestBlogs);
router.get('/categories', getBlogCategories);

// Admin routes (specific admin endpoints)
router.patch('/:id/publish', protect, admin, togglePublishStatus);

// Admin routes for CRUD operations
router.route('/:id')
  .put(protect, admin, updateBlog)
  .delete(protect, admin, deleteBlog);

// Blog detail and comments (must be last since it uses dynamic params)
router.get('/:identifier', getBlogBySlug);
router.post('/:slug/comments', addComment);

module.exports = router; 