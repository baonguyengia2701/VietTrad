import api from './api';



// Product API calls
export const productService = {
  // Get all products with filters
  getProducts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.brand && filters.brand !== 'all') queryParams.append('brand', filters.brand);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await api.get(`/products?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get single product by ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get related products
  getRelatedProducts: async (id, limit = 4) => {
    try {
      const response = await api.get(`/products/${id}/related?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get product reviews
  getProductReviews: async (id, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/products/${id}/reviews?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await api.get(`/products/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get bestseller products
  getBestsellerProducts: async (limit = 8) => {
    try {
      const response = await api.get(`/products/bestsellers?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Admin methods
  // Get all products for admin (including inactive)
  getAllProducts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.brand && filters.brand !== 'all') queryParams.append('brand', filters.brand);
      if (filters.search) queryParams.append('search', filters.search);
      
      // Include inactive products for admin
      queryParams.append('includeInactive', 'true');

      const response = await api.get(`/products?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Create new product (admin only)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Update product (admin only)
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Delete product (admin only)
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Update product status (admin only)
  updateProductStatus: async (id, isActive) => {
    try {
      const response = await api.put(`/products/${id}`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

// Category API calls
export const categoryService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get category by ID
  getCategory: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get products by category
  getCategoryProducts: async (id, page = 1, limit = 8) => {
    try {
      const response = await api.get(`/categories/${id}/products?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

// Brand API calls  
export const brandService = {
  // Get all brands
  getBrands: async () => {
    try {
      const response = await api.get('/products/brands');
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get brand by ID
  getBrand: async (id) => {
    try {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  },

  // Get products by brand
  getBrandProducts: async (id, page = 1, limit = 8) => {
    try {
      const response = await api.get(`/brands/${id}/products?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    }
  }
};

// Data transformation helper to ensure compatibility with existing UI
export const transformProductData = (apiProduct) => {
  return {
    ...apiProduct,
    // Ensure compatibility with old mock_data structure
    id: apiProduct._id || apiProduct.id,
    image: apiProduct.images || apiProduct.image, // Support both arrays and single images
    selled: apiProduct.sold || apiProduct.selled, // Support both naming conventions
    rating: apiProduct.averageRating || apiProduct.rating,
    // Add computed fields
    discountedPrice: apiProduct.discountedPrice || (apiProduct.discount > 0 ? 
      Math.round(apiProduct.price * (1 - apiProduct.discount / 100)) : apiProduct.price)
  };
};

// Transform array of products
export const transformProductsData = (apiProducts) => {
  return apiProducts.map(transformProductData);
};

export default {
  productService,
  categoryService,
  brandService,
  transformProductData,
  transformProductsData
}; 