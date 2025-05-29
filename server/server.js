const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const config = require('./config/config');
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Cấu hình dotenv (nếu cần)
dotenv.config();

// Kết nối database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware trong môi trường development
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Cấu hình Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'VietTrad API',
      description: 'VietTrad E-commerce API Information',
      version: '1.0.0',
      contact: {
        name: 'VietTrad'
      },
      servers: [
        {
          url: `http://localhost:${config.port}`
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./routes/*.js', './swagger/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Define routes
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Sử dụng routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/checkout', require('./routes/checkoutRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Port và start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
}); 