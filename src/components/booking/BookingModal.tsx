import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  CreditCard, 
  QrCode, 
  Zap, 
  Lock,
  ArrowRight,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { ChargingStation, Connector, Vehicle, Booking } from '../../types/ev';

interface BookingModalProps {
  station: ChargingStation;
  vehicle: Vehicle;
  onClose: () => void;
  onBookingConfirmed: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  station,
  vehicle,
  onClose,
  onBookingConfirmed,
}) => {
  // Filter bookable connectors
  const bookableConnectors = station.connectors.filter((c) => c.isBookable);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>(
    bookableConnectors[0]?.id || station.connectors[0]?.id || ''
  );
  
  const [selectedSlot, setSelectedSlot] = useState('02:30 PM - 03:15 PM');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [estimatedKwh, setEstimatedKwh] = useState(25);
  
  // State machine: 'select' -> 'review' -> 'processing_hold' -> 'confirmed'
  const [step, setStep] = useState<'select' | 'review' | 'verifying' | 'confirmed'>('select');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const selectedConnector = station.connectors.find((c) => c.id === selectedConnectorId);
  const isCompatible = selectedConnector ? vehicle.supportedConnectors.includes(selectedConnector.type) : false;

  const timeSlots = [
    '01:45 PM - 02:30 PM',
    '02:30 PM - 03:15 PM',
    '03:15 PM - 04:00 PM',
    '04:00 PM - 04:45 PM',
    '05:00 PM - 05:45 PM',
  ];

  // Price calculations
  const pricePerKwh = selectedConnector?.pricePerKwh || 20;
  const estimatedEnergyCost = Math.round(estimatedKwh * pricePerKwh);
  const reservationFee = station.reservationFee || 25;
  const subtotal = estimatedEnergyCost + reservationFee;
  const gstTax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gstTax;

  const handleStartVerification = () => {
    setStep('verifying');

    // Simulate 2-phase operator verification:
    // 1. Atomic slot hold with operator OCPI API
    // 2. Payment authorization confirmation
    setTimeout(() => {
      const newBooking: Booking = {
        id: `BK-${Date.now().toString().slice(-4)}`,
        stationId: station.id,
        stationName: station.name,
        network: station.network,
        address: station.address,
        connectorType: selectedConnector?.type || 'CCS2',
        powerKw: selectedConnector?.powerKw || 60,
        date: 'Today, Nov 10, 2026',
        timeSlot: selectedSlot,
        durationMinutes,
        status: 'operator_confirmed',
        bookingFee: reservationFee,
        estimatedEnergyCost,
        totalPaid: grandTotal,
        qrCodeToken: `ONE-EV-${station.operatorId.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        operatorReservationReference: `${station.network.slice(0, 4).toUpperCase()}-RES-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCreatedBooking(newBooking);
      setStep('confirmed');
      onBookingConfirmed(newBooking);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>VERIFIED OPERATOR RESERVATION</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">{station.name}</h3>
            <div className="text-xs text-slate-400">{station.address}</div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Connector & Time Slot */}
        {step === 'select' && (
          <div className="space-y-5">
            {/* Connector Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Select Charging Bay & Connector
              </label>
              <div className="space-y-2">
                {station.connectors.map((c) => {
                  const compat = vehicle.supportedConnectors.includes(c.type);
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConnectorId(c.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        selectedConnectorId === c.id
                          ? 'bg-teal-500/10 border-teal-500/60 shadow-sm'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          selectedConnectorId === c.id ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }`}>
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{c.type} · {c.powerKw} kW</span>
                            {compat && (
                              <span className="text-[10px] text-emerald-400 font-mono font-medium">
                                ✓ Vehicle Match
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                            Tariff: ₹{c.pricePerKwh}/kWh · {c.status}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-teal-400 font-semibold text-xs">
                        {c.isBookable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incompatible Warning if any */}
            {!isCompatible && (
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  The selected connector is not natively compatible with {vehicle.name}. Please confirm you carry an authorized adapter before booking.
                </span>
              </div>
            )}

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                2. Select Arrival Time Window (Today)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2.5 text-xs font-mono rounded-lg border transition-all text-center ${
                      selectedSlot === slot
                        ? 'bg-teal-500/10 border-teal-500 text-teal-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                * The bay is held for 15 minutes past scheduled start before auto-release.
              </p>
            </div>

            {/* Estimated Energy Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Estimated Energy Top-up</span>
                <span className="font-mono font-bold text-teal-400 tabular-nums">{estimatedKwh} kWh</span>
              </div>
              <input
                type="range"
                min="5"
                max={Math.round(vehicle.usableCapacityKwh)}
                step="1"
                value={estimatedKwh}
                onChange={(e) => setEstimatedKwh(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5 kWh</span>
                <span>Max battery usable: {vehicle.usableCapacityKwh} kWh</span>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={() => setStep('review')}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Continue to Price Breakdown</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Price Breakdown & Operator Terms */}
        {step === 'review' && (
          <div className="space-y-5">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-white">Booking Summary</div>
              
              <div className="space-y-2 text-xs border-b border-slate-800/80 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Station:</span>
                  <span className="font-medium text-white">{station.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Connector:</span>
                  <span className="font-mono text-white">{selectedConnector?.type} ({selectedConnector?.powerKw} kW)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Window:</span>
                  <span className="font-mono text-white">{selectedSlot}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Est. Energy ({estimatedKwh} kWh × ₹{pricePerKwh}):</span>
                  <span>₹{estimatedEnergyCost}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Slot Hold & Operator Reservation Fee:</span>
                  <span>₹{reservationFee}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>GST (18%):</span>
                  <span>₹{gstTax}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-teal-400">
                  <span>Total Payable:</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Operator Policy Safeguards */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1.5 text-slate-300">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Verified Reservation Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Slot is confirmed directly with {station.network}’s OCPI server. Energy charges are billed strictly by meter consumption at session completion.
              </p>
              <div className="text-[11px] text-slate-400">
                • <strong>Cancellation:</strong> 100% refund up to 30 mins before arrival.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('select')}
                className="w-1/3 py-2.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStartVerification}
                className="w-2/3 py-2.5 px-4 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Bay & Authorize (₹{grandTotal})</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Verifying State (Atomic Hold + Operator Sync) */}
        {step === 'verifying' && (
          <div className="py-12 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-teal-400 animate-spin" />
              <Zap className="w-6 h-6 text-teal-400 absolute inset-0 m-auto" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Synchronizing with {station.network} OCPI</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Executing atomic slot hold and verifying operator confirmation code...
              </p>
            </div>
            <div className="text-[11px] font-mono text-teal-400 bg-slate-950 border border-slate-800 inline-block px-3 py-1.5 rounded-full">
              POST /ocpi/2.2.1/reservations → 200 OK
            </div>
          </div>
        )}

        {/* Step 4: Confirmed Pass */}
        {step === 'confirmed' && createdBooking && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Charger Reserved Successfully</h4>
              <p className="text-xs text-slate-300">
                Physical bay locked at {station.name}. Valid for check-in.
              </p>
            </div>

            {/* Check-in QR Pass */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-center">
              <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                <QrCode className="w-32 h-32 text-slate-950 mx-auto" />
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                  Operator Confirmation Code
                </div>
                <div className="text-xl font-bold font-mono text-teal-400 tracking-wider">
                  {createdBooking.operatorReservationReference}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Token: {createdBooking.qrCodeToken}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-300 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scheduled Slot:</span>
                  <span className="font-medium text-white">{createdBooking.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bay Connector:</span>
                  <span className="font-mono text-white">{createdBooking.connectorType} ({createdBooking.powerKw} kW)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Verified:</span>
                  <span className="font-mono text-emerald-400">₹{createdBooking.totalPaid} (Pre-authorized)</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
