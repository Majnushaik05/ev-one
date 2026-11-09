import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  Star, 
  Sparkles, 
  Zap, 
  Lock, 
  ArrowRight,
  X
} from 'lucide-react';
import { MarketplaceProduct } from '../../types/ev';
import { INITIAL_MARKETPLACE } from '../../data/mockDatabase';

export const MarketplaceView: React.FC = () => {
  const [products] = useState<MarketplaceProduct[]>(INITIAL_MARKETPLACE);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products & Services' },
    { id: 'home_charger', label: 'Smart Home Wallboxes (7.4-22kW)' },
    { id: 'portable_cable', label: 'Portable Emergency Cables' },
    { id: 'rescue_plan', label: 'ONE EV Roadside Rescue Shield' },
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const handlePlaceOrder = () => {
    setOrderComplete(true);
    setTimeout(() => {
      setOrderComplete(false);
      setSelectedProduct(null);
      alert('Order placed successfully! Verified tracking details sent to your registered contact.');
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <span>VERIFIED HARDWARE & SERVICES</span>
            <span>·</span>
            <span>CERTIFIED SELLERS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            ONE EV Verified Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Tested home chargers, heavy-duty portable cables, and 24/7 highway breakdown protection.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>OEM Compatible & Safety Certified</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === c.id
                ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{p.brand}</span>
                <span className="text-teal-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
                  <span>{p.rating} ({p.reviewsCount})</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                {p.title}
              </h3>

              {/* Verified Seller Pill */}
              <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Seller: {p.verifiedSeller}</span>
              </div>

              {/* Technical bullet points */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                {p.specs.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                    <span className="text-teal-400">•</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-bold text-white font-mono">₹{p.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-500 line-through ml-2 font-mono">₹{p.mrp.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% OFF
                </span>
              </div>

              <button
                onClick={() => setSelectedProduct(p)}
                className="w-full py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View & Purchase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Purchase Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-teal-400 uppercase">{selectedProduct.brand}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedProduct.title}</h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="font-semibold text-white">Certified Specifications:</div>
              <ul className="space-y-1.5 pl-2">
                {selectedProduct.specs.map((s, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Price (incl. GST):</span>
                <span className="font-mono text-white text-base font-bold">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Installation / Delivery:</span>
                <span className="text-emerald-400 font-medium">Free Doorstep Delivery & Engineer Inspection</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={orderComplete}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{orderComplete ? 'Processing Secure Checkout...' : `Confirm Purchase (₹${selectedProduct.price.toLocaleString('en-IN')})`}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
