import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
// import ProductPage from './pages/ProductPage';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import BlogList from './pages/BlogList';
import Header from './components/Header';
import Footer from './components/Footer';
import { CartProvider } from './contexts/CartContext';

// Admin components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBrands from './pages/admin/AdminBrands';
import AdminReviews from './pages/admin/AdminReviews';

// Protected Route component
import ProtectedRoute from './components/ProtectedRoute';

// Các component khác sẽ được import khi cần thiết
// import ProductDetailPage from './pages/product-detail/ProductDetailPage';
// import CraftVillagePage from './pages/craft-village/CraftVillagePage';
// import AboutPage from './pages/about/AboutPage';
// import CartPage from './pages/cart/CartPage';
// import CheckoutPage from './pages/checkout/CheckoutPage';
// import AuthPage from './pages/auth/AuthPage';
// import AccountPage from './pages/account/AccountPage';

import './App.css';

function App() {
  return (
    <CartProvider>
      <div className="app">
        <Routes>
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="reviews" element={<AdminReviews />} />
            {/* Add more admin routes as needed */}
          </Route>

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/di-san" element={<BlogList />} />
                  {/* <Route path="/products/:slug" element={<ProductDetailPage />} /> */}
                  {/* Các định tuyến khác sẽ được thêm dần */}
                  {/* 
                  <Route path="/heritage" element={<CraftVillagePage />} />
                  <Route path="/craft-villages/:slug" element={<CraftVillageDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/account" element={<AccountPage />} /> */}
                  <Route path="*" element={<div className="not-found-page">
                    <div className="container">
                      <h1>404</h1>
                      <h2>Trang không tồn tại</h2>
                      <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
                    </div>
                  </div>} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </CartProvider>
  );
}

export default App; 