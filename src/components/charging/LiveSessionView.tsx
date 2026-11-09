import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  Download, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw,
  Receipt,
  ExternalLink
} from 'lucide-react';
import { ChargingSession, Vehicle } from '../../types/ev';

interface LiveSessionViewProps {
  session?: ChargingSession;
  vehicle: Vehicle;
  onStopSession: (session: ChargingSession) => void;
  onStartSimulatedSession?: () => void;
}

export const LiveSessionView: React.FC<LiveSessionViewProps> = ({
  session,
  vehicle,
  onStopSession,
  onStartSimulatedSession,
}) => {
  // Live ticking simulation when session is active
  const [currentKwh, setCurrentKwh] = useState(session ? session.energyDeliveredKwh : 0);
  const [currentSoc, setCurrentSoc] = useState(session ? session.currentSoc : vehicle.currentBatteryPercent);
  const [elapsedMinutes, setElapsedMinutes] = useState(session ? session.elapsedMinutes : 0);
  const [isCharging, setIsCharging] = useState(session?.status === 'charging');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (!isCharging || !session) return;

    const timer = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
      setCurrentKwh((prev) => Number((prev + 0.4).toFixed(1)));
      setCurrentSoc((prev) => {
        if (prev >= 85) {
          setIsCharging(false);
          return 85;
        }
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isCharging, session]);

  const costSoFar = Math.round(currentKwh * 22.5);
  const remainingMinutes = Math.max(0, Math.round(((85 - currentSoc) / 100 * vehicle.usableCapacityKwh / 80) * 60));

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
            <span>REAL-TIME SESSION TELEMETRY</span>
            <span>·</span>
            <span>OPERATOR SYNC ENGINE</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Live Charging Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized directly with charging station hardware meters.
          </p>
        </div>

        {session && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OCPI 2.2 Meter Values Synchronized</span>
          </div>
        )}
      </div>

      {session ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visual Dial & Telemetry (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-8">
            
            {/* Station info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-teal-400 uppercase">
                  Connected Bay · {session.connectorType}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{session.stationName}</h3>
                <div className="text-xs text-slate-400">
                  Vehicle: <strong className="text-slate-200">{vehicle.name}</strong> · Started at {session.startTime}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums">
                  {session.currentPowerKw} <span className="text-sm font-normal text-slate-400">kW</span>
                </div>
                <div className="text-[11px] text-slate-400">Instantaneous Power</div>
              </div>
            </div>

            {/* Circular / Hero Battery SOC Progression */}
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-slate-800"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-teal-400 transition-all duration-700"
                    strokeWidth="8"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * currentSoc) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white font-mono tabular-nums">
                    {currentSoc}%
                  </span>
                  <span className="text-xs text-slate-400 font-medium">State of Charge</span>
                  <span className="text-[10px] text-teal-400 font-mono mt-0.5">Target: 85%</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>
                  Est. <strong>{remainingMinutes} minutes</strong> to reach 85% fast charge target
                </span>
              </div>
            </div>

            {/* Live Metrics Quad */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Delivered Energy</div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                  {currentKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">MID-certified meter</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Session Duration</div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                  {elapsedMinutes} <span className="text-xs font-normal text-slate-400">min</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Elapsed runtime</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Current Cost</div>
                <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums mt-1">
                  ₹{costSoFar}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">@ ₹22.5/kWh + GST</div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-400">Added Range</div>
                <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                  +{Math.round((currentKwh * 1000) / vehicle.efficiencyWhPerKm)} <span className="text-xs font-normal text-slate-400">km</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Real highway km</div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Station connector locked securely. Socket will unlock on session stop.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCharging(!isCharging)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isCharging ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isCharging ? 'Pause Flow' : 'Resume Flow'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Stop charging session and unlock connector cable?')) {
                      setIsCharging(false);
                      setShowInvoiceModal(true);
                      onStopSession({
                        ...session,
                        energyDeliveredKwh: currentKwh,
                        currentSoc,
                        costSoFar,
                        status: 'completed',
                      });
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stop & Settle Charge</span>
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar Info & Safety Guide (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs text-slate-300">
              <div className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Battery Curve Protection</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Modern EV lithium batteries accept peak power below 60% SOC. Between 70% and 85%, charging speeds automatically step down to protect cell longevity.
              </p>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Battery Temp:</span>
                  <span className="text-emerald-400">32.4°C (Optimal)</span>
                </div>
                <div className="flex justify-between">
                  <span>Voltage:</span>
                  <span className="text-slate-200">398 V</span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="text-slate-200">212 A</span>
                </div>
              </div>
            </div>

            {/* Emergency Support Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
              <div className="font-semibold text-white">Need On-Site Assistance?</div>
              <p className="text-slate-400">
                Contact {session.network} station attendant or ONE EV 24/7 technical hotline.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="tel:18001021234"
                  className="py-2 text-center text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
                >
                  Call Station Attendant
                </a>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
          <Zap className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Charging Session</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you plug in at any verified partner station, the live charging dashboard automatically synchronizes your meter readings and power curve.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onStartSimulatedSession && onStartSimulatedSession()}
              className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors shadow-sm"
            >
              Simulate Live Charge at Zeon Hub
            </button>
          </div>
        </div>
      )}

      {/* Invoice & Tax Receipt Modal on Completion */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Charging Completed & Settled</h3>
              <p className="text-xs text-slate-400">
                Official GST Tax Invoice generated. Connector safely unlocked.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Invoice No:</span>
                <span className="text-white">INV-2026-ZEON-{Math.floor(1000 + Math.random() * 9000)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Energy Dispensed:</span>
                <span className="text-teal-400 font-bold">{currentKwh} kWh</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Elapsed:</span>
                <span className="text-white">{elapsedMinutes} mins</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Battery Level:</span>
                <span className="text-white">{session?.startSoc}% → {currentSoc}%</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-sm">
                <span>Final Settle Amount:</span>
                <span className="text-teal-400">₹{costSoFar}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  alert('Receipt downloaded to your device as PDF.');
                  setShowInvoiceModal(false);
                }}
                className="w-1/2 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save PDF Receipt</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
