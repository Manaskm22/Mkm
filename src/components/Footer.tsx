import React from 'react';
import { ShieldCheck, Lock, Layers, Package, Cpu } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';

export const Footer: React.FC = () => {
  const { setViewMode } = useCommerce();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-display font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <span>NEXUS COMMERCE</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Full-featured modern e-commerce platform equipped with atomic inventory management and PCI-DSS level 1 simulated payment processing.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>TLS 1.3 256-Bit Encrypted Sandbox</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setViewMode('storefront')} className="hover:text-white transition-colors cursor-pointer">
                  Customer Storefront & Catalog
                </button>
              </li>
              <li>
                <button onClick={() => setViewMode('inventory')} className="hover:text-white transition-colors cursor-pointer">
                  Warehouse Inventory Hub (SKU Tracking)
                </button>
              </li>
              <li>
                <button onClick={() => setViewMode('orders')} className="hover:text-white transition-colors cursor-pointer">
                  Order Management & Payment Logs
                </button>
              </li>
            </ul>
          </div>

          {/* Security & Payment Features */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">Payment Security Protocol</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Client-side Luhn algorithm checksum</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Simulated 3D-Secure 2.0 banking challenge</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
                <span>Instant cryptographic receipt & tokenization</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Atomic inventory stock reduction on settlement</span>
              </li>
            </ul>
          </div>

          {/* Compliance Specs */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px] mb-3">Compliance & Standards</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Designed with strict adherence to ISO 27001 principles and PCI-DSS requirements. All transactions generate distinct idempotency keys and audit trails.
            </p>
            <div className="mt-3 text-[11px] text-slate-500">
              © {new Date().getFullYear()} Nexus Commerce Platforms Ltd. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
