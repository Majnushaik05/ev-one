import React from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';

interface SubscriptionPlansModalProps {
  onClose: () => void;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({ onClose }) => {
  const plans = [
    {
      name: 'ONE EV Free',
      target: 'For everyday EV drivers',
      price: '₹0',
      period: 'Forever free',
      highlight: false,
      features: [
        'Vehicle profile & garage (up to 2 EVs)',
        'Full charger discovery across all networks',
        'Basic trip planning with range reserve buffer',
        'Transparent status, source & timestamp labels',
        'Basic saved trips and charging alerts',
      ],
      cta: 'Current Free Tier',
      isCurrent: true,
    },
    {
      name: 'ONE EV Plus',
      target: 'For frequent highway travelers',
      price: '₹199',
      period: 'per month',
      highlight: true,
      badge: 'Popular',
      features: [
        'Everything in Free tier',
        'Advanced multi-route alternatives & scenic options',
        'Side-by-side station tariff & detour comparison',
        'Itemized charging spend & GST invoice export',
        'Dynamic weather & elevation consumption telemetry',
      ],
      cta: 'Upgrade to Plus',
      isCurrent: false,
    },
    {
      name: 'ONE EV Premium',
      target: 'For multi-EV households & luxury owners',
      price: '₹499',
      period: 'per month',
      highlight: false,
      features: [
        'Everything in Plus tier',
        'Unlimited garage vehicles (Cars, 2W, Autos)',
        'Direct OBD-II & connected car telematics sync',
        'Priority verified slot reservation locks',
        '24/7 Roadside Rescue emergency dispatch hotline',
      ],
      cta: 'Select Premium',
      isCurrent: false,
    },
    {
      name: 'ONE EV Business / Fleet',
      target: 'For commercial delivery & taxi operators',
      price: '₹149',
      period: 'per vehicle / month',
      highlight: false,
      features: [
        'Enterprise fleet dashboard & live SOC roster',
        'Driver assignment & budget policy enforcement',
        'Whitelisted roaming network controls',
        'Comprehensive fleet tax reports & CSV downloads',
        'Dedicated account manager & SLA support',
      ],
      cta: 'Contact Fleet Sales',
      isCurrent: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 lg:p-8 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>TRANSPARENT ECOSYSTEM PRICING</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              ONE EV Subscription Tiers & Capabilities
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Built on a non-negotiable principle: Essential charger discovery and safety are never paywalled.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-5 flex flex-col justify-between transition-all ${
                p.highlight
                  ? 'bg-gradient-to-b from-teal-950/40 to-slate-900 border-2 border-teal-500/80 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-950 border border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div>
                  {p.badge && (
                    <span className="inline-block text-[10px] font-bold font-mono uppercase bg-teal-400 text-slate-950 px-2 py-0.5 rounded-full mb-2">
                      {p.badge}
                    </span>
                  )}
                  <h4 className="text-base font-bold text-white">{p.name}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">{p.target}</div>
                </div>

                <div className="border-t border-b border-slate-800/80 py-3">
                  <div className="text-2xl font-bold text-white font-mono">{p.price}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{p.period}</div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {p.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    if (p.isCurrent) {
                      onClose();
                    } else {
                      alert(`Thank you for your interest in ${p.name}! In this verified preview, features are unlocked for testing.`);
                      onClose();
                    }
                  }}
                  className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors ${
                    p.highlight
                      ? 'bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-sm'
                      : p.isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Notice */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">The ONE EV Commitment:</strong> All drivers have full, unhindered access to charger locations, real-time connector power, emergency stops, and unverified data disclosures. Paid tiers fund advanced enterprise route optimization, multi-vehicle telemetry sync, and priority roadside assistance.
          </div>
        </div>

      </div>
    </div>
  );
};
