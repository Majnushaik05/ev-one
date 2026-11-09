import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  SlidersHorizontal,
  ArrowUpDown,
  ExternalLink,
  Info,
  Calendar,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { ChargingStation, ConnectorType, Vehicle } from '../../types/ev';

interface StationExplorerProps {
  vehicle: Vehicle;
  stations: ChargingStation[];
  onSelectStation: (station: ChargingStation) => void;
  onBookStation: (station: ChargingStation) => void;
}

export const StationExplorer: React.FC<StationExplorerProps> = ({
  vehicle,
  stations,
  onSelectStation,
  onBookStation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnector, setSelectedConnector] = useState<string>('all');
  const [powerFilter, setPowerFilter] = useState<'all' | 'fast_dc' | 'ultra_fast' | 'ac'>('all');
  const [onlyCompatible, setOnlyCompatible] = useState(true);
  const [onlyBookable, setOnlyBookable] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [comparingStationIds, setComparingStationIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [activeMapStationId, setActiveMapStationId] = useState<string | null>(stations[0]?.id || null);

  const networks = Array.from(new Set(stations.map((s) => s.network)));

  // Filter logic
  const filteredStations = stations.filter((station) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        station.name.toLowerCase().includes(q) ||
        station.city.toLowerCase().includes(q) ||
        station.network.toLowerCase().includes(q) ||
        station.address.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Vehicle compatibility
    if (onlyCompatible) {
      const isCompat = station.connectors.some((c) =>
        vehicle.supportedConnectors.includes(c.type)
      );
      if (!isCompat) return false;
    }

    // Bookable in app
    if (onlyBookable && !station.supportsInAppBooking) {
      return false;
    }

    // Specific connector filter
    if (selectedConnector !== 'all') {
      const hasConn = station.connectors.some((c) => c.type === selectedConnector);
      if (!hasConn) return false;
    }

    // Power filter
    if (powerFilter === 'fast_dc') {
      const hasFast = station.connectors.some((c) => c.powerKw >= 30 && c.powerKw < 120);
      if (!hasFast) return false;
    } else if (powerFilter === 'ultra_fast') {
      const hasUltra = station.connectors.some((c) => c.powerKw >= 120);
      if (!hasUltra) return false;
    } else if (powerFilter === 'ac') {
      const hasAc = station.connectors.some((c) => c.powerKw < 30);
      if (!hasAc) return false;
    }

    // Network filter
    if (selectedNetwork !== 'all' && station.network !== selectedNetwork) {
      return false;
    }

    return true;
  });

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (comparingStationIds.includes(id)) {
      setComparingStationIds(comparingStationIds.filter((sid) => sid !== id));
    } else {
      if (comparingStationIds.length >= 3) {
        alert('You can compare up to 3 stations simultaneously.');
        return;
      }
      setComparingStationIds([...comparingStationIds, id]);
    }
  };

  const comparedStations = stations.filter((s) => comparingStationIds.includes(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <span>UNIFIED CHARGING MAP</span>
            <span>·</span>
            <span>OPERATOR DIRECT FEEDS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Verified Charging Network
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real charger availability backed by verified integrations. Showing {filteredStations.length} stations.
          </p>
        </div>

        {/* View Switcher & Compare Action */}
        <div className="flex items-center gap-3">
          {comparingStationIds.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Compare Selected ({comparingStationIds.length})</span>
            </button>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'split' ? 'bg-slate-800 text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Map & List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-teal-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grid Only
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by highway corridor, city, or operator (e.g. Maddur, Zeon, Hosur)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-teal-500/50"
            />
          </div>

          {/* Connector Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">All Connectors</option>
              <option value="CCS2">CCS2 (Fast DC)</option>
              <option value="Type 2">Type 2 (AC Slow/Fast)</option>
              <option value="GB/T">GB/T (Commercial Taxi)</option>
              <option value="Bharat DC001">Bharat DC001 (15-30kW)</option>
              <option value="Bharat AC001">Bharat AC001 (Auto/3W)</option>
              <option value="Ather Dot / LEV DC">Ather Dot / LEV DC (2W)</option>
              <option value="Standard 15A Socket">Standard 15A Socket</option>
            </select>
          </div>

          {/* Speed Filters */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Speeds' },
                { id: 'ultra_fast', label: '⚡ 120-240kW' },
                { id: 'fast_dc', label: '⚡ 30-60kW' },
                { id: 'ac', label: 'AC (≤22kW)' },
              ] as const
            ).map((spd) => (
              <button
                key={spd.id}
                onClick={() => setPowerFilter(spd.id)}
                className={`px-2.5 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                  powerFilter === spd.id
                    ? 'bg-teal-500/10 border border-teal-500/40 text-teal-300 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

        </div>

        {/* Second Row: Smart Toggles */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Compatibility toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyCompatible}
                onChange={(e) => setOnlyCompatible(e.target.checked)}
                className="rounded accent-teal-400"
              />
              <span>Only compatible with <strong className="text-teal-400">{vehicle.name}</strong></span>
            </label>

            {/* Bookable in app toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyBookable}
                onChange={(e) => setOnlyBookable(e.target.checked)}
                className="rounded accent-teal-400"
              />
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified In-App Reservation Enabled</span>
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Network:</span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="all">All Networks</option>
              {networks.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Split or Grid */}
      <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* Interactive Map Canvas (5 Cols if split) */}
        {viewMode === 'split' && (
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[650px] sticky top-24">
            
            {/* Map Canvas Header */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span className="font-semibold text-white">Live Mobility Corridor Canvas</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Bengaluru-Mysuru Corridor</span>
            </div>

            {/* Simulated Geometric Map Vector Canvas */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden p-6 flex flex-col justify-between select-none">
              
              {/* Background highway grid lines */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #0d9488 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Highway Corridor Polylines SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* NH 275 Corridor */}
                <path
                  d="M 60 80 Q 180 200, 240 340 T 420 540"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 60 80 Q 180 200, 240 340 T 420 540"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Map Station Markers */}
              <div className="relative z-10 space-y-4">
                <div className="text-[11px] text-slate-400 bg-slate-900/80 border border-slate-800 p-2 rounded-md inline-block">
                  Click any verified pin to view real connector telemetry
                </div>

                {filteredStations.map((st, i) => {
                  const isSelected = activeMapStationId === st.id;
                  const isWorking = st.status === 'working';
                  const isBusy = st.status === 'busy';

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setActiveMapStationId(st.id);
                        onSelectStation(st);
                      }}
                      className={`cursor-pointer transition-all transform hover:scale-105 p-3 rounded-xl border backdrop-blur-md ${
                        isSelected
                          ? 'bg-teal-950/90 border-teal-500 shadow-lg shadow-teal-500/10'
                          : 'bg-slate-900/85 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full shrink-0 ${
                              isWorking
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                                : isBusy
                                ? 'bg-amber-400'
                                : 'bg-slate-500'
                            }`}
                          />
                          <span className="text-xs font-bold text-white truncate max-w-[200px]">
                            {st.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-teal-400 font-semibold shrink-0">
                          {Math.max(...st.connectors.map((c) => c.powerKw))} kW
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                        <span className="truncate">{st.network}</span>
                        <span>{st.integrationLevel === 'verified_partner' ? '✓ Bookable' : 'Walk-in'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Footer Disclaimer */}
              <div className="relative z-10 text-[10px] text-slate-400 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between">
                <span>Coordinates synced via OpenStreetMap & Google Maps Geocoding</span>
                <span className="text-teal-400">Live GPS lock: Bengaluru</span>
              </div>
            </div>
          </div>
        )}

        {/* Station Cards List (7 Cols if split, 12 if grid) */}
        <div className={`space-y-4 ${viewMode === 'split' ? 'lg:col-span-7' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
          {filteredStations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No stations match the selected filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try unchecking "Only compatible with {vehicle.name}" or clearing the power speed filter to see all stations.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedConnector('all');
                  setPowerFilter('all');
                  setOnlyCompatible(false);
                  setOnlyBookable(false);
                  setSelectedNetwork('all');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredStations.map((station) => {
              const fastestConnector = [...station.connectors].sort((a, b) => b.powerKw - a.powerKw)[0];
              const isComparing = comparingStationIds.includes(station.id);
              const isCompatible = station.connectors.some((c) =>
                vehicle.supportedConnectors.includes(c.type)
              );

              return (
                <div
                  key={station.id}
                  onClick={() => onSelectStation(station)}
                  className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-900/90 space-y-4 ${
                    activeMapStationId === station.id
                      ? 'border-teal-500 shadow-md shadow-teal-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                          {station.network}
                        </span>
                        <span>·</span>
                        <span className="text-[11px] text-slate-400">{station.city}</span>
                      </div>
                      <h3 className="text-base font-bold text-white hover:text-teal-300 transition-colors">
                        {station.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{station.address}</p>
                    </div>

                    {/* Compare Checkbox */}
                    <button
                      onClick={(e) => toggleCompare(station.id, e)}
                      className={`text-[11px] px-2.5 py-1 rounded border transition-colors shrink-0 ${
                        isComparing
                          ? 'bg-teal-500/10 border-teal-500/50 text-teal-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isComparing ? '✓ Comparing' : '+ Compare'}
                    </button>
                  </div>

                  {/* Integration Level & Transparency Box */}
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        {station.integrationLevel === 'verified_partner' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verified Partner (Direct OCPI 2.2)</span>
                          </span>
                        ) : station.integrationLevel === 'public_feed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400">
                            <Info className="w-3.5 h-3.5" />
                            <span>Operator Aggregator Feed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Community Reported (Unverified)</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-400 font-mono">
                        {station.lastStatusUpdate}
                      </span>
                    </div>

                    {/* Compatibility status for currently selected vehicle */}
                    <div className="text-[11px]">
                      {isCompatible ? (
                        <span className="text-teal-400 font-medium">
                          ✓ Compatible with {vehicle.name}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium">
                          ⚠ Incompatible connector with {vehicle.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Connectors Grid */}
                  <div>
                    <div className="text-[11px] font-medium text-slate-400 mb-2">Available Connectors</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {station.connectors.map((c) => (
                        <div
                          key={c.id}
                          className="p-2 bg-slate-950 border border-slate-800 rounded-md flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{c.type}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              ₹{c.pricePerKwh}/kWh · {c.status}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-teal-400 text-xs">
                            {c.powerKw} kW
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>★ {station.rating} ({station.reviewCount})</span>
                      <span>·</span>
                      <span>{station.openHours}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const query = encodeURIComponent(`${station.name}, ${station.city}`);
                          window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                        }}
                        className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-md transition-colors"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {station.supportsInAppBooking ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookStation(station);
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Reserve Slot</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                          Walk-in Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Side-by-Side Station Compare Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Side-by-Side Station Comparison</h3>
                <p className="text-xs text-slate-400">
                  Compare tariff, charging speed, real status freshness, and amenities before deciding your stop.
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedStations.map((st) => {
                const fastest = Math.max(...st.connectors.map((c) => c.powerKw));
                const minPrice = Math.min(...st.connectors.map((c) => c.pricePerKwh));
                return (
                  <div key={st.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                    <div>
                      <span className="text-[10px] font-mono text-teal-400 uppercase">{st.network}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{st.name}</h4>
                      <div className="text-[11px] text-slate-400 mt-1">{st.address}</div>
                    </div>

                    <div className="space-y-2 text-xs border-t border-b border-slate-800/80 py-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Peak Power:</span>
                        <span className="font-mono font-bold text-white">{fastest} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Base Tariff:</span>
                        <span className="font-mono text-teal-400 font-semibold">₹{minPrice}/kWh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reservation Fee:</span>
                        <span className="font-mono text-slate-300">
                          {st.reservationFee ? `₹${st.reservationFee}` : 'Free / Walk-in'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status Freshness:</span>
                        <span className="text-[11px] text-slate-300">{st.lastStatusUpdate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Booking Support:</span>
                        <span className={`text-[11px] font-semibold ${st.supportsInAppBooking ? 'text-teal-400' : 'text-slate-400'}`}>
                          {st.supportsInAppBooking ? 'Verified In-App' : 'Walk-in Only'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Amenities</div>
                      <div className="text-xs text-slate-300">
                        {st.amenities.map((a) => a.name).join(' · ')}
                      </div>
                    </div>

                    {st.supportsInAppBooking ? (
                      <button
                        onClick={() => {
                          setShowCompareModal(false);
                          onBookStation(st);
                        }}
                        className="w-full py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
                      >
                        Reserve at this Station
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowCompareModal(false);
                          onSelectStation(st);
                        }}
                        className="w-full py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:text-white"
                      >
                        Inspect Details
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
