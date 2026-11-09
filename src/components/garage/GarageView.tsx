import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  Check, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  BatteryMedium, 
  Info,
  Clock,
  Sparkles,
  Sliders,
  X
} from 'lucide-react';
import { Vehicle, VehicleCategory, ConnectorType, DataSourceType } from '../../types/ev';

interface GarageViewProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  onSelectActiveVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  vehicles,
  activeVehicle,
  onSelectActiveVehicle,
  onAddVehicle,
  onUpdateVehicle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // New vehicle form state
  const [newBrand, setNewBrand] = useState('Tata Motors');
  const [newModel, setNewModel] = useState('Tiago EV Tech LUX');
  const [newCategory, setNewCategory] = useState<VehicleCategory>('car_everyday');
  const [newBatteryKwh, setNewBatteryKwh] = useState(24.0);
  const [newRealRangeKm, setNewRealRangeKm] = useState(190);
  const [newMaxDcKw, setNewMaxDcKw] = useState(25);
  const [newConnectors, setNewConnectors] = useState<ConnectorType[]>(['CCS2', 'Type 2']);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Vehicles' },
    { id: 'car_everyday', label: 'Everyday Cars' },
    { id: 'car_premium', label: 'Premium Luxury' },
    { id: 'two_wheeler', label: '2-Wheelers (Bikes/Scooters)' },
    { id: 'three_wheeler_auto', label: '3-Wheelers (Autos)' },
    { id: 'commercial', label: 'Commercial & Delivery' },
  ];

  const filteredVehicles = vehicles.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    return true;
  });

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Vehicle = {
      id: `veh_${Date.now()}`,
      name: `${newBrand} ${newModel}`,
      brand: newBrand,
      model: newModel,
      year: 2024,
      category: newCategory,
      batteryCapacityKwh: newBatteryKwh,
      usableCapacityKwh: Number((newBatteryKwh * 0.94).toFixed(1)),
      wltpOrAraiRangeKm: Math.round(newRealRangeKm * 1.3),
      realWorldRangeKm: newRealRangeKm,
      currentBatteryPercent: 85,
      maxAcChargeKw: 3.3,
      maxDcChargeKw: newMaxDcKw,
      supportedConnectors: newConnectors,
      efficiencyWhPerKm: Math.round((newBatteryKwh * 1000) / newRealRangeKm),
      dataSource: 'oem_specification',
      lastTelemetrySync: 'Calibrated from OEM database',
      isPrimary: false,
      registrationNumber: 'KA 05 EV ' + Math.floor(1000 + Math.random() * 9000),
    };

    onAddVehicle(created);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <span>MULTI-VEHICLE GARAGE</span>
            <span>·</span>
            <span>BATTERY & CONNECTOR PROFILES</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            My Connected Garage
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your cars, 2-wheelers, electric autos, or commercial transport. Trip planning calibrates to the active vehicle.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add EV to Garage</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-slate-800 text-teal-300 border border-teal-500/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((veh) => {
          const isActive = activeVehicle.id === veh.id;
          const currentRangeKm = Math.round((veh.realWorldRangeKm * veh.currentBatteryPercent) / 100);

          return (
            <div
              key={veh.id}
              className={`bg-slate-900 border rounded-2xl p-6 transition-all space-y-5 flex flex-col justify-between ${
                isActive
                  ? 'border-teal-500 ring-1 ring-teal-500/20 shadow-xl shadow-teal-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Card Top Pill */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    {veh.category.replace('_', ' ')}
                  </span>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded-md">
                      <Check className="w-3.5 h-3.5" />
                      Active for Navigation
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectActiveVehicle(veh)}
                      className="text-[11px] text-slate-400 hover:text-white bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md transition-colors"
                    >
                      Make Active
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{veh.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Reg: {veh.registrationNumber || 'Not specified'} · Year: {veh.year}
                </div>

                {/* State of Charge & Range */}
                <div className="mt-5 p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Current Battery (SOC)</span>
                    <span className="text-xl font-bold font-mono text-white tabular-nums">
                      {veh.currentBatteryPercent}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                      style={{ width: `${veh.currentBatteryPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Est. Range: ~{currentRangeKm} km</span>
                    <span>Rated: {veh.realWorldRangeKm} km full</span>
                  </div>
                </div>

                {/* Technical Specifications Matrix */}
                <div className="mt-4 space-y-2 text-xs border-t border-slate-800/80 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Battery Capacity:</span>
                    <span className="font-mono text-white font-medium">
                      {veh.batteryCapacityKwh} kWh ({veh.usableCapacityKwh} kWh usable)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max DC Fast Charge:</span>
                    <span className="font-mono text-teal-400 font-semibold">{veh.maxDcChargeKw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max AC Rate:</span>
                    <span className="font-mono text-slate-300">{veh.maxAcChargeKw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consumption Rate:</span>
                    <span className="font-mono text-slate-300">{veh.efficiencyWhPerKm} Wh/km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supported Connectors:</span>
                    <span className="font-mono text-white">{veh.supportedConnectors.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Data Source & Edit Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">Source: {veh.dataSource.replace('_', ' ')}</span>
                <button
                  onClick={() => {
                    const newSoc = prompt(`Update current battery percentage for ${veh.name} (0-100):`, veh.currentBatteryPercent.toString());
                    if (newSoc && !isNaN(Number(newSoc))) {
                      const clamped = Math.min(100, Math.max(1, Number(newSoc)));
                      onUpdateVehicle({ ...veh, currentBatteryPercent: clamped });
                    }
                  }}
                  className="text-teal-400 hover:underline shrink-0"
                >
                  Edit Battery %
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Add EV to Your Garage</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VehicleCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="car_everyday">Everyday Passenger Car (e.g. Nexon EV, Tiago EV)</option>
                  <option value="car_premium">Premium Luxury EV (e.g. BMW iX, Mercedes EQS, Ioniq 5)</option>
                  <option value="two_wheeler">2-Wheeler / Scooter / Bike (e.g. Ather 450X, Ola S1)</option>
                  <option value="three_wheeler_auto">3-Wheeler Passenger Auto (e.g. Treo, Ape E-City)</option>
                  <option value="commercial">Commercial Delivery Fleet (e.g. Tata Ace EV)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Model & Trim</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Battery (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newBatteryKwh}
                    onChange={(e) => setNewBatteryKwh(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Real Range (km)</label>
                  <input
                    type="number"
                    value={newRealRangeKm}
                    onChange={(e) => setNewRealRangeKm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max DC (kW)</label>
                  <input
                    type="number"
                    value={newMaxDcKw}
                    onChange={(e) => setNewMaxDcKw(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Connectors Supported</label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {(['CCS2', 'Type 2', 'GB/T', 'Bharat DC001', 'Bharat AC001', 'Ather Dot / LEV DC', 'Standard 15A Socket'] as ConnectorType[]).map((c) => {
                    const isSelected = newConnectors.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => {
                          if (isSelected) {
                            if (newConnectors.length > 1) {
                              setNewConnectors(newConnectors.filter((x) => x !== c));
                            }
                          } else {
                            setNewConnectors([...newConnectors, c]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                          isSelected
                            ? 'bg-teal-500/10 border-teal-500 text-teal-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
                >
                  Save to Garage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
