# Checkout & Payment API Documentation

## Vấn đề đã được sửa

### 🚫 **Lỗi Cast to ObjectId failed**
**Root Cause:** Frontend gửi toàn bộ object Product thay vì chỉ `product._id` trong order items.

**Solutions:**
1. **Order Validation Middleware**: Tạo `orderValidation.js` để sanitize và validate order data
2. **Improved Controller Logic**: Sửa `orderController.js` để handle multiple product ID formats
3. **Dedicated Checkout API**: Tạo riêng checkout flow để xử lý payment process

## API Endpoints

### 🛒 **Checkout Calculation**
```http
POST /api/checkout/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "cartItems": [
    {
      "product": "6835a5f82e1006edec7b2fc2", // hoặc full object
      "name": "Khăn kẻ đội đầu thổ cẩm",
      "quantity": 2,
      "selectedVariant": {
        "title": "Màu xanh",
        "size": "20cm x 100cm"
      }
    }
  ],
  "shippingMethod": "standard", // "standard" | "express"
  "voucherCode": "NEWUSER" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "totalItems": 2,
    "itemsPrice": 160000,
    "shippingPrice": 30000,
    "voucherCode": "NEWUSER",
    "voucherDiscount": 16000,
    "totalPrice": 174000,
    "shippingMethod": "standard"
  }
}
```

### 💳 **Payment Methods**
```http
GET /api/checkout/payment-methods
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cod",
      "name": "Thanh toán khi nhận hàng (COD)",
      "description": "Thanh toán bằng tiền mặt khi nhận hàng",
      "icon": "cash",
      "fee": 0,
      "available": true
    },
    {
      "id": "banking",
      "name": "Chuyển khoản ngân hàng",
      "description": "Chuyển khoản qua ngân hàng hoặc ATM",
      "icon": "bank",
      "fee": 0,
      "available": true
    },
    {
      "id": "momo",
      "name": "Ví MoMo",
      "description": "Thanh toán qua ví điện tử MoMo",
      "icon": "momo",
      "fee": 0,
      "available": true
    }
  ]
}
```

### 📦 **Create Order**
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderItems": [
    {
      "product": "6835a5f82e1006edec7b2fc2",
      "name": "Khăn kẻ đội đầu thổ cẩm",
      "image": "https://...",
      "price": 80000,
      "quantity": 2,
      "selectedVariant": {
        "title": "Màu xanh",
        "size": "20cm x 100cm"
      }
    }
  ],
  "shippingInfo": {
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "city": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường 1",
    "note": "Giao hàng buổi sáng"
  },
  "paymentMethod": "cod",
  "shippingMethod": "standard",
  "itemsPrice": 160000,
  "shippingPrice": 30000,
  "discountPrice": 0,
  "voucherCode": "",
  "voucherDiscount": 0,
  "totalPrice": 190000
}
```

### 💰 **Process Payment**
```http
POST /api/checkout/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "6835a5f82e1006edec7b2fc3",
  "paymentMethod": "banking",
  "paymentData": {
    "bankReference": "TXN123456789" // optional for banking
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "data": {
    "order": { ... },
    "paymentResult": {
      "id": "BANK_1735299600000",
      "status": "completed",
      "updateTime": "2024-12-27T10:00:00.000Z",
      "emailAddress": "nguyenvana@email.com",
      "bankReference": "TXN123456789"
    }
  }
}
```

### ✅ **Verify Payment**
```http
GET /api/checkout/payment/{orderId}/verify
Authorization: Bearer <token>
```

## Order Validation Middleware

### Features:
- ✅ **Product ID Extraction**: Handle cả string ID và full object
- ✅ **Data Sanitization**: Clean và validate order items
- ✅ **Email Validation**: Basic email format check
- ✅ **Price Validation**: Validate tổng tiền calculation
- ✅ **Required Fields**: Check tất cả required fields

### Usage:
```javascript
const { validateCreateOrder } = require('../middleware/orderValidation');

router.post('/orders', protect, validateCreateOrder, createOrder);
```

## Payment Methods

### 1. **COD (Cash on Delivery)**
- Thanh toán khi nhận hàng
- Không cần xử lý payment ngay
- Order status: `pending`

### 2. **Banking Transfer**
- Chuyển khoản ngân hàng
- Auto-confirm payment (giả lập)
- Order status: `confirmed`
- Payment status: `completed`

### 3. **MoMo Wallet**
- Ví điện tử MoMo
- Auto-confirm payment (giả lập)
- Order status: `confirmed`
- Payment status: `completed`

## Voucher System

### Available Vouchers:
- **NEWUSER**: 10% discount (max 100,000 VND)
- **FREESHIP**: Free shipping

### Logic:
```javascript
if (voucherCode === 'NEWUSER') {
  voucherDiscount = Math.min(itemsPrice * 0.1, 100000);
} else if (voucherCode === 'FREESHIP') {
  voucherDiscount = shippingPrice;
}
```

## Shipping Methods

| Method | Duration | Price |
|--------|----------|-------|
| Standard | 3-5 business days | 30,000 VND |
| Express | 1-2 business days | 50,000 VND |

## Error Handling

### Common Errors:
- **400 Bad Request**: Invalid data format
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Order/Product not found
- **500 Internal Server Error**: Server errors

### Error Response Format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Frontend Integration Guide

### 1. **Cart to Checkout Flow**
```javascript
// 1. Calculate checkout
const checkout = await api.post('/api/checkout/calculate', {
  cartItems: cart.items,
  shippingMethod: 'standard',
  voucherCode: 'NEWUSER'
});

// 2. Create order
const order = await api.post('/api/orders', {
  orderItems: checkout.data.items,
  shippingInfo: userShippingInfo,
  paymentMethod: 'banking',
  ...checkout.data
});

// 3. Process payment
const payment = await api.post('/api/checkout/payment', {
  orderId: order.data._id,
  paymentMethod: 'banking',
  paymentData: { bankReference: 'TXN123' }
});
```

### 2. **Payment Verification**
```javascript
// Check payment status
const status = await api.get(`/api/checkout/payment/${orderId}/verify`);
console.log(status.data.isPaid); // true/false
```

### 3. **Handle Product Objects**
Frontend có thể gửi full product object hoặc chỉ ID:
```javascript
// ✅ Both formats work:
orderItems: [
  { product: "6835a5f82e1006edec7b2fc2", ... }, // String ID
  { product: { _id: "6835a5f82e1006edec7b2fc2", ... }, ... } // Full object
]
```

## Testing

### Sample Test Data:
```bash
# Test với product object thay vì ID
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "orderItems": [
      {
        "product": {
          "_id": "6835a5f82e1006edec7b2fc2",
          "name": "Test Product"
        },
        "name": "Test Product",
        "price": 100000,
        "quantity": 1
      }
    ],
    ...
  }'
```

## Notes

- Order validation middleware sẽ tự động extract product ID từ object
- Payment processing hiện tại là simulation (có thể integrate real payment gateway)
- Cart sẽ được clear sau khi order thành công
- Tất cả endpoints đều require authentication
- Response format nhất quán với `success`, `message`, `data` structure 