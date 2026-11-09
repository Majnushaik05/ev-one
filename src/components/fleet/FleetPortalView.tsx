import React, { useState } from 'react';
import { 
  Truck, 
  Car, 
  MapPin, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  BatteryMedium, 
  Users, 
  Lock, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { FleetVehicle } from '../../types/ev';
import { INITIAL_FLEET_VEHICLES } from '../../data/mockDatabase';

export const FleetPortalView: React.FC = () => {
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(INITIAL_FLEET_VEHICLES);
  const [networkPolicyEnforced, setNetworkPolicyEnforced] = useState(true);
  const [dailyBudgetCap, setDailyBudgetCap] = useState(500);

  const totalMonthlySpend = fleetVehicles.reduce((acc, v) => acc + v.monthlySpend, 0);
  const totalTodaySpend = fleetVehicles.reduce((acc, v) => acc + v.todaySpend, 0);
  const chargingCount = fleetVehicles.filter((v) => v.currentStatus === 'charging').length;
  const onRouteCount = fleetVehicles.filter((v) => v.currentStatus === 'on_route').length;

  const handleExportFleetReport = () => {
    const csvHeader = 'Vehicle Name,Plate,Driver,Status,Battery %,Today Spend (INR),Monthly Spend (INR),Assigned Route\n';
    const csvRows = fleetVehicles
      .map((v) => `"${v.vehicleName}",${v.plateNumber},"${v.driverName}",${v.currentStatus},${v.currentBatteryPercent},${v.todaySpend},${v.monthlySpend},"${v.assignedRoute || ''}"`)
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ONE_EV_Fleet_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>ENTERPRISE FLEET COMMAND</span>
            <span>·</span>
            <span>COMMERCIAL & DELIVERY TEAMS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Fleet Operations & Expense Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Oversight of multi-vehicle fleets, drivers, real-time battery status, and approved network policies.
          </p>
        </div>

        <button
          onClick={handleExportFleetReport}
          className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export Fleet Expense CSV</span>
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Total Managed Vehicles</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            {fleetVehicles.length} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Taxis, 2W couriers, commercial vans</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Active Live Status</div>
          <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums mt-1">
            {onRouteCount} En Route · {chargingCount} Charging
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Real-time driver telematics</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Today's Fleet Charging Spend</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
            ₹{totalTodaySpend}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Below daily budget cap</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Monthly Expense to Date</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
            ₹{totalMonthlySpend.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">42% savings vs diesel fleet</div>
        </div>
      </div>

      {/* Policy Governance Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Fleet Charging Policy Governance</span>
            </h3>
            <p className="text-xs text-slate-400">
              Restrict drivers to negotiated enterprise roaming rates and prevent out-of-policy charging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={networkPolicyEnforced}
                onChange={(e) => setNetworkPolicyEnforced(e.target.checked)}
                className="rounded accent-cyan-400"
              />
              <span>Enforce Approved Networks Only (Zeon, Jio-bp, Statiq)</span>
            </label>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="text-slate-400">Per-Driver Daily Cap:</span>
              <span className="font-mono font-bold text-white">₹{dailyBudgetCap}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Vehicles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Fleet Vehicle Roster</h3>
          <span className="text-xs text-slate-400 font-mono">Live Telematics Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-6">Vehicle & Plate</th>
                <th className="py-3 px-6">Driver</th>
                <th className="py-3 px-6">Battery (SOC)</th>
                <th className="py-3 px-6">Status & Location</th>
                <th className="py-3 px-6 text-right">Today Spend</th>
                <th className="py-3 px-6 text-right">Monthly Spend</th>
                <th className="py-3 px-6 text-center">Policy Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {fleetVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white">{v.vehicleName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{v.plateNumber} · {v.category.replace('_', ' ')}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    <div className="font-medium text-white">{v.driverName}</div>
                    <div className="text-[11px] text-slate-400">{v.driverPhone}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm tabular-nums">
                        {v.currentBatteryPercent}%
                      </span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            v.currentBatteryPercent > 30 ? 'bg-teal-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${v.currentBatteryPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        v.currentStatus === 'charging' ? 'bg-teal-400 animate-pulse' : v.currentStatus === 'on_route' ? 'bg-emerald-400' : 'bg-slate-400'
                      }`} />
                      <span className="capitalize font-semibold text-white">{v.currentStatus.replace('_', ' ')}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">{v.currentLocation}</div>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-white">
                    ₹{v.todaySpend}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-cyan-400">
                    ₹{v.monthlySpend.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Compliant</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
