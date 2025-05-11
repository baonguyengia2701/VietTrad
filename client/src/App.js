import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
// Các component khác sẽ được import khi cần thiết
// import ProductPage from './pages/product/ProductPage';
// import ProductDetailPage from './pages/product-detail/ProductDetailPage';
// import CraftVillagePage from './pages/craft-village/CraftVillagePage';
// import AboutPage from './pages/about/AboutPage';
// import CartPage from './pages/cart/CartPage';
// import CheckoutPage from './pages/checkout/CheckoutPage';
// import AuthPage from './pages/auth/AuthPage';
// import AccountPage from './pages/account/AccountPage';
// import AdminPage from './pages/admin/AdminPage';

import './App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Các định tuyến khác sẽ được thêm dần */}
          {/* <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/heritage" element={<CraftVillagePage />} />
          <Route path="/craft-villages/:slug" element={<CraftVillageDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin/*" element={<AdminPage />} /> */}
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
    </div>
  );
}

export default App; 