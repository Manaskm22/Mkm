/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CommerceProvider, useCommerce } from './context/CommerceContext';
import { Navbar } from './components/Navbar';
import { StorefrontView } from './components/StorefrontView';
import { InventoryDashboard } from './components/InventoryDashboard';
import { OrderManagementView } from './components/OrderManagementView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { Footer } from './components/Footer';

function MainContent() {
  const { viewMode } = useCommerce();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Universal Navigation Header */}
      <Navbar />

      {/* Dynamic View Engine */}
      <main className="flex-1">
        {viewMode === 'storefront' && <StorefrontView />}
        {viewMode === 'inventory' && <InventoryDashboard />}
        {viewMode === 'orders' && <OrderManagementView />}
      </main>

      {/* Persistent Footer */}
      <Footer />

      {/* Global Interactive Overlays */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
    </div>
  );
}

export default function App() {
  return (
    <CommerceProvider>
      <MainContent />
    </CommerceProvider>
  );
}
