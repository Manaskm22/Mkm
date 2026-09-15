import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Package,
  Layers
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { formatINR } from '../utils/currency';

export const ProductDetailModal: React.FC = () => {
  const { activeProductModal, setActiveProductModal, addToCart, setIsCheckoutOpen } = useCommerce();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [selectedQty, setSelectedQty] = useState(1);

  if (!activeProductModal) return null;

  const product = activeProductModal;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedQty);
    setActiveProductModal(null);
  };

  const handleInstantCheckout = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedQty);
    setActiveProductModal(null);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="product-detail-modal"
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-200"
      >
        {/* Gallery / Image Column */}
        <div className="md:w-1/2 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-xs">
            <img
              src={product.images[selectedImgIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Stock pill overlay */}
            <div className="absolute top-3 left-3">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} Units Remaining
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Inventory In Stock ({product.stock})
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    selectedImgIndex === idx ? 'border-slate-900 shadow-sm scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="mt-6 pt-4 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-600">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-slate-700" />
              <span>Complimentary 2-Day Air</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              <span>2-Year Global Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-4 h-4 text-slate-700" />
              <span>30-Day Hassle-Free Returns</span>
            </div>
          </div>
        </div>

        {/* Content & Specifications Column */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header with Close */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
                  {product.sku}
                </span>
                <span className="ml-2 text-xs font-semibold text-indigo-600">
                  {product.category}
                </span>
              </div>
              <button
                onClick={() => setActiveProductModal(null)}
                className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Ratings */}
            <h2 className="text-2xl font-bold font-display text-slate-900 mt-3">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400' : 'fill-slate-200 text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-600">• {product.reviewsCount} customer reviews</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900 font-display">
                {formatINR(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-base text-slate-600 line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
              {product.compareAtPrice && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Save {formatINR(product.compareAtPrice - product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              {product.description}
            </p>

            {/* Live Inventory Status Bar */}
            <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-slate-500" />
                  Warehouse Inventory Allocation
                </span>
                <span className={isOutOfStock ? 'text-rose-600 font-bold' : isLowStock ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {product.stock} units available
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    isOutOfStock ? 'w-0' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (product.stock / 30) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5">
                Stock is locked atomically during secure checkout to guarantee fulfillment.
              </p>
            </div>

            {/* Technical Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  Product Specifications
                </h4>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs divide-y divide-slate-200/60">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="py-1.5 flex justify-between">
                      <span className="text-slate-600 font-medium">{key}</span>
                      <span className="text-slate-900 font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-8 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              {/* Quantity stepper */}
              {!isOutOfStock && (
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                    disabled={selectedQty <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">
                    {selectedQty}
                  </span>
                  <button
                    onClick={() => setSelectedQty((q) => Math.min(product.stock, q + 1))}
                    disabled={selectedQty >= product.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Add to cart */}
              <button
                id="modal-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-600 border border-slate-200 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-md active:scale-98'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : `Add ${selectedQty > 1 ? selectedQty : ''} to Cart`}</span>
              </button>

              {/* Buy Now */}
              {!isOutOfStock && (
                <button
                  id="modal-buy-now-btn"
                  onClick={handleInstantCheckout}
                  className="py-3 px-5 rounded-xl font-semibold text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
