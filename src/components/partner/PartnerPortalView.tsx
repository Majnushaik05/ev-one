import React, { useState } from 'react';
import { 
  Building2, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ChargingStation, Connector } from '../../types/ev';

interface PartnerPortalViewProps {
  stations: ChargingStation[];
  onUpdateStationTariff: (stationId: string, connectorId: string, newTariff: number) => void;
  onToggleConnectorStatus: (stationId: string, connectorId: string) => void;
}

export const PartnerPortalView: React.FC<PartnerPortalViewProps> = ({
  stations,
  onUpdateStationTariff,
  onToggleConnectorStatus,
}) => {
  // Focus on partner station (e.g. Zeon Charging Hub Maddur)
  const [activeStationId, setActiveStationId] = useState<string>(stations[0]?.id || '');
  const [tariffInput, setTariffInput] = useState<number>(22.5);
  const [manualOverrideNote, setManualOverrideNote] = useState('');
  const [auditLogs, setAuditLogs] = useState<string[]>([
    'Tariff updated for CCS2 120kW bay to ₹22.5/kWh by Station Mgr (10:15 AM)',
    'Connector #2 marked as occupied via OCPI session event (09:40 AM)',
    'Scheduled maintenance completed on Bay #3 (Yesterday)',
  ]);

  const activeStation = stations.find((s) => s.id === activeStationId) || stations[0];

  const handleSaveTariff = (connectorId: string) => {
    onUpdateStationTariff(activeStation.id, connectorId, tariffInput);
    const log = `Tariff updated for ${connectorId} to ₹${tariffInput}/kWh with note: "${manualOverrideNote || 'Routine adjustment'}"`;
    setAuditLogs([log, ...auditLogs]);
    setManualOverrideNote('');
    alert('Tariff updated and pushed across all connected roaming apps.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span>OPERATOR MANAGEMENT PORTAL</span>
            <span>·</span>
            <span>DIRECT OCPI GATEWAY</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Station Partner Operations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage tariffs, live connector statuses, slot reservation queues, and utilization payouts.
          </p>
        </div>

        {/* Station switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Managing:</span>
          <select
            value={activeStationId}
            onChange={(e) => setActiveStationId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.network})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Today's Revenue</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">₹14,850</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18% vs last Tuesday</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Energy Delivered Today</div>
          <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums mt-1">682 kWh</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 22 charging sessions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Bay Utilization Rate</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">74.2%</div>
          <div className="text-[11px] text-slate-400 mt-1">Peak: 12:00 PM - 03:30 PM</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Next Payout Settlement</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">₹92,400</div>
          <div className="text-[11px] text-teal-400 mt-1 font-mono">Direct NEFT on Friday</div>
        </div>
      </div>

      {/* Main Grid: Connector Inventory & Live Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Connector Management (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-teal-400" />
                <span>Connector Bays & Live Status Controls</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                OCPI 2.2 Sync: Active
              </span>
            </div>

            <div className="space-y-3">
              {activeStation.connectors.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{c.type}</span>
                        <span className="text-xs text-teal-400 font-mono">{c.powerKw} kW</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Current Tariff: ₹{c.pricePerKwh}/kWh · {c.lastUpdated}
                      </div>
                    </div>

                    {/* Operational Toggle */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                        c.status === 'working' ? 'text-emerald-400 bg-emerald-950/80' : 'text-amber-400 bg-amber-950/80'
                      }`}>
                        {c.status}
                      </span>
                      <button
                        onClick={() => onToggleConnectorStatus(activeStation.id, c.id)}
                        className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded transition-colors"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>

                  {/* Tariff Update Bar */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">Set Base Tariff (₹/kWh):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        defaultValue={c.pricePerKwh}
                        onChange={(e) => setTariffInput(Number(e.target.value))}
                        className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono text-xs outline-none"
                      />
                      <button
                        onClick={() => handleSaveTariff(c.id)}
                        className="px-3 py-1 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Manual Override & Operational Audit Trail
            </h4>
            <div className="space-y-2">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="text-xs text-slate-300 p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-2">
                  <span className="text-teal-400 font-mono text-[11px] shrink-0">[{idx + 1}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Slot Reservations & Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Today's Verified Booking Queue</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-teal-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-teal-400 font-bold">ZEON-RES-88390</span>
                  <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
                    Active Arrival
                  </span>
                </div>
                <div className="font-semibold text-white">Tata Nexon EV Long Range</div>
                <div className="text-slate-400 font-mono">Slot: 02:30 PM - 03:15 PM (Bay #1 CCS2)</div>
                <div className="text-[11px] text-slate-300 flex justify-between pt-1 border-t border-slate-800">
                  <span>Pre-auth: ₹475</span>
                  <span className="text-emerald-400">Driver Checked In via QR</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-300 font-bold">ZEON-RES-88394</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    Upcoming (1 hr)
                  </span>
                </div>
                <div className="font-semibold text-white">BMW iX xDrive40</div>
                <div className="text-slate-400 font-mono">Slot: 03:30 PM - 04:15 PM (Bay #1 CCS2)</div>
                <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-800">
                  <span>Pre-auth: ₹850</span>
                  <span>En route</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outage & Maintenance Reporting */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Broadcast Maintenance Notice</span>
            </h4>
            <p className="text-slate-400">
              Broadcasting maintenance immediately flags affected connectors across ONE EV search and reroutes incoming drivers.
            </p>
            <button
              onClick={() => alert('Maintenance broadcast sent to driver navigation network.')}
              className="w-full py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              Report Bay Maintenance Outage
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
