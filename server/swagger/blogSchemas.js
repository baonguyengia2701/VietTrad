/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *         isAdmin:
 *           type: boolean
 * 
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - excerpt
 *         - content
 *         - featuredImage
 *         - author
 *       properties:
 *         _id:
 *           type: string
 *           description: ID duy nhất của blog
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           maxLength: 200
 *           description: Tiêu đề bài viết
 *           example: "Làng gốm Hương Canh - Nơi lưu giữ hồn gốm Việt"
 *         slug:
 *           type: string
 *           description: Slug của bài viết (tự động tạo từ title)
 *           example: "lang-gom-huong-canh-noi-luu-giu-hon-gom-viet"
 *         excerpt:
 *           type: string
 *           maxLength: 500
 *           description: Tóm tắt bài viết
 *           example: "Làng gốm Hương Canh, xã Dữu Lâu, thành phố Việt Trì..."
 *         content:
 *           type: string
 *           description: Nội dung đầy đủ của bài viết (HTML)
 *           example: "<h2>Lịch sử hình thành</h2><p>Làng gốm Hương Canh...</p>"
 *         featuredImage:
 *           type: string
 *           description: URL hình ảnh đại diện
 *           example: "https://example.com/featured-image.jpg"
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               caption:
 *                 type: string
 *           description: Mảng hình ảnh bổ sung
 *         author:
 *           $ref: '#/components/schemas/User'
 *         category:
 *           type: string
 *           enum: ['làng gốm', 'làng dệt', 'làng dao', 'làng vàng bạc', 'làng thêu', 'khác']
 *           description: Danh mục của bài viết
 *           example: "làng gốm"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Thẻ tag của bài viết
 *           example: ["gốm sứ", "truyền thống", "Phú Thọ"]
 *         location:
 *           type: object
 *           properties:
 *             province:
 *               type: string
 *               example: "Phú Thọ"
 *             district:
 *               type: string
 *               example: "Việt Trì"
 *             ward:
 *               type: string
 *               example: "Dữu Lâu"
 *             address:
 *               type: string
 *               example: "Làng Hương Canh, xã Dữu Lâu"
 *         craftsman:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "Nghệ nhân Nguyễn Văn Thành"
 *             age:
 *               type: number
 *               example: 68
 *             experience:
 *               type: string
 *               example: "45 năm kinh nghiệm"
 *             story:
 *               type: string
 *               example: "Ông Thành bắt đầu học nghề từ năm 15 tuổi..."
 *         isPublished:
 *           type: boolean
 *           description: Trạng thái xuất bản
 *           example: true
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian xuất bản
 *         views:
 *           type: number
 *           description: Số lượt xem
 *           example: 1250
 *         likes:
 *           type: number
 *           description: Số lượt thích
 *           example: 89
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogComment'
 *         seo:
 *           type: object
 *           properties:
 *             metaTitle:
 *               type: string
 *             metaDescription:
 *               type: string
 *             keywords:
 *               type: array
 *               items:
 *                 type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     BlogComment:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         name:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         email:
 *           type: string
 *           format: email
 *           example: "nguyenvana@email.com"
 *         content:
 *           type: string
 *           example: "Bài viết rất hay và bổ ích!"
 *         isApproved:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     BlogListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             blogs:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 *             page:
 *               type: number
 *               example: 1
 *             pages:
 *               type: number
 *               example: 5
 *             total:
 *               type: number
 *               example: 50
 *             hasNextPage:
 *               type: boolean
 *               example: true
 *             hasPrevPage:
 *               type: boolean
 *               example: false
 * 
 *     BlogDetailResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             blog:
 *               $ref: '#/components/schemas/Blog'
 *             relatedBlogs:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Blog'
 * 
 *     BlogCategory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "làng gốm"
 *         count:
 *           type: number
 *           example: 5
 * 
 *     CreateBlogRequest:
 *       type: object
 *       required:
 *         - title
 *         - excerpt
 *         - content
 *         - featuredImage
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *           example: "Tiêu đề bài viết mới"
 *         excerpt:
 *           type: string
 *           maxLength: 500
 *           example: "Tóm tắt ngắn gọn về bài viết"
 *         content:
 *           type: string
 *           example: "<p>Nội dung đầy đủ của bài viết</p>"
 *         featuredImage:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         category:
 *           type: string
 *           enum: ['làng gốm', 'làng dệt', 'làng dao', 'làng vàng bạc', 'làng thêu', 'khác']
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         location:
 *           type: object
 *           properties:
 *             province:
 *               type: string
 *             district:
 *               type: string
 *             ward:
 *               type: string
 *             address:
 *               type: string
 *         craftsman:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             age:
 *               type: number
 *             experience:
 *               type: string
 *             story:
 *               type: string
 *         isPublished:
 *           type: boolean
 *           default: false
 *         seo:
 *           type: object
 *           properties:
 *             metaTitle:
 *               type: string
 *             metaDescription:
 *               type: string
 *             keywords:
 *               type: array
 *               items:
 *                 type: string
 * 
 *     AddCommentRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - content
 *       properties:
 *         name:
 *           type: string
 *           example: "Nguyễn Văn A"
 *         email:
 *           type: string
 *           format: email
 *           example: "nguyenvana@email.com"
 *         content:
 *           type: string
 *           example: "Bài viết rất hay và bổ ích!"
 * 
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Thao tác thành công"
 *         data:
 *           type: object
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Có lỗi xảy ra"
 */

module.exports = {}; 