# VietTrad Checkout System Documentation

## Tổng quan

Hệ thống thanh toán VietTrad cung cấp quy trình mua hàng hoàn chỉnh từ giỏ hàng đến hoàn tất đơn hàng, bao gồm:

- Thu thập thông tin giao hàng
- Chọn phương thức vận chuyển và thanh toán
- Áp dụng mã giảm giá
- Tạo đơn hàng và quản lý trạng thái

## Các tính năng chính

### 1. Thông tin giao hàng
- **Thông tin cá nhân**: Họ tên, email, số điện thoại
- **Địa chỉ giao hàng**: Tỉnh/thành phố, quận/huyện, phường/xã, địa chỉ cụ thể
- **Ghi chú**: Hướng dẫn giao hàng đặc biệt
- **Validation**: Kiểm tra định dạng email, số điện thoại

### 2. Phương thức vận chuyển
- **Giao hàng tiêu chuẩn**: 2-3 ngày làm việc
- **Giao hàng nhanh**: 1-2 ngày làm việc (phí thêm 50,000đ)
- **Tính phí vận chuyển**: Dựa trên địa chỉ và loại vận chuyển
- **Miễn phí vận chuyển**: Đơn hàng từ 2,815,000đ

### 3. Phương thức thanh toán
- **COD (Cash on Delivery)**: Thanh toán khi nhận hàng
- **Chuyển khoản ngân hàng**: Internet Banking
- **Ví MoMo**: Thanh toán qua ví điện tử

### 4. Mã giảm giá
- **WELCOME10**: Giảm 10% cho đơn hàng từ 500K
- **SAVE50K**: Giảm 50K cho đơn hàng từ 1 triệu
- **FREESHIP**: Miễn phí vận chuyển cho đơn hàng từ 200K
- **Validation**: Kiểm tra điều kiện áp dụng và giá trị tối thiểu

### 5. Tổng quan đơn hàng
- **Hiển thị sản phẩm**: Hình ảnh, tên, variant, số lượng, giá
- **Tính toán chi phí**: Tạm tính, phí vận chuyển, giảm giá, tổng cộng
- **Thông tin bảo mật**: Đảm bảo an toàn thông tin

## Kiến trúc hệ thống

### Frontend Components

#### 1. Checkout.js
- **Location**: `client/src/pages/Checkout.js`
- **Purpose**: Component chính cho trang thanh toán
- **Features**:
  - Form nhập thông tin giao hàng
  - Chọn phương thức vận chuyển/thanh toán
  - Áp dụng mã giảm giá
  - Hiển thị tổng quan đơn hàng
  - Xử lý đặt hàng

#### 2. Checkout.scss
- **Location**: `client/src/pages/Checkout.scss`
- **Purpose**: Styling responsive cho trang checkout
- **Features**:
  - Mobile-first design
  - Form styling với validation states
  - Interactive elements (hover, focus)
  - Modern UI với gradients và shadows

### Backend Components

#### 1. Order Model
- **Location**: `server/models/orderModel.js`
- **Schema**:
  ```javascript
  {
    user: ObjectId,
    orderNumber: String (unique),
    orderItems: [OrderItem],
    shippingInfo: ShippingInfo,
    paymentMethod: String,
    shippingMethod: String,
    itemsPrice: Number,
    shippingPrice: Number,
    discountPrice: Number,
    voucherCode: String,
    voucherDiscount: Number,
    totalPrice: Number,
    isPaid: Boolean,
    isDelivered: Boolean,
    status: String,
    estimatedDelivery: Date,
    trackingNumber: String
  }
  ```

#### 2. Order Controller
- **Location**: `server/controllers/orderController.js`
- **Methods**:
  - `createOrder`: Tạo đơn hàng mới
  - `getOrderById`: Lấy đơn hàng theo ID
  - `getMyOrders`: Lấy đơn hàng của user
  - `updateOrderStatus`: Cập nhật trạng thái đơn hàng
  - `cancelOrder`: Hủy đơn hàng

#### 3. Order Routes
- **Location**: `server/routes/orderRoutes.js`
- **Endpoints**:
  - `POST /api/orders`: Tạo đơn hàng
  - `GET /api/orders/myorders`: Đơn hàng của user
  - `GET /api/orders/:id`: Chi tiết đơn hàng
  - `PUT /api/orders/:id/status`: Cập nhật trạng thái

#### 4. Order Service (Frontend)
- **Location**: `client/src/services/orderService.js`
- **Purpose**: API client cho order endpoints

## Quy trình thanh toán

### 1. Kiểm tra điều kiện
```javascript
// Kiểm tra đăng nhập
if (!currentUser) {
  navigate('/login');
}

// Kiểm tra giỏ hàng
if (items.length === 0) {
  navigate('/cart');
}
```

### 2. Thu thập thông tin
```javascript
const shippingInfo = {
  fullName: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  district: string,
  ward: string,
  note: string
};
```

### 3. Tính toán chi phí
```javascript
const calculateTotal = () => {
  const itemsPrice = getTotalPrice();
  const shippingPrice = getShippingFee();
  const voucherDiscount = getVoucherDiscount();
  const shippingDiscount = getShippingDiscount();
  
  return itemsPrice + shippingPrice - voucherDiscount - shippingDiscount;
};
```

### 4. Tạo đơn hàng
```javascript
const orderData = {
  orderItems: items.map(item => ({
    product: item.productId,
    name: item.name,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    selectedVariant: item.selectedVariant
  })),
  shippingInfo,
  paymentMethod,
  shippingMethod,
  itemsPrice: getTotalPrice(),
  shippingPrice: getShippingFee(),
  discountPrice: getTotalDiscount(),
  voucherCode: appliedVoucher?.code || '',
  voucherDiscount: getVoucherDiscount(),
  totalPrice: getFinalTotal()
};

const result = await orderService.createOrder(orderData);
```

## Validation Rules

### 1. Thông tin giao hàng
- **Họ tên**: Bắt buộc, không trống
- **Email**: Bắt buộc, định dạng email hợp lệ
- **Số điện thoại**: Bắt buộc, 10-11 số
- **Địa chỉ**: Tất cả trường bắt buộc
- **Điều khoản**: Phải đồng ý

### 2. Mã giảm giá
- **Tồn tại**: Mã phải có trong hệ thống
- **Điều kiện**: Đơn hàng đạt giá trị tối thiểu
- **Loại**: Percentage, fixed amount, hoặc free shipping

### 3. Thanh toán
- **Authentication**: User phải đăng nhập
- **Cart**: Giỏ hàng không được trống
- **Stock**: Kiểm tra tồn kho sản phẩm

## Error Handling

### Frontend
```javascript
try {
  await orderService.createOrder(orderData);
} catch (error) {
  const message = typeof error === 'string' ? error : 'Có lỗi xảy ra';
  alert(message);
}
```

### Backend
```javascript
// Validation errors
if (!orderItems || orderItems.length === 0) {
  res.status(400);
  throw new Error('Không có sản phẩm trong đơn hàng');
}

// Stock validation
if (product.countInStock < item.quantity) {
  res.status(400);
  throw new Error(`Sản phẩm ${product.name} không đủ số lượng`);
}
```

## Security Features

### 1. Authentication
- JWT token required cho order creation
- User ownership validation
- Admin permissions for management

### 2. Data Validation
- Server-side validation cho tất cả input
- XSS protection với input sanitization
- Rate limiting cho API calls

### 3. Privacy
- Sensitive data encryption
- Secure payment information handling
- GDPR compliance for user data

## Testing

### 1. Unit Tests
```javascript
describe('Order Service', () => {
  test('should create order with valid data', async () => {
    const orderData = mockOrderData();
    const result = await orderService.createOrder(orderData);
    expect(result.success).toBe(true);
  });
});
```

### 2. Integration Tests
```javascript
describe('Checkout Flow', () => {
  test('complete checkout process', async () => {
    // Add items to cart
    // Fill shipping info
    // Apply voucher
    // Submit order
    // Verify order creation
  });
});
```

### 3. E2E Tests
```javascript
describe('Checkout E2E', () => {
  test('user can complete purchase', async () => {
    await page.goto('/products');
    await page.click('[data-testid="add-to-cart"]');
    await page.goto('/checkout');
    await fillShippingForm();
    await page.click('[data-testid="place-order"]');
    await expect(page).toHaveText('Đặt hàng thành công');
  });
});
```

## Performance Optimizations

### 1. Frontend
- Lazy loading cho checkout page
- Debounced input validation
- Memoized calculations
- Progressive form validation

### 2. Backend
- Database indexing cho orders
- Cached voucher validation
- Optimized stock checking
- Bulk operations for inventory updates

## Mobile Responsiveness

### Breakpoints
- **Mobile**: < 576px
- **Tablet**: 576px - 991px
- **Desktop**: > 992px

### Features
- Touch-friendly form controls
- Collapsible sections on mobile
- Optimized button sizes
- Readable typography

## Future Enhancements

### 1. Planned Features
- **Payment Gateway Integration**: PayPal, Stripe
- **Real-time Inventory**: WebSocket updates
- **Order Tracking**: Live tracking với GPS
- **Multiple Addresses**: Lưu nhiều địa chỉ giao hàng
- **Scheduled Delivery**: Đặt lịch giao hàng

### 2. Technical Improvements
- **Progressive Web App**: Offline support
- **GraphQL**: Optimized data fetching
- **Microservices**: Service decomposition
- **Analytics**: Order funnel tracking

## Troubleshooting

### Common Issues

#### 1. "Giỏ hàng trống"
- **Cause**: Session expired hoặc cart cleared
- **Solution**: Kiểm tra localStorage và redirect về cart

#### 2. "Sản phẩm hết hàng"
- **Cause**: Stock thay đổi sau khi add to cart
- **Solution**: Real-time stock validation

#### 3. "Mã giảm giá không hợp lệ"
- **Cause**: Voucher expired hoặc conditions not met
- **Solution**: Validate voucher trước khi apply

#### 4. "Đặt hàng thất bại"
- **Cause**: Network issues hoặc server errors
- **Solution**: Retry mechanism và error recovery

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('DEBUG_CHECKOUT', 'true');

// View order data before submission
console.log('Order Data:', orderData);
```

## API Documentation

Swagger documentation available at: `http://localhost:5000/api-docs`

### Key Endpoints

#### Create Order
```
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderItems": [...],
  "shippingInfo": {...},
  "paymentMethod": "cod",
  "shippingMethod": "standard",
  "itemsPrice": 1000000,
  "shippingPrice": 30000,
  "totalPrice": 1030000
}
```

#### Get My Orders
```
GET /api/orders/myorders?page=1&limit=10
Authorization: Bearer <token>
```

#### Track Order
```
GET /api/orders/number/VT12345678
```

## Support

Để được hỗ trợ về hệ thống checkout:

1. **Bug Reports**: Tạo issue trên GitHub
2. **Feature Requests**: Discussion forum
3. **Technical Support**: Email: dev@viettrad.com
4. **Documentation**: Wiki và README files 