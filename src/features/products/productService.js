import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' ? 'https://club-de-boxeo-parra.onrender.com/api/products/' : '/api/products/';

// Get all products
const getProducts = async (token, filters = {}) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters,
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

// Create new product
const createProduct = async (productData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, productData, config);
    return response.data;
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
};

// Update product
const updateProduct = async (productId, productData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(API_URL + productId, productData, config);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// Delete product
const deleteProduct = async (productId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(API_URL + productId, config);
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

// Update stock
const updateStock = async (productId, stockData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(API_URL + productId + '/stock', stockData, config);
    return response.data;
  } catch (error) {
    throw new Error(`Error updating stock: ${error.message}`);
  }
};

const productService = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};

export default productService;
