const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    password: bcrypt.hashSync('123456', 10),
    phone: '0901234567',
    address: {
      street: '123 Nguyen Van Linh',
      city: 'Ho Chi Minh',
      postalCode: '70000',
      country: 'Vietnam',
    },
  },
  {
    name: 'Tran Thi B',
    email: 'tranthib@example.com',
    password: bcrypt.hashSync('123456', 10),
    phone: '0909876543',
    address: {
      street: '456 Le Loi',
      city: 'Ha Noi',
      postalCode: '10000',
      country: 'Vietnam',
    },
  },
];

module.exports = users; 