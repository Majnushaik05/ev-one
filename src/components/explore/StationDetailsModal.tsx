import React from 'react';
import { 
  X, 
  MapPin, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Star, 
  Coffee, 
  Wifi, 
  Sparkles, 
  ExternalLink,
  Calendar,
  Layers,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { ChargingStation, Vehicle } from '../../types/ev';

interface StationDetailsModalProps {
  station: ChargingStation;
  vehicle: Vehicle;
  onClose: () => void;
  onBookStation: (station: ChargingStation) => void;
  onReportIssue: (station: ChargingStation) => void;
}

export const StationDetailsModal: React.FC<StationDetailsModalProps> = ({
  station,
  vehicle,
  onClose,
  onBookStation,
  onReportIssue,
}) => {
  const isCompatible = station.connectors.some((c) =>
    vehicle.supportedConnectors.includes(c.type)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                {station.network}
              </span>
              <span>·</span>
              <span className="text-xs text-slate-400 font-mono">ID: {station.operatorId}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">{station.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>{station.address}, {station.city}, {station.state}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration & Telemetry Authenticity Box */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {station.integrationLevel === 'verified_partner' ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Direct Operator API (OCPI 2.2.1)</span>
                </div>
              ) : station.integrationLevel === 'public_feed' ? (
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                  <Clock className="w-4 h-4" />
                  <span>Aggregated Public Roaming Feed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Community Submission (Unverified)</span>
                </div>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {station.lastStatusUpdate}
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {station.integrationLevel === 'verified_partner'
              ? 'Real-time telemetry verified. Live slot reservation, socket locking, and dynamic billing supported in-app.'
              : 'Status reflected from roaming feeds. In-app booking not supported yet. Use operator RFID card or mobile app on arrival.'}
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Compatibility with {vehicle.name}:</span>
            {isCompatible ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Compatible Connectors Present</span>
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Adapter Required</span>
              </span>
            )}
          </div>
        </div>

        {/* Connector Inventory */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 font-mono">
            Connector & Bay Inventory ({station.connectors.length} Bays)
          </h4>
          <div className="space-y-2.5">
            {station.connectors.map((c) => {
              const compat = vehicle.supportedConnectors.includes(c.type);
              return (
                <div
                  key={c.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{c.type}</span>
                        {compat && (
                          <span className="text-[10px] text-emerald-400 font-mono font-medium">
                            ✓ Matches Your {vehicle.name}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Max Output: {c.powerKw} kW · Tariff: ₹{c.pricePerKwh}/kWh
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                      c.status === 'working' ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'
                    }`}>
                      {c.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {c.lastUpdated}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Specs & Amenities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="font-semibold text-white">Hours & Access</div>
            <div className="text-slate-400">Operating: <strong className="text-slate-200">{station.openHours}</strong></div>
            <div className="text-slate-400">Idle Fee: <strong className="text-slate-200">{station.idleFeePerMin ? `₹${station.idleFeePerMin}/min after 15m grace` : 'None'}</strong></div>
            <div className="text-slate-400">Rating: <strong className="text-slate-200">★ {station.rating} ({station.reviewCount} reviews)</strong></div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="font-semibold text-white">Amenities on Site</div>
            <div className="space-y-1 text-slate-300">
              {station.amenities.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onReportIssue(station)}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Stale Data or Hardware Outage</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const query = encodeURIComponent(`${station.name}, ${station.city}`);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps Directions</span>
            </button>

            {station.supportsInAppBooking ? (
              <button
                onClick={() => {
                  onClose();
                  onBookStation(station);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reserve Verified Bay</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                Walk-in Station
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
