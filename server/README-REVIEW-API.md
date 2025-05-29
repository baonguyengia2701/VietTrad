# Review API Documentation

## Tổng quan

Review API cung cấp các endpoint để quản lý đánh giá sản phẩm trong hệ thống VietTrad. API hỗ trợ đầy đủ các thao tác CRUD với authentication và authorization.

## Base URL

```
http://localhost:5000/api/reviews
```

## Authentication

Một số endpoints yêu cầu authentication bằng Bearer Token:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Lấy tất cả reviews

**GET** `/api/reviews`

**Query Parameters:**
- `page` (number, optional): Số trang (default: 1)
- `limit` (number, optional): Số reviews mỗi trang (default: 10)
- `product` (string, optional): Lọc theo Product ID
- `user` (string, optional): Lọc theo User ID
- `rating` (number, optional): Lọc theo rating (1-5)
- `isApproved` (boolean, optional): Lọc theo trạng thái duyệt

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "60f1b2b3c9e4a12345678901",
        "user": {
          "_id": "60f1b2b3c9e4a12345678902",
          "name": "Nguyễn Văn A",
          "email": "user@example.com"
        },
        "product": {
          "_id": "60f1b2b3c9e4a12345678903",
          "name": "Sản phẩm A",
          "images": ["image1.jpg"],
          "price": 100000
        },
        "rating": 5,
        "comment": "Sản phẩm tuyệt vời!",
        "isApproved": true,
        "images": [],
        "helpfulVotes": 10,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

### 2. Lấy reviews của sản phẩm

**GET** `/api/reviews/product/:productId`

**Parameters:**
- `productId` (string, required): ID của sản phẩm

**Query Parameters:**
- `page` (number, optional): Số trang (default: 1)
- `limit` (number, optional): Số reviews mỗi trang (default: 10)

**Response:** Tương tự như endpoint trên nhưng chỉ chứa reviews của sản phẩm được chỉ định.

### 3. Lấy chi tiết một review

**GET** `/api/reviews/:id`

**Parameters:**
- `id` (string, required): ID của review

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60f1b2b3c9e4a12345678901",
    "user": {
      "_id": "60f1b2b3c9e4a12345678902",
      "name": "Nguyễn Văn A",
      "email": "user@example.com"
    },
    "product": {
      "_id": "60f1b2b3c9e4a12345678903",
      "name": "Sản phẩm A",
      "images": ["image1.jpg"],
      "price": 100000
    },
    "rating": 5,
    "comment": "Sản phẩm tuyệt vời!",
    "isApproved": true,
    "images": [],
    "helpfulVotes": 10,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Tạo review mới

**POST** `/api/reviews`

**Authentication:** Required

**Request Body:**
```json
{
  "product": "60f1b2b3c9e4a12345678903",
  "rating": 5,
  "comment": "Sản phẩm tuyệt vời, chất lượng cao!",
  "images": ["https://example.com/image1.jpg"] // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được tạo thành công",
  "data": {
    "_id": "60f1b2b3c9e4a12345678901",
    "user": {
      "_id": "60f1b2b3c9e4a12345678902",
      "name": "Nguyễn Văn A",
      "email": "user@example.com"
    },
    "product": {
      "_id": "60f1b2b3c9e4a12345678903",
      "name": "Sản phẩm A",
      "images": ["image1.jpg"],
      "price": 100000
    },
    "rating": 5,
    "comment": "Sản phẩm tuyệt vời, chất lượng cao!",
    "isApproved": true,
    "images": ["https://example.com/image1.jpg"],
    "helpfulVotes": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Bạn đã đánh giá sản phẩm này rồi
- `404`: Sản phẩm không tìm thấy
- `401`: Chưa đăng nhập

### 5. Cập nhật review

**PUT** `/api/reviews/:id`

**Authentication:** Required (chỉ owner hoặc admin)

**Parameters:**
- `id` (string, required): ID của review

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Sản phẩm khá tốt",
  "images": ["https://example.com/image2.jpg"] // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được cập nhật thành công",
  "data": {
    // Updated review object
  }
}
```

### 6. Xóa review

**DELETE** `/api/reviews/:id`

**Authentication:** Required (chỉ owner hoặc admin)

**Parameters:**
- `id` (string, required): ID của review

**Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được xóa thành công"
}
```

### 7. Lấy review của user cho sản phẩm

**GET** `/api/reviews/user-review/:productId`

**Authentication:** Required

**Parameters:**
- `productId` (string, required): ID của sản phẩm

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60f1b2b3c9e4a12345678901",
    "product": {
      "_id": "60f1b2b3c9e4a12345678903",
      "name": "Sản phẩm A",
      "images": ["image1.jpg"],
      "price": 100000
    },
    "rating": 5,
    "comment": "Sản phẩm tuyệt vời!",
    "isApproved": true,
    "images": [],
    "helpfulVotes": 10,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**
- `404`: Bạn chưa đánh giá sản phẩm này

### 8. Thêm helpful vote

**PUT** `/api/reviews/:id/helpful`

**Authentication:** Required

**Parameters:**
- `id` (string, required): ID của review

**Response:**
```json
{
  "success": true,
  "message": "Đã thêm lượt hữu ích",
  "data": {
    "helpfulVotes": 11
  }
}
```

### 9. Toggle review approval (Admin only)

**PUT** `/api/reviews/:id/approve`

**Authentication:** Required (Admin only)

**Parameters:**
- `id` (string, required): ID của review

**Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được duyệt",
  "data": {
    "isApproved": true
  }
}
```

## Error Handling

API sử dụng HTTP status codes chuẩn:

- `200`: Thành công
- `201`: Tạo mới thành công
- `400`: Lỗi request không hợp lệ
- `401`: Chưa đăng nhập hoặc token không hợp lệ
- `403`: Không có quyền thực hiện hành động
- `404`: Không tìm thấy resource
- `500`: Lỗi server

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Error stack (only in development)"
}
```

## Business Logic

### Auto Rating Calculation

Khi có review mới được tạo, cập nhật hoặc xóa, hệ thống sẽ tự động tính lại:
- `averageRating`: Rating trung bình của sản phẩm
- `numOfReviews`: Tổng số reviews đã được duyệt

### Review Constraints

- Một user chỉ có thể review một sản phẩm một lần
- Rating phải từ 1 đến 5
- Comment là bắt buộc
- Chỉ những review đã được duyệt (`isApproved: true`) mới được tính vào rating trung bình

### Permission System

- **Public**: Xem reviews đã được duyệt
- **Authenticated Users**: Tạo review, xem review của mình, thêm helpful vote
- **Review Owner**: Cập nhật, xóa review của mình
- **Admin**: Duyệt/từ chối reviews, xóa bất kỳ review nào

## Frontend Integration

### React Service Example

```javascript
import { reviewService } from '../services/reviewService';

// Lấy reviews của sản phẩm
const reviews = await reviewService.getProductReviews(productId, 1, 10);

// Tạo review mới
await reviewService.addProductReview(productId, 5, "Great product!");

// Kiểm tra user đã review chưa
const userReview = await reviewService.checkUserReview(productId);
```

### Error Handling trong Frontend

```javascript
try {
  await reviewService.addProductReview(productId, rating, comment);
  // Success handling
} catch (error) {
  if (error.includes('đã đánh giá sản phẩm này rồi')) {
    // User already reviewed
  } else {
    // Other errors
  }
}
```

## Testing với Postman

### 1. Tạo review mới

```
POST http://localhost:5000/api/reviews
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "product": "60f1b2b3c9e4a12345678903",
  "rating": 5,
  "comment": "Sản phẩm tuyệt vời!"
}
```

### 2. Lấy reviews của sản phẩm

```
GET http://localhost:5000/api/reviews/product/60f1b2b3c9e4a12345678903?page=1&limit=5
```

### 3. Cập nhật review

```
PUT http://localhost:5000/api/reviews/60f1b2b3c9e4a12345678901
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Sản phẩm khá tốt"
}
```

## Swagger Documentation

API documentation có sẵn tại: `http://localhost:5000/api-docs`

Swagger UI cung cấp interface để test các endpoints trực tiếp từ browser. 