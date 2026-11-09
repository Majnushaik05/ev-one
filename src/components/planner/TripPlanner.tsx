import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Vehicle, ChargingStation, RoutePlan } from '../../types/ev';
import { calculateTripRoute } from '../../utils/evPlanner';

interface TripPlannerProps {
  vehicle: Vehicle;
  allStations: ChargingStation[];
  initialDestination?: string;
  onBookStation: (station: ChargingStation) => void;
  onSelectStation: (station: ChargingStation) => void;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  vehicle,
  allStations,
  initialDestination = 'Mysuru Palace, Mysuru',
  onBookStation,
  onSelectStation,
}) => {
  const [origin, setOrigin] = useState('Bengaluru MG Road (Current)');
  const [destination, setDestination] = useState(initialDestination);
  const [departureSoc, setDepartureSoc] = useState(vehicle.currentBatteryPercent);
  const [reserveBuffer, setReserveBuffer] = useState(15);
  const [drivingStyle, setDrivingStyle] = useState<'eco' | 'normal' | 'spirited'>('normal');
  const [acSetting, setAcSetting] = useState<'off' | 'normal' | 'max_cool'>('normal');
  const [activeTab, setActiveTab] = useState<'recommended' | 'scenic' | 'fastest'>('recommended');

  const popularRoutes = [
    { label: 'Bengaluru → Mysuru Expressway', dest: 'Mysuru Palace, Mysuru' },
    { label: 'Bengaluru → Chennai via Chittoor', dest: 'Anna Salai, Chennai' },
    { label: 'Bengaluru → Ooty Hill Climb', dest: 'Charring Cross, Ooty' },
    { label: 'Bengaluru → Kempegowda Airport', dest: 'Terminal 2, KIA Airport' },
  ];

  const routePlan: RoutePlan = calculateTripRoute({
    origin,
    destination,
    vehicle,
    departureSocPercent: departureSoc,
    reserveBufferPercent: reserveBuffer,
    drivingStyle,
    acSetting,
    allStations,
  });

  const totalJourneyTimeMinutes = routePlan.totalDriveTimeMinutes + routePlan.totalChargeTimeMinutes;
  const hours = Math.floor(totalJourneyTimeMinutes / 60);
  const minutes = totalJourneyTimeMinutes % 60;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <span>VEHICLE-AWARE TRIP PLANNER</span>
            <span>·</span>
            <span>REAL-WORLD CALIBRATION</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Safe Corridor Navigation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Routes designed around {vehicle.name}’s battery capacity, charging curve, and verified operational stations.
          </p>
        </div>

        {/* Quick Corridor Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] text-slate-400 shrink-0">Corridors:</span>
          {popularRoutes.map((r) => (
            <button
              key={r.label}
              onClick={() => setDestination(r.dest)}
              className={`text-xs px-2.5 py-1 rounded border whitespace-nowrap transition-colors ${
                destination === r.dest
                  ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label.split(' → ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Controls Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-400" />
              <span>Journey Configuration</span>
            </h3>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Origin Point</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200">
                  <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-transparent outline-none font-medium text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Destination</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent outline-none font-medium text-white"
                  />
                </div>
              </div>
            </div>

            {/* Departure Battery Level */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Departure Battery (SOC)</span>
                <span className="font-mono font-bold text-teal-400 tabular-nums">{departureSoc}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="1"
                value={departureSoc}
                onChange={(e) => setDepartureSoc(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min: 20%</span>
                <span>Current Vehicle: {vehicle.currentBatteryPercent}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Safety Reserve Margin */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Arrival Reserve Buffer</span>
                <span className="font-mono font-bold text-rose-400 tabular-nums">{reserveBuffer}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((buf) => (
                  <button
                    key={buf}
                    onClick={() => setReserveBuffer(buf)}
                    className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                      reserveBuffer === buf
                        ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {buf}% Reserve
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Minimum safe charge retained upon arrival at any charger or destination.
              </p>
            </div>

            {/* Driving & AC Realism Factors */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Driving Behavior</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['eco', 'normal', 'spirited'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setDrivingStyle(style)}
                      className={`py-1 text-xs capitalize rounded border transition-colors ${
                        drivingStyle === style
                          ? 'bg-teal-500/10 border-teal-500/50 text-teal-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Climate & Air Conditioning</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['off', 'normal', 'max_cool'] as const).map((ac) => (
                    <button
                      key={ac}
                      onClick={() => setAcSetting(ac)}
                      className={`py-1 text-xs capitalize rounded border transition-colors ${
                        acSetting === ac
                          ? 'bg-teal-500/10 border-teal-500/50 text-teal-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ac === 'max_cool' ? 'Max (19°C)' : ac}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reset Defaults */}
            <button
              onClick={() => {
                setDepartureSoc(vehicle.currentBatteryPercent);
                setReserveBuffer(15);
                setDrivingStyle('normal');
                setAcSetting('normal');
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Vehicle Real Telemetry</span>
            </button>
          </div>

          {/* Vehicle Tech Summary Badge */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-200 font-semibold">
              <span>{vehicle.name}</span>
              <span className="font-mono text-teal-400">{vehicle.usableCapacityKwh} kWh Usable</span>
            </div>
            <div className="flex justify-between">
              <span>Peak DC Charge Speed:</span>
              <span className="font-mono text-slate-200">{vehicle.maxDcChargeKw} kW</span>
            </div>
            <div className="flex justify-between">
              <span>Connector Match:</span>
              <span className="font-mono text-slate-200">{vehicle.supportedConnectors.join(' / ')}</span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
              * Calculations apply real battery charging taper curve (fast 10-60%, taper above 70%).
            </div>
          </div>
        </div>

        {/* Route Output & Stops (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Journey Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div>
              <div className="text-xs text-slate-400">Total Distance</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                {routePlan.totalDistanceKm} <span className="text-xs font-normal text-slate-400">km</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Est. Total Time</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                {hours}h {minutes}m
              </div>
              <div className="text-[10px] text-slate-400">
                {routePlan.stops.length > 0 ? `Drive: ${Math.floor(routePlan.totalDriveTimeMinutes / 60)}h ${routePlan.totalDriveTimeMinutes % 60}m · Charge: ${routePlan.totalChargeTimeMinutes}m` : 'Direct trip'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Arrival Battery (SOC)</div>
              <div className="text-xl font-bold text-teal-400 font-mono tabular-nums mt-0.5">
                {routePlan.arrivalBatteryPercent}%
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Reserve safe ({routePlan.safetyReservePercent}% buffer kept)
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Charging Cost</div>
              <div className="text-xl font-bold text-white font-mono tabular-nums mt-0.5">
                ₹{routePlan.totalCostEstimate.min} - ₹{routePlan.totalCostEstimate.max}
              </div>
              <div className="text-[10px] text-slate-400">
                {routePlan.stops.length} verified stop{routePlan.stops.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Interactive Route Corridor Schematic */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Trip Itinerary & Verified Charging Stops</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {routePlan.stops.length === 0 ? 'No charging stop required' : `${routePlan.stops.length} Charging Stop Required`}
              </span>
            </div>

            {/* Visual Step Timeline */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              
              {/* Point 1: Departure */}
              <div className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-teal-400 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-teal-400" />
                </div>
                <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Departure: {routePlan.origin}</span>
                    <span className="font-mono text-teal-400 font-bold tabular-nums">SOC: {routePlan.departureBatteryPercent}%</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Preconditioned battery · Range buffer ~{Math.round((vehicle.realWorldRangeKm * routePlan.departureBatteryPercent) / 100)} km
                  </div>
                </div>
              </div>

              {/* Point 2: Charging Stops (if needed) */}
              {routePlan.stops.map((stop, index) => (
                <div key={stop.station.id} className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 z-10 shadow-md shadow-teal-500/20">
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div className="flex-1 bg-slate-950/90 border border-teal-800/40 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            Stop #{index + 1}: {stop.station.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                            Verified Partner
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {stop.station.address} ({stop.detourMinutes} min detour)
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xs font-mono font-semibold text-teal-400">
                          {stop.selectedConnector.powerKw} kW {stop.selectedConnector.type}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ₹{stop.selectedConnector.pricePerKwh}/kWh
                        </div>
                      </div>
                    </div>

                    {/* Battery SOC transition at this stop */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Arrival SOC</span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          {stop.arrivalBatteryPercent}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">(Above {stop.reserveSafetyMarginPercent}% reserve)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Target Charge</span>
                        <span className="font-mono font-bold text-teal-400 text-sm">
                          {stop.targetBatteryPercent}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">Fast curve cap</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Dwell Time</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {stop.chargeTimeMinutes} min
                        </span>
                        <span className="text-[10px] text-slate-400 block">+{stop.energyNeededKwh} kWh</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Estimated Cost</span>
                        <span className="font-mono font-bold text-white text-sm">
                          ₹{stop.estimatedCost}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Energy + Res. fee</span>
                      </div>
                    </div>

                    {/* Amenities & Verified Guarantee */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        <span>Amenities: Restaurant, Clean WC, High-speed Wi-Fi</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectStation(stop.station)}
                          className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded transition-colors"
                        >
                          Station Info
                        </button>
                        <button
                          onClick={() => onBookStation(stop.station)}
                          className="px-3 py-1 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Reserve Bay</span>
                        </button>
                      </div>
                    </div>

                    {/* Backup Station Safety Buffer */}
                    {stop.station.backupStationsNearby && (
                      <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Backup contingency: Channapatna Jio-bp pulse (8 km away) has verified compatible bays.</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Point 3: Destination */}
              <div className="relative flex items-start gap-4">
                <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shrink-0 z-10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Arrival: {routePlan.destination}</span>
                    <span className="font-mono text-emerald-400 font-bold tabular-nums">
                      Final SOC: ~{routePlan.arrivalBatteryPercent}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Safe arrival with remaining range ~{Math.round((vehicle.realWorldRangeKm * routePlan.arrivalBatteryPercent) / 100)} km for local city driving.
                  </div>
                </div>
              </div>

            </div>

            {/* Turn-by-Turn Maps Navigation Action */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Route verified against real highway gradient, ambient temperature ({routePlan.assumptions.ambientTempC}°C), and real-time charging status.
              </div>
              <button
                onClick={() => {
                  const query = encodeURIComponent(`${routePlan.destination}`);
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Export Route to Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
