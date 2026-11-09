import React, { useState } from 'react';
import { 
  INITIAL_VEHICLES, 
  INITIAL_STATIONS, 
  INITIAL_BOOKINGS, 
  INITIAL_LIVE_SESSION 
} from './data/mockDatabase';
import { Vehicle, ChargingStation, Booking, ChargingSession } from './types/ev';
import { Navbar, AppPersona, ConsumerTab } from './components/Navbar';
import { HomeDashboard } from './components/home/HomeDashboard';
import { TripPlanner } from './components/planner/TripPlanner';
import { StationExplorer } from './components/explore/StationExplorer';
import { StationDetailsModal } from './components/explore/StationDetailsModal';
import { BookingModal } from './components/booking/BookingModal';
import { GarageView } from './components/garage/GarageView';
import { LiveSessionView } from './components/charging/LiveSessionView';
import { HistoryView } from './components/history/HistoryView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { PartnerPortalView } from './components/partner/PartnerPortalView';
import { FleetPortalView } from './components/fleet/FleetPortalView';
import { DataQualityConsole } from './components/admin/DataQualityConsole';
import { SubscriptionPlansModal } from './components/plans/SubscriptionPlansModal';

export default function App() {
  const [currentPersona, setCurrentPersona] = useState<AppPersona>('consumer_driver');
  const [activeConsumerTab, setActiveConsumerTab] = useState<ConsumerTab>('home');
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle>(INITIAL_VEHICLES[0]);
  
  const [stations, setStations] = useState<ChargingStation[]>(INITIAL_STATIONS);
  const [activeBooking, setActiveBooking] = useState<Booking | undefined>(INITIAL_BOOKINGS[0]);
  const [liveSession, setLiveSession] = useState<ChargingSession | undefined>(INITIAL_LIVE_SESSION);

  // Modals state
  const [inspectingStation, setInspectingStation] = useState<ChargingStation | null>(null);
  const [bookingStation, setBookingStation] = useState<ChargingStation | null>(null);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [plannerDestination, setPlannerDestination] = useState('Mysuru Palace, Mysuru');

  // Handlers
  const handleSelectStation = (station: ChargingStation) => {
    setInspectingStation(station);
  };

  const handleStartBooking = (station: ChargingStation) => {
    if (!station.supportsInAppBooking) {
      alert('This station operates on a walk-in basis with third-party RFID cards. In-app verified booking is unavailable.');
      return;
    }
    setBookingStation(station);
  };

  const handleBookingConfirmed = (newBooking: Booking) => {
    setActiveBooking(newBooking);
  };

  const handleStopSession = (stoppedSession: ChargingSession) => {
    setLiveSession(undefined);
    // Update vehicle battery to reflect session
    setActiveVehicle((prev) => ({
      ...prev,
      currentBatteryPercent: stoppedSession.currentSoc,
    }));
  };

  const handleStartSimulatedSession = () => {
    const newSession: ChargingSession = {
      id: `SES-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      stationId: 'sta_zeon_maddur',
      stationName: 'Zeon Charging Hub — Empire Maddur',
      connectorType: 'CCS2',
      powerKw: 120,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 1,
      currentPowerKw: 88.0,
      energyDeliveredKwh: 1.2,
      startSoc: activeVehicle.currentBatteryPercent,
      currentSoc: activeVehicle.currentBatteryPercent,
      targetSoc: 85,
      costSoFar: 27,
      status: 'charging',
      operatorSyncStatus: 'synced_live',
    };
    setLiveSession(newSession);
    setActiveConsumerTab('live_session');
  };

  const handleAddVehicle = (newVeh: Vehicle) => {
    setVehicles([...vehicles, newVeh]);
    setActiveVehicle(newVeh);
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles(vehicles.map((v) => (v.id === updated.id ? updated : v)));
    if (activeVehicle.id === updated.id) {
      setActiveVehicle(updated);
    }
  };

  const handleUpdateStationTariff = (stationId: string, connectorId: string, newTariff: number) => {
    setStations((prev) =>
      prev.map((st) => {
        if (st.id !== stationId) return st;
        return {
          ...st,
          connectors: st.connectors.map((c) =>
            c.id === connectorId ? { ...c, pricePerKwh: newTariff, lastUpdated: 'Updated just now' } : c
          ),
        };
      })
    );
  };

  const handleToggleConnectorStatus = (stationId: string, connectorId: string) => {
    setStations((prev) =>
      prev.map((st) => {
        if (st.id !== stationId) return st;
        return {
          ...st,
          connectors: st.connectors.map((c) => {
            if (c.id !== connectorId) return c;
            const newStatus = c.status === 'working' ? 'busy' : 'working';
            return {
              ...c,
              status: newStatus,
              isBookable: newStatus === 'working',
              lastUpdated: `Operator override to ${newStatus}`,
            };
          }),
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-300">
      
      {/* Universal Top Bar */}
      <Navbar
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        activeConsumerTab={activeConsumerTab}
        onSelectConsumerTab={setActiveConsumerTab}
        activeVehicle={activeVehicle}
        vehicles={vehicles}
        onSelectVehicle={setActiveVehicle}
        onOpenPlans={() => setShowPlansModal(true)}
      />

      {/* Main View Area Routed by Persona & Consumer Tab */}
      <main className="flex-1 pb-16">
        {currentPersona === 'consumer_driver' && (
          <>
            {activeConsumerTab === 'home' && (
              <HomeDashboard
                vehicle={activeVehicle}
                nearbyStations={stations}
                activeBooking={activeBooking}
                liveSession={liveSession}
                onNavigateToPlanner={(dest) => {
                  if (dest) setPlannerDestination(dest);
                  setActiveConsumerTab('planner');
                }}
                onNavigateToExplore={() => setActiveConsumerTab('explore')}
                onNavigateToLiveSession={() => setActiveConsumerTab('live_session')}
                onSelectStation={handleSelectStation}
                onOpenBookingDetails={() => {
                  if (activeBooking) {
                    const st = stations.find((s) => s.id === activeBooking.stationId) || stations[0];
                    setBookingStation(st);
                  }
                }}
              />
            )}

            {activeConsumerTab === 'planner' && (
              <TripPlanner
                vehicle={activeVehicle}
                allStations={stations}
                initialDestination={plannerDestination}
                onBookStation={handleStartBooking}
                onSelectStation={handleSelectStation}
              />
            )}

            {activeConsumerTab === 'explore' && (
              <StationExplorer
                vehicle={activeVehicle}
                stations={stations}
                onSelectStation={handleSelectStation}
                onBookStation={handleStartBooking}
              />
            )}

            {activeConsumerTab === 'garage' && (
              <GarageView
                vehicles={vehicles}
                activeVehicle={activeVehicle}
                onSelectActiveVehicle={setActiveVehicle}
                onAddVehicle={handleAddVehicle}
                onUpdateVehicle={handleUpdateVehicle}
              />
            )}

            {activeConsumerTab === 'live_session' && (
              <LiveSessionView
                session={liveSession}
                vehicle={activeVehicle}
                onStopSession={handleStopSession}
                onStartSimulatedSession={handleStartSimulatedSession}
              />
            )}

            {activeConsumerTab === 'history' && (
              <HistoryView activeVehicle={activeVehicle} />
            )}

            {activeConsumerTab === 'marketplace' && (
              <MarketplaceView />
            )}
          </>
        )}

        {currentPersona === 'station_partner' && (
          <PartnerPortalView
            stations={stations}
            onUpdateStationTariff={handleUpdateStationTariff}
            onToggleConnectorStatus={handleToggleConnectorStatus}
          />
        )}

        {currentPersona === 'fleet_manager' && (
          <FleetPortalView />
        )}

        {currentPersona === 'admin_quality' && (
          <DataQualityConsole />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-300">ONE EV</span>
            <span>·</span>
            <span>One Platform. Every EV. Smarter Mobility.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Verified OCPI 2.2 / Direct Roaming Standards</span>
            <span>·</span>
            <span>No Simulated Charger Statuses</span>
            <span>·</span>
            <button
              onClick={() => setShowPlansModal(true)}
              className="text-teal-400 hover:underline"
            >
              Subscription Tiers
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {inspectingStation && (
        <StationDetailsModal
          station={inspectingStation}
          vehicle={activeVehicle}
          onClose={() => setInspectingStation(null)}
          onBookStation={(st) => {
            setInspectingStation(null);
            handleStartBooking(st);
          }}
          onReportIssue={(st) => {
            alert(`Report submitted for ${st.name}. Our data verification team has received your feedback.`);
          }}
        />
      )}

      {bookingStation && (
        <BookingModal
          station={bookingStation}
          vehicle={activeVehicle}
          onClose={() => setBookingStation(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {showPlansModal && (
        <SubscriptionPlansModal onClose={() => setShowPlansModal(false)} />
      )}

    </div>
  );
}
