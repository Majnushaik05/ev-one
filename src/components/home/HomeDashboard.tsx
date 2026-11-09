import React from 'react';
import { 
  BatteryCharging, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  Info,
  QrCode,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Vehicle, ChargingStation, Booking, ChargingSession } from '../../types/ev';

interface HomeDashboardProps {
  vehicle: Vehicle;
  nearbyStations: ChargingStation[];
  activeBooking?: Booking;
  liveSession?: ChargingSession;
  onNavigateToPlanner: (dest?: string) => void;
  onNavigateToExplore: () => void;
  onNavigateToLiveSession: () => void;
  onSelectStation: (station: ChargingStation) => void;
  onOpenBookingDetails: (booking: Booking) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  vehicle,
  nearbyStations,
  activeBooking,
  liveSession,
  onNavigateToPlanner,
  onNavigateToExplore,
  onNavigateToLiveSession,
  onSelectStation,
  onOpenBookingDetails,
}) => {
  const [quickDestination, setQuickDestination] = React.useState('Mysuru Expressway (Empire Maddur)');

  const estimatedRangeKm = Math.round(
    (vehicle.realWorldRangeKm * vehicle.currentBatteryPercent) / 100
  );

  const dataSourceLabels: Record<Vehicle['dataSource'], { label: string; badgeClass: string; desc: string }> = {
    connected_telematics: {
      label: 'Verified Connected Telematics',
      badgeClass: 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60',
      desc: vehicle.lastTelemetrySync || 'Live cloud sync',
    },
    oem_specification: {
      label: 'OEM Specs + OBD Labeled Estimate',
      badgeClass: 'text-cyan-400 bg-cyan-950/60 border border-cyan-800/60',
      desc: vehicle.lastTelemetrySync || 'Standard baseline calibration',
    },
    manual_input: {
      label: 'Manual Driver Entry',
      badgeClass: 'text-amber-400 bg-amber-950/60 border border-amber-800/60',
      desc: 'Driver-reported percentage (sync recommended)',
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner & Location Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Bengaluru Corridor, Karnataka</span>
            </span>
            <span>·</span>
            <span>Verified Operator Network Active</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Command Center
          </h1>
        </div>

        {/* Real Data Integrity Notice */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>Integrations verified via direct OCPI & operator feeds. No simulated charger statuses.</span>
        </div>
      </div>

      {/* Grid: Hero Vehicle Status + Active Session / Next Reservation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Hero Vehicle Card (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium font-mono uppercase tracking-wider mb-2 bg-slate-800 text-slate-300 border border-slate-700/60">
                {vehicle.category.replace('_', ' ')}
              </div>
              <h2 className="text-xl font-bold text-white">{vehicle.name}</h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Reg: {vehicle.registrationNumber || 'Not registered'} · Battery: {vehicle.batteryCapacityKwh} kWh ({vehicle.usableCapacityKwh} kWh usable)
              </div>
            </div>

            {/* Telemetry Source Transparency Badge */}
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-medium ${dataSourceLabels[vehicle.dataSource].badgeClass}`}>
                {dataSourceLabels[vehicle.dataSource].label}
              </span>
              <div className="text-[11px] text-slate-400 mt-1">
                {dataSourceLabels[vehicle.dataSource].desc}
              </div>
            </div>
          </div>

          {/* Battery State & Range Gauge */}
          <div className="my-6">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl lg:text-5xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                  {vehicle.currentBatteryPercent}%
                </span>
                <span className="text-sm font-medium text-slate-400">State of Charge (SOC)</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums">
                  ~{estimatedRangeKm} <span className="text-sm font-normal text-slate-400">km range</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Based on {vehicle.efficiencyWhPerKm} Wh/km real consumption
                </div>
              </div>
            </div>

            {/* Battery Progress Bar with Safety Reserve Indicator */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  vehicle.currentBatteryPercent > 35
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-400'
                    : vehicle.currentBatteryPercent > 15
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${vehicle.currentBatteryPercent}%` }}
              />
              {/* 15% reserve buffer marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10" 
                style={{ left: '15%' }}
                title="15% Safety Reserve Buffer Threshold"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span className="text-rose-400">15% Safety Buffer</span>
              <span>Supported: {vehicle.supportedConnectors.join(' · ')}</span>
              <span>Max DC: {vehicle.maxDcChargeKw} kW</span>
            </div>
          </div>

          {/* Quick Action Strip inside Hero */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Optimal next fast-charge window: 20% → 80% SOC</span>
            </div>
            <button
              onClick={() => onNavigateToPlanner()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded transition-colors flex items-center gap-1.5"
            >
              <span>Calculate Safe Route</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Session OR Active Reservation Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-6">
          {liveSession ? (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                      Active Charging Session
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">ID: {liveSession.id}</span>
                </div>

                <h3 className="text-base font-bold text-white">{liveSession.stationName}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Connector: {liveSession.connectorType} ({liveSession.powerKw} kW max)
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[11px] text-slate-400">Delivered Energy</div>
                    <div className="text-lg font-bold text-teal-400 font-mono tabular-nums">
                      {liveSession.energyDeliveredKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[11px] text-slate-400">Current Speed</div>
                    <div className="text-lg font-bold text-white font-mono tabular-nums">
                      {liveSession.currentPowerKw} <span className="text-xs font-normal text-slate-400">kW</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[11px] text-slate-400">Elapsed Time</div>
                    <div className="text-lg font-bold text-slate-200 font-mono tabular-nums">
                      {liveSession.elapsedMinutes} <span className="text-xs font-normal text-slate-400">min</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[11px] text-slate-400">Accrued Cost</div>
                    <div className="text-lg font-bold text-slate-200 font-mono tabular-nums">
                      ₹{liveSession.costSoFar}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToLiveSession}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>View Full Telemetry & Session Controls</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : activeBooking ? (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-950/80 text-teal-300 border border-teal-800/60 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    Verified Operator Reservation
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activeBooking.id}</span>
                </div>

                <h3 className="text-base font-bold text-white">{activeBooking.stationName}</h3>
                <div className="text-xs text-slate-400 mt-1">
                  Time: <span className="text-slate-200 font-medium">{activeBooking.timeSlot}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Connector: <span className="text-slate-200 font-medium">{activeBooking.connectorType} ({activeBooking.powerKw} kW)</span>
                </div>

                <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-400">Operator Reference</div>
                    <div className="text-xs font-mono font-semibold text-teal-400">
                      {activeBooking.operatorReservationReference}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Reserved on Zeon OCPI Gateway
                    </div>
                  </div>
                  <QrCode className="w-10 h-10 text-teal-400 shrink-0" />
                </div>
              </div>

              <button
                onClick={() => onOpenBookingDetails(activeBooking)}
                className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>View Check-in Pass & QR Code</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono mb-2">
                  No Active Booking
                </div>
                <h3 className="text-base font-bold text-white">Reserve Verified Fast Charger</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Avoid highway queues by securing a verified slot. Only operators with direct OCPI API confirmation are bookable.
                </p>
                <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Instant operator reservation lock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Automatic refund if hardware fails</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onNavigateToExplore}
                className="w-full mt-4 py-2 px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Find Bookable Chargers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Prominent Quick Trip Planner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
              Vehicle-Aware Route Engine
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Plan a Journey with Guaranteed Reserve</h3>
            <p className="text-xs text-slate-400">
              Calculates energy use, terrain, speed, and compatible charging stops for {vehicle.name}.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Buffer: 15%</span>
            <span>·</span>
            <span>Est. Wh/km: {vehicle.efficiencyWhPerKm}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <label className="block text-[11px] text-slate-400">Origin</label>
            <div className="text-xs font-medium text-white flex items-center gap-1.5 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Bengaluru (Current Location)</span>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2">
            <label className="block text-[11px] text-slate-400">Destination</label>
            <input
              type="text"
              value={quickDestination}
              onChange={(e) => setQuickDestination(e.target.value)}
              placeholder="Enter destination e.g. Mysuru, Coorg, Chennai..."
              className="w-full text-xs font-medium text-white bg-transparent outline-none mt-0.5"
            />
          </div>

          <div className="md:col-span-3 flex items-center">
            <button
              onClick={() => onNavigateToPlanner(quickDestination)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-teal-500/20"
            >
              <span>Calculate Route & Stops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Nearby Verified Charging Stations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Nearby Verified Charging Hubs</h3>
            <p className="text-xs text-slate-400">
              Ranked by vehicle connector match, verified live status, and detour time.
            </p>
          </div>
          <button
            onClick={onNavigateToExplore}
            className="text-xs font-medium text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({nearbyStations.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nearbyStations.slice(0, 3).map((station) => {
            const hasCompatible = station.connectors.some((c) =>
              vehicle.supportedConnectors.includes(c.type)
            );
            const fastestKw = Math.max(...station.connectors.map((c) => c.powerKw));
            const minPrice = Math.min(...station.connectors.map((c) => c.pricePerKwh));

            return (
              <div
                key={station.id}
                onClick={() => onSelectStation(station)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-900/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      {station.network}
                    </span>
                    {station.integrationLevel === 'verified_partner' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-teal-300 bg-teal-950/80 border border-teal-800/60 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-teal-400" />
                        Verified Partner
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Public Feed
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white hover:text-teal-300 transition-colors line-clamp-1">
                    {station.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{station.address}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-300 font-mono">
                    <span className="text-teal-400 font-semibold">{fastestKw} kW Max</span>
                    <span>·</span>
                    <span>₹{minPrice}/kWh</span>
                    <span>·</span>
                    <span>★ {station.rating}</span>
                  </div>

                  {/* Connector match pill indicator */}
                  <div className="mt-2 text-[11px]">
                    {hasCompatible ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Compatible with {vehicle.name}
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Connector adapter may be needed
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{station.lastStatusUpdate}</span>
                  <span className="text-teal-400 font-medium shrink-0">Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
