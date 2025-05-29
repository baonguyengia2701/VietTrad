# Logic Sold Count - VietTrad

## Tổng quan

Logic sold count đã được cập nhật để chỉ tính sản phẩm "đã bán" khi đơn hàng có trạng thái xác nhận trở lên, thay vì tính ngay khi đặt hàng.

## Trạng thái đơn hàng

### Trạng thái được tính là "Đã bán"
- `confirmed` - Đã xác nhận
- `processing` - Đang xử lý  
- `shipped` - Đã gửi hàng
- `delivered` - Đã giao hàng

### Trạng thái KHÔNG được tính là "Đã bán"
- `pending` - Chờ xử lý
- `cancelled` - Đã hủy

## Logic xử lý

### 1. Tạo đơn hàng mới (`createOrder`)
- **Stock**: Giảm ngay khi tạo đơn hàng
- **Sold**: KHÔNG tăng (chờ xác nhận)

```javascript
// Chỉ giảm stock, không tăng sold
await Product.findByIdAndUpdate(productId, {
  $inc: { countInStock: -quantity }
});
```

### 2. Thanh toán đơn hàng (`updateOrderToPaid`)
- Khi thanh toán và chuyển từ `pending` → `confirmed`
- **Sold**: Tăng lên

```javascript
if (oldStatus === 'pending' && newStatus === 'confirmed') {
  // Tăng sold count
  await updateSoldCount(orderItems, oldStatus, newStatus);
}
```

### 3. Cập nhật trạng thái (`updateOrderStatus`)
- **Chuyển từ trạng thái chưa bán → đã bán**: Tăng sold
- **Chuyển từ trạng thái đã bán → chưa bán**: Giảm sold
- **Hủy đơn hàng**: Hoàn trả stock

```javascript
// Ví dụ: pending → confirmed
if (!oldIsSold && newIsSold) {
  // Tăng sold count
}

// Ví dụ: confirmed → cancelled  
if (oldIsSold && !newIsSold) {
  // Giảm sold count
}

// Hủy đơn hàng
if (newStatus === 'cancelled') {
  // Hoàn trả stock
}
```

### 4. Hủy đơn hàng (`cancelOrder`)
- **Stock**: Hoàn trả
- **Sold**: Giảm (nếu đơn hàng đã ở trạng thái "đã bán")

## Utility Functions

### `orderUtils.js`
- `isSoldStatus(status)`: Kiểm tra trạng thái có được tính sold không
- `updateSoldCount(orderItems, oldStatus, newStatus)`: Cập nhật sold count
- `updateStockForCancellation(orderItems, oldStatus, newStatus)`: Xử lý stock khi hủy/khôi phục
- `handleOrderStatusChange(orderItems, oldStatus, newStatus)`: Xử lý toàn bộ logic

## Migration Scripts

### `fix-sold-count.js`
Script để fix lại sold count cho tất cả sản phẩm dựa trên đơn hàng hiện có:

```bash
node scripts/fix-sold-count.js
```

### `test-sold-logic.js`  
Script để test và validate logic sold count:

```bash
node scripts/test-sold-logic.js
```

## Ví dụ Flow

### Flow 1: Đặt hàng thành công
1. **Tạo đơn hàng**: `pending` (stock -1, sold +0)
2. **Thanh toán**: `confirmed` (stock không đổi, sold +1)
3. **Xử lý**: `processing` (không đổi)
4. **Gửi hàng**: `shipped` (không đổi)
5. **Giao hàng**: `delivered` (không đổi)

**Kết quả**: Stock -1, Sold +1

### Flow 2: Đặt hàng rồi hủy
1. **Tạo đơn hàng**: `pending` (stock -1, sold +0)
2. **Hủy đơn**: `cancelled` (stock +1, sold +0)

**Kết quả**: Stock không đổi, Sold không đổi

### Flow 3: Xác nhận rồi hủy
1. **Tạo đơn hàng**: `pending` (stock -1, sold +0)
2. **Xác nhận**: `confirmed` (stock không đổi, sold +1)
3. **Hủy đơn**: `cancelled` (stock +1, sold -1)

**Kết quả**: Stock không đổi, Sold không đổi

## Lưu ý quan trọng

1. **Consistency**: Luôn sử dụng utility functions để đảm bảo logic nhất quán
2. **Transaction**: Trong production nên wrap các operations trong transaction
3. **Validation**: Thường xuyên chạy script test để validate dữ liệu
4. **Backup**: Backup database trước khi chạy migration scripts

## Troubleshooting

### Sold count không đúng
```bash
# Chạy script fix
node scripts/fix-sold-count.js

# Kiểm tra kết quả
node scripts/test-sold-logic.js
```

### Stock âm
- Kiểm tra logic hủy đơn hàng
- Đảm bảo không có race condition
- Validate input trước khi tạo đơn hàng 