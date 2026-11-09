import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar, 
  Zap, 
  TrendingUp, 
  Leaf, 
  Search,
  ExternalLink
} from 'lucide-react';
import { Vehicle } from '../../types/ev';

interface HistoryViewProps {
  activeVehicle: Vehicle;
}

interface HistoricalSession {
  id: string;
  date: string;
  stationName: string;
  network: string;
  vehicleName: string;
  kwh: number;
  durationMinutes: number;
  totalCost: number;
  status: 'completed' | 'cancelled';
}

export const HistoryView: React.FC<HistoryViewProps> = ({ activeVehicle }) => {
  const [filterMonth, setFilterMonth] = useState('Nov 2026');

  const historyRecords: HistoricalSession[] = [
    {
      id: 'INV-8891',
      date: 'Nov 09, 2026',
      stationName: 'Zeon Charging Hub — Empire Maddur',
      network: 'Zeon Charging',
      vehicleName: activeVehicle.name,
      kwh: 24.8,
      durationMinutes: 28,
      totalCost: 558,
      status: 'completed',
    },
    {
      id: 'INV-8742',
      date: 'Nov 04, 2026',
      stationName: 'ChargeZone Superhub — Electronic City',
      network: 'ChargeZone',
      vehicleName: activeVehicle.name,
      kwh: 31.2,
      durationMinutes: 34,
      totalCost: 717,
      status: 'completed',
    },
    {
      id: 'INV-8610',
      date: 'Oct 28, 2026',
      stationName: 'Jio-bp pulse — Channapatna',
      network: 'Jio-bp pulse',
      vehicleName: activeVehicle.name,
      kwh: 18.5,
      durationMinutes: 22,
      totalCost: 360,
      status: 'completed',
    },
    {
      id: 'INV-8501',
      date: 'Oct 21, 2026',
      stationName: 'Statiq Fast Hub — Kempegowda Airport Road',
      network: 'Statiq',
      vehicleName: activeVehicle.name,
      kwh: 29.0,
      durationMinutes: 30,
      totalCost: 638,
      status: 'completed',
    },
  ];

  const totalKwh = historyRecords.reduce((acc, r) => acc + r.kwh, 0);
  const totalSpend = historyRecords.reduce((acc, r) => acc + r.totalCost, 0);
  const totalKmDriven = Math.round((totalKwh * 1000) / activeVehicle.efficiencyWhPerKm);
  const co2SavedKg = Math.round(totalKmDriven * 0.12);

  const handleExportCsv = () => {
    const headers = 'Invoice ID,Date,Station,Network,Vehicle,Energy kWh,Duration (min),Total Cost (INR)\n';
    const rows = historyRecords
      .map((r) => `${r.id},${r.date},"${r.stationName}",${r.network},"${r.vehicleName}",${r.kwh},${r.durationMinutes},${r.totalCost}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ONE_EV_Charging_Statement_${filterMonth.replace(' ', '_')}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <span>CHARGING LEDGER & EXPENSES</span>
            <span>·</span>
            <span>VERIFIED INVOICES</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            History & Spend Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit-grade billing records, energy consumption breakdowns, and tax receipts.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Monthly Charging Spend</div>
          <div className="text-2xl lg:text-3xl font-bold text-white font-mono tabular-nums mt-1">
            ₹{totalSpend}
          </div>
          <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>₹{(totalSpend / totalKwh).toFixed(1)}/kWh average</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Total Energy Dispensed</div>
          <div className="text-2xl lg:text-3xl font-bold text-teal-400 font-mono tabular-nums mt-1">
            {totalKwh.toFixed(1)} <span className="text-sm font-normal text-slate-400">kWh</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across {historyRecords.length} sessions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Calculated Clean Distance</div>
          <div className="text-2xl lg:text-3xl font-bold text-white font-mono tabular-nums mt-1">
            ~{totalKmDriven} <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">At {activeVehicle.efficiencyWhPerKm} Wh/km</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400">Tailpipe CO₂ Avoided</div>
          <div className="text-2xl lg:text-3xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {co2SavedKg} <span className="text-sm font-normal text-slate-400">kg CO₂</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Compared to petrol/diesel</span>
          </div>
        </div>
      </div>

      {/* Table of Past Sessions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Itemized Charging Ledger</h3>
          <span className="text-xs text-slate-400 font-mono">Filter: {filterMonth}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-6">Invoice & Date</th>
                <th className="py-3 px-6">Charging Hub & Operator</th>
                <th className="py-3 px-6">Vehicle</th>
                <th className="py-3 px-6 text-right">Energy (kWh)</th>
                <th className="py-3 px-6 text-right">Duration</th>
                <th className="py-3 px-6 text-right">Total Cost</th>
                <th className="py-3 px-6 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {historyRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono">
                    <div className="font-semibold text-white">{r.id}</div>
                    <div className="text-[11px] text-slate-400">{r.date}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-white">{r.stationName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{r.network}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {r.vehicleName}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-teal-400">
                    {r.kwh} kWh
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-slate-300">
                    {r.durationMinutes} min
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-white">
                    ₹{r.totalCost}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => alert(`Downloading verified tax receipt for ${r.id}...`)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded transition-colors inline-flex"
                      title="Download GST Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
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
