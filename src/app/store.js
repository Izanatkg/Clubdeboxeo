import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import studentReducer from '../features/students/studentSlice';
import paymentReducer from '../features/payments/paymentSlice';
import productReducer from '../features/products/productSlice';
import salesReducer from '../features/sales/salesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    payments: paymentReducer,
    products: productReducer,
    sales: salesReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
