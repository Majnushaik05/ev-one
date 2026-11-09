import React from 'react';
import { 
  Zap, 
  MapPin, 
  Car, 
  Building2, 
  Truck, 
  ShieldCheck, 
  ChevronDown
} from 'lucide-react';
import { Vehicle } from '../types/ev';

export type AppPersona = 'consumer_driver' | 'station_partner' | 'fleet_manager' | 'admin_quality';
export type ConsumerTab = 'home' | 'planner' | 'explore' | 'garage' | 'live_session' | 'history' | 'marketplace';

interface NavbarProps {
  currentPersona: AppPersona;
  onSelectPersona: (p: AppPersona) => void;
  activeConsumerTab: ConsumerTab;
  onSelectConsumerTab: (tab: ConsumerTab) => void;
  activeVehicle: Vehicle;
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  onOpenPlans: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  onSelectPersona,
  activeConsumerTab,
  onSelectConsumerTab,
  activeVehicle,
  vehicles,
  onSelectVehicle,
  onOpenPlans,
}) => {
  const [vehicleDropdownOpen, setVehicleDropdownOpen] = React.useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = React.useState(false);

  const personaLabels: Record<AppPersona, { label: string; icon: React.ReactNode; subtext: string }> = {
    consumer_driver: { label: 'Driver App', icon: <Car className="w-4 h-4 text-teal-400" />, subtext: 'Cars, 2W, Autos & Taxis' },
    station_partner: { label: 'Station Partner', icon: <Building2 className="w-4 h-4 text-emerald-400" />, subtext: 'Operator Tariffs & Slots' },
    fleet_manager: { label: 'Fleet Portal', icon: <Truck className="w-4 h-4 text-cyan-400" />, subtext: 'Commercial & Multi-Vehicle' },
    admin_quality: { label: 'Data Quality & Ops', icon: <ShieldCheck className="w-4 h-4 text-amber-400" />, subtext: 'Operator Sync & Telemetry' },
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark & Mode Switcher */}
        <div className="flex items-center gap-4 shrink-0">
          <div 
            onClick={() => onSelectConsumerTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-sm shadow-teal-500/20">
              <Zap className="w-5 h-5 fill-slate-950 stroke-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
              ONE<span className="text-teal-400">EV</span>
            </span>
          </div>

          {/* Persona selector popover */}
          <div className="relative">
            <button
              onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-md transition-colors"
              aria-label="Switch portal persona"
            >
              {personaLabels[currentPersona].icon}
              <span className="hidden sm:inline">{personaLabels[currentPersona].label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {personaDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  Switch Platform Portal
                </div>
                {(Object.keys(personaLabels) as AppPersona[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      onSelectPersona(key);
                      setPersonaDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-800/70 transition-colors ${
                      currentPersona === key ? 'bg-slate-800/90 text-teal-400 font-medium' : 'text-slate-300'
                    }`}
                  >
                    {personaLabels[key].icon}
                    <div>
                      <div className="text-xs">{personaLabels[key].label}</div>
                      <div className="text-[10px] text-slate-400">{personaLabels[key].subtext}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links (for Consumer Driver) or Status Context */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium text-slate-400">
          {currentPersona === 'consumer_driver' ? (
            <>
              <button
                onClick={() => onSelectConsumerTab('home')}
                className={`whitespace-nowrap transition-colors ${
                  activeConsumerTab === 'home' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onSelectConsumerTab('planner')}
                className={`whitespace-nowrap transition-colors ${
                  activeConsumerTab === 'planner' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                Plan Journey
              </button>
              <button
                onClick={() => onSelectConsumerTab('explore')}
                className={`whitespace-nowrap transition-colors ${
                  activeConsumerTab === 'explore' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                Explore Chargers
              </button>
              <button
                onClick={() => onSelectConsumerTab('garage')}
                className={`whitespace-nowrap transition-colors ${
                  activeConsumerTab === 'garage' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                My Garage
              </button>
              <button
                onClick={() => onSelectConsumerTab('live_session')}
                className={`whitespace-nowrap transition-colors ${
                  activeConsumerTab === 'live_session' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                Live Charging
              </button>
              <button
                onClick={() => onSelectConsumerTab('history')}
                className={`whitespace-nowrap transition-colors ${
                  activeConsumerTab === 'history' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                History & Spend
              </button>
              <button
                onClick={() => onSelectConsumerTab('marketplace')}
                className={`whitespace-nowrap transition-colors ${
                  activeConsumerTab === 'marketplace' ? 'text-teal-400 font-semibold' : 'hover:text-slate-200'
                }`}
              >
                Marketplace
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-slate-200 font-medium">{personaLabels[currentPersona].label}</span>
              <span>·</span>
              <span>Operator & Enterprise Environment</span>
            </div>
          )}
        </nav>

        {/* Zone 3: Active Vehicle Chip & Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Active Vehicle Selector */}
          <div className="relative">
            <button
              onClick={() => setVehicleDropdownOpen(!vehicleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="font-medium max-w-[120px] truncate">{activeVehicle.name}</span>
              <span className="text-slate-400 font-mono tabular-nums">{activeVehicle.currentBatteryPercent}%</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {vehicleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex justify-between items-center">
                  <span>Selected Vehicle</span>
                  <button 
                    onClick={() => {
                      onSelectConsumerTab('garage');
                      setVehicleDropdownOpen(false);
                    }}
                    className="text-teal-400 hover:underline"
                  >
                    Manage Garage
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        onSelectVehicle(v);
                        setVehicleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        activeVehicle.id === v.id ? 'bg-slate-800/80 text-teal-300' : 'text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium truncate">{v.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {v.usableCapacityKwh} kWh · {v.supportedConnectors.join(', ')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono tabular-nums font-semibold">{v.currentBatteryPercent}%</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ~{Math.round((v.realWorldRangeKm * v.currentBatteryPercent) / 100)} km
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Plans / Tier Button */}
          <button
            onClick={onOpenPlans}
            className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 rounded-md transition-colors"
          >
            Tiers & Access
          </button>

          {/* Primary Action Button */}
          {currentPersona === 'consumer_driver' ? (
            <button
              onClick={() => onSelectConsumerTab('planner')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors shadow-sm shadow-teal-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Plan Trip</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectPersona('consumer_driver')}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors shadow-sm shadow-teal-500/20 whitespace-nowrap shrink-0"
            >
              Back to Driver App
            </button>
          )}
        </div>

      </div>

      {/* Mobile navigation tab strip */}
      {currentPersona === 'consumer_driver' && (
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 text-xs border-t border-slate-800/60 mt-2">
          {(['home', 'planner', 'explore', 'garage', 'live_session', 'history', 'marketplace'] as ConsumerTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => onSelectConsumerTab(tab)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap shrink-0 ${
                  activeConsumerTab === tab
                    ? 'bg-slate-800 text-teal-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'home' && 'Home'}
                {tab === 'planner' && 'Plan'}
                {tab === 'explore' && 'Explore'}
                {tab === 'garage' && 'Garage'}
                {tab === 'live_session' && 'Live Charge'}
                {tab === 'history' && 'History'}
                {tab === 'marketplace' && 'Marketplace'}
              </button>
            )
          )}
        </div>
      )}
    </header>
  );
};
