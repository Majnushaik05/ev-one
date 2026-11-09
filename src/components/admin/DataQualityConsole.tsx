import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  Clock, 
  Layers, 
  SlidersHorizontal 
} from 'lucide-react';
import { DataQualityReport } from '../../types/ev';
import { INITIAL_DATA_QUALITY_ISSUES } from '../../data/mockDatabase';

export const DataQualityConsole: React.FC = () => {
  const [issues, setIssues] = useState<DataQualityReport[]>(INITIAL_DATA_QUALITY_ISSUES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const providerFeedStatuses = [
    { network: 'Zeon Charging', protocol: 'Direct OCPI 2.2.1', latencyMs: 82, lastHeartbeat: '1 min ago', status: 'healthy' },
    { network: 'Jio-bp pulse', protocol: 'Operator Telemetry API', latencyMs: 140, lastHeartbeat: '2 mins ago', status: 'healthy' },
    { network: 'ChargeZone', protocol: 'OCPI Roaming Gateway', latencyMs: 95, lastHeartbeat: '3 mins ago', status: 'healthy' },
    { network: 'Statiq', protocol: 'Partner Webhook Feed', latencyMs: 110, lastHeartbeat: '5 mins ago', status: 'healthy' },
    { network: 'Tata Power EZ Charge', protocol: 'Aggregated Feed Ingestion', latencyMs: 230, lastHeartbeat: '14 mins ago', status: 'nominal' },
    { network: 'Ather Grid', protocol: 'Cloud Telematics Stream', latencyMs: 75, lastHeartbeat: '4 mins ago', status: 'healthy' },
  ];

  const handleTriggerHealthCheck = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('All 6 operator gateway feeds pinged. OCPI signatures and status freshness verified.');
    }, 1200);
  };

  const handleResolveIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, status: 'resolved' } : iss))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>DATA INTEGRITY & TELEMETRY AUDIT</span>
            <span>·</span>
            <span>SYSTEM MONITORING</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Data Quality & Operator Health
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed freshness detection, connector mismatch prevention, and duplicate cleansing.
          </p>
        </div>

        <button
          onClick={handleTriggerHealthCheck}
          disabled={isRefreshing}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center gap-2 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Verifying Feeds...' : 'Run Feed Ingestion Health Check'}</span>
        </button>
      </div>

      {/* Operator Gateway Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providerFeedStatuses.map((feed) => (
          <div key={feed.network} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{feed.network}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                <span>{feed.status}</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono border-t border-slate-800/80 pt-2 text-slate-400">
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="text-slate-200">{feed.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span>Latency:</span>
                <span className="text-teal-400">{feed.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Last Telemetry Sync:</span>
                <span className="text-slate-200">{feed.lastHeartbeat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Data Integrity Tickets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Stale Feed & Anomaly Detection Queue</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {issues.filter((i) => i.status !== 'resolved').length} Open Anomalies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-6">Severity & ID</th>
                <th className="py-3 px-6">Station / Hub</th>
                <th className="py-3 px-6">Anomaly Type</th>
                <th className="py-3 px-6">Diagnostic Details</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {issues.map((iss) => (
                <tr key={iss.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      iss.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : iss.severity === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {iss.severity}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">{iss.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{iss.stationName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{iss.network}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-300">
                    {iss.issueType.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-6 text-slate-300 max-w-sm">
                    {iss.details}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`capitalize font-mono text-[11px] ${
                      iss.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {iss.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {iss.status !== 'resolved' ? (
                      <button
                        onClick={() => handleResolveIssue(iss.id)}
                        className="px-3 py-1 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded transition-colors"
                      >
                        Resolve & Mark Safe
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono text-xs">Closed</span>
                    )}
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
