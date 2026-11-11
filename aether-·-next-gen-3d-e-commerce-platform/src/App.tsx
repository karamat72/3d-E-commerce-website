/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';
import { Global3DScene } from './components/3d/Global3DScene.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { CartDrawer } from './components/cart/CartDrawer.js';

import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { AuthPage } from './pages/AuthPage.js';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="relative min-h-screen bg-[#07080D] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
              {/* Persistent 3D Interactive Background Canvas */}
              <Global3DScene />

              {/* Navigation Header */}
              <Navbar />

              {/* Slide-out Cart Drawer */}
              <CartDrawer />

              {/* Page Router Viewport */}
              <main className="flex-1 w-full">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                  <Route path="/dashboard" element={<CustomerDashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/register" element={<AuthPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Animated Footer */}
              <Footer />
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
