require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Debug endpoint để nhận và phân tích order data từ client
app.post('/debug-order', (req, res) => {
  console.log('\n🔍 === CLIENT ORDER DEBUG ===');
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  
  const { orderItems, itemsPrice, shippingPrice, totalPrice, discountPrice = 0, voucherDiscount = 0 } = req.body;
  
  // Calculate what backend expects
  let calculatedItemsPrice = 0;
  if (orderItems && Array.isArray(orderItems)) {
    orderItems.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      console.log(`Item ${index}: ${item.name} - ${item.price} x ${item.quantity} = ${itemTotal}`);
      calculatedItemsPrice += itemTotal;
    });
  }
  
  const expectedTotal = calculatedItemsPrice + shippingPrice - discountPrice - voucherDiscount;
  
  console.log('\n📊 PRICE BREAKDOWN:');
  console.log('  Client sent itemsPrice:', itemsPrice);
  console.log('  Backend calculated itemsPrice:', calculatedItemsPrice);
  console.log('  Shipping price:', shippingPrice);
  console.log('  Discount price:', discountPrice);
  console.log('  Voucher discount:', voucherDiscount);
  console.log('  Expected total:', expectedTotal);
  console.log('  Client sent total:', totalPrice);
  console.log('  Difference:', Math.abs(totalPrice - expectedTotal));
  
  const analysis = {
    clientData: {
      itemsPrice,
      shippingPrice,
      totalPrice,
      discountPrice,
      voucherDiscount
    },
    backendCalculation: {
      calculatedItemsPrice,
      expectedTotal
    },
    validation: {
      itemsPriceMatch: Math.abs(itemsPrice - calculatedItemsPrice) <= 1,
      totalPriceMatch: Math.abs(totalPrice - expectedTotal) <= 1,
      difference: Math.abs(totalPrice - expectedTotal)
    },
    issues: []
  };
  
  if (!analysis.validation.itemsPriceMatch) {
    analysis.issues.push(`Items price mismatch: client=${itemsPrice}, expected=${calculatedItemsPrice}`);
  }
  
  if (!analysis.validation.totalPriceMatch) {
    analysis.issues.push(`Total price mismatch: client=${totalPrice}, expected=${expectedTotal}`);
  }
  
  console.log('\n🎯 ANALYSIS:', analysis);
  
  res.json({
    success: true,
    message: 'Order data analyzed',
    analysis
  });
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🔍 Client Order Debug Server running on port ${PORT}`);
  console.log(`Send your order data to: http://localhost:${PORT}/debug-order`);
  console.log('Waiting for order data from client...\n');
}); 