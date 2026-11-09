export type VehicleCategory = 'car_everyday' | 'car_premium' | 'two_wheeler' | 'three_wheeler_auto' | 'commercial';

export type ConnectorType = 
  | 'CCS2' 
  | 'Type 2' 
  | 'GB/T' 
  | 'Bharat AC001' 
  | 'Bharat DC001' 
  | 'CHAdeMO' 
  | 'Ather Dot / LEV DC'
  | 'Standard 15A Socket';

export type DataSourceType = 'manual_input' | 'oem_specification' | 'connected_telematics';

export type ChargerStatus = 'working' | 'busy' | 'out_of_service' | 'unknown';

export type IntegrationLevel = 'verified_partner' | 'public_feed' | 'community_reported';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  batteryCapacityKwh: number;
  usableCapacityKwh: number;
  wltpOrAraiRangeKm: number;
  realWorldRangeKm: number;
  currentBatteryPercent: number;
  maxAcChargeKw: number;
  maxDcChargeKw: number;
  supportedConnectors: ConnectorType[];
  efficiencyWhPerKm: number; // e.g. 135 Wh/km
  dataSource: DataSourceType;
  lastTelemetrySync?: string;
  isPrimary?: boolean;
  registrationNumber?: string;
}

export interface Connector {
  id: string;
  type: ConnectorType;
  powerKw: number;
  status: ChargerStatus;
  pricePerKwh: number;
  currency: string;
  isBookable: boolean;
  lastUpdated: string;
}

export interface StationAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface ChargingStation {
  id: string;
  name: string;
  network: string; // e.g., "Tata Power EZ Charge", "Jio-bp pulse", "Zeon Charging", "Statiq"
  operatorId: string;
  address: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  integrationLevel: IntegrationLevel;
  status: ChargerStatus;
  statusSource: 'operator_direct_api' | 'aggregated_roaming_feed' | 'community_report';
  lastStatusUpdate: string;
  connectors: Connector[];
  amenities: StationAmenity[];
  rating: number;
  reviewCount: number;
  openHours: string;
  supportsInAppBooking: boolean;
  reservationFee: number;
  idleFeePerMin?: number;
  backupStationsNearby?: string[]; // IDs of backup stations
}

export interface StopCostBreakdown {
  pricePerKwh: number;
  energyKwh: number;
  energyCost: number;
  reservationFee: number;
  gstTax: number;
  totalStopCost: number;
  effectiveCostPerKm: number;
}

export interface RouteCostAnalysis {
  totalEnergyKwh: number;
  weightedAvgPricePerKwh: number;
  totalBaseEnergyCost: number;
  totalReservationFees: number;
  totalGstTax: number;
  totalChargingCost: number;
  costPerKm: number;
  equivalentFuelCost: number;
  fuelSavings: number;
  savingsPercent: number;
  homeChargingAlternativeCost: number;
}

export interface RouteStop {
  station: ChargingStation;
  selectedConnector: Connector;
  distanceFromOriginKm: number;
  arrivalBatteryPercent: number;
  targetBatteryPercent: number;
  chargeTimeMinutes: number;
  energyNeededKwh: number;
  estimatedCost: number;
  costBreakdown: StopCostBreakdown;
  detourMinutes: number;
  isRecommendedStop: boolean;
  reserveSafetyMarginPercent: number;
}

export interface RoutePlan {
  id: string;
  origin: string;
  destination: string;
  totalDistanceKm: number;
  totalDriveTimeMinutes: number;
  totalChargeTimeMinutes: number;
  stops: RouteStop[];
  totalCostEstimate: {
    min: number;
    max: number;
  };
  costAnalysis: RouteCostAnalysis;
  departureBatteryPercent: number;
  arrivalBatteryPercent: number;
  safetyReservePercent: number;
  assumptions: {
    avgSpeedKmh: number;
    ambientTempC: number;
    acLoad: string;
    drivingStyle: 'eco' | 'normal' | 'spirited';
  };
}

export interface Booking {
  id: string;
  stationId: string;
  stationName: string;
  network: string;
  address: string;
  connectorType: ConnectorType;
  powerKw: number;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  status: 'held' | 'payment_pending' | 'operator_confirmed' | 'active_charging' | 'completed' | 'cancelled';
  bookingFee: number;
  estimatedEnergyCost: number;
  totalPaid: number;
  qrCodeToken: string;
  idempotencyKey: string;
  operatorReservationReference: string;
  createdAt: string;
}

export interface ChargingSession {
  id: string;
  stationId: string;
  stationName: string;
  network?: string;
  connectorType: ConnectorType;
  powerKw: number;
  startTime: string;
  elapsedMinutes: number;
  currentPowerKw: number;
  energyDeliveredKwh: number;
  startSoc: number;
  currentSoc: number;
  targetSoc: number;
  costSoFar: number;
  status: 'connecting' | 'charging' | 'paused' | 'completing' | 'completed';
  operatorSyncStatus: 'synced_live' | 'delayed_telemetry';
}

export interface FleetVehicle {
  id: string;
  vehicleName: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  category: VehicleCategory;
  currentBatteryPercent: number;
  currentStatus: 'on_route' | 'charging' | 'idle' | 'maintenance';
  currentLocation: string;
  todaySpend: number;
  monthlySpend: number;
  assignedRoute?: string;
  approvedNetworksOnly: boolean;
}

export interface DataQualityReport {
  id: string;
  stationId: string;
  stationName: string;
  network: string;
  issueType: 'stale_feed' | 'connector_mismatch' | 'duplicate_station' | 'tariff_conflict' | 'offline_unreported';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved';
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  category: 'home_charger' | 'portable_cable' | 'adapter' | 'rescue_plan';
  brand: string;
  price: number;
  mrp: number;
  rating: number;
  reviewsCount: number;
  verifiedSeller: string;
  specs: string[];
  inStock: boolean;
  deliveryDays: number;
}
