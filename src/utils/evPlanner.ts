import { Vehicle, ChargingStation, RoutePlan, RouteStop, Connector, RouteCostAnalysis, StopCostBreakdown } from '../types/ev';

export interface PlanTripParams {
  origin: string;
  destination: string;
  vehicle: Vehicle;
  departureSocPercent: number;
  reserveBufferPercent: number;
  drivingStyle: 'eco' | 'normal' | 'spirited';
  acSetting: 'off' | 'normal' | 'max_cool';
  allStations: ChargingStation[];
  routingPreference?: 'balanced' | 'fastest_charger' | 'lowest_cost';
}

export function calculateTripRoute(params: PlanTripParams): RoutePlan {
  const {
    origin,
    destination,
    vehicle,
    departureSocPercent,
    reserveBufferPercent,
    drivingStyle,
    acSetting,
    allStations,
    routingPreference = 'balanced',
  } = params;

  // Real highway corridor distances in India
  let baseDistanceKm = 145; // Default Bengaluru to Mysuru
  const lowerDest = destination.toLowerCase();

  if (lowerDest.includes('mysuru') || lowerDest.includes('mysore')) {
    baseDistanceKm = 148;
  } else if (lowerDest.includes('coimbatore') || lowerDest.includes('ooty')) {
    baseDistanceKm = 360;
  } else if (lowerDest.includes('chennai')) {
    baseDistanceKm = 345;
  } else if (lowerDest.includes('pune') || lowerDest.includes('mumbai')) {
    baseDistanceKm = 160;
  } else if (lowerDest.includes('hyderabad')) {
    baseDistanceKm = 570;
  } else if (lowerDest.includes('airport') || lowerDest.includes('kempegowda')) {
    baseDistanceKm = 48;
  }

  // Speed and climate penalty factors
  let consumptionFactor = 1.0;
  if (drivingStyle === 'eco') consumptionFactor *= 0.92;
  if (drivingStyle === 'spirited') consumptionFactor *= 1.18;
  if (acSetting === 'normal') consumptionFactor *= 1.06;
  if (acSetting === 'max_cool') consumptionFactor *= 1.14;

  const adjustedWhPerKm = vehicle.efficiencyWhPerKm * consumptionFactor;

  // Current usable energy at departure
  const startUsableKwh = (vehicle.usableCapacityKwh * departureSocPercent) / 100;
  const reserveThresholdKwh = (vehicle.usableCapacityKwh * reserveBufferPercent) / 100;
  const availableKwhBeforeReserve = Math.max(0, startUsableKwh - reserveThresholdKwh);

  // Maximum distance reachable before reaching safety buffer reserve
  const maxSafeDistanceKm = Math.round((availableKwhBeforeReserve * 1000) / adjustedWhPerKm);

  const stops: RouteStop[] = [];
  const needsCharging = baseDistanceKm > maxSafeDistanceKm;

  if (needsCharging) {
    // Filter compatible stations
    const compatibleStations = allStations.filter((st) => {
      if (st.status === 'out_of_service') return false;
      return st.connectors.some((conn) => 
        vehicle.supportedConnectors.includes(conn.type)
      );
    });

    // Check if route requires 1 or 2 stops
    const numStopsNeeded = baseDistanceKm > (vehicle.realWorldRangeKm * 0.85) ? 2 : 1;

    // Sort stations based on preference:
    // 'lowest_cost' sorts by min pricePerKwh
    // 'fastest_charger' sorts by max powerKw
    // 'balanced' prioritizes verified partners on the corridor
    const rankedStations = [...compatibleStations].sort((a, b) => {
      const aMinPrice = Math.min(...a.connectors.map((c) => c.pricePerKwh));
      const bMinPrice = Math.min(...b.connectors.map((c) => c.pricePerKwh));
      const aMaxKw = Math.max(...a.connectors.map((c) => c.powerKw));
      const bMaxKw = Math.max(...b.connectors.map((c) => c.powerKw));

      if (routingPreference === 'lowest_cost') {
        return aMinPrice - bMinPrice;
      }
      if (routingPreference === 'fastest_charger') {
        return bMaxKw - aMaxKw;
      }
      // Balanced: verified partners first, then price/power balance
      if (a.integrationLevel === 'verified_partner' && b.integrationLevel !== 'verified_partner') return -1;
      if (b.integrationLevel === 'verified_partner' && a.integrationLevel !== 'verified_partner') return 1;
      return aMinPrice - bMinPrice;
    });

    const chosenStations = rankedStations.slice(0, numStopsNeeded);

    let currentBatteryEnergy = startUsableKwh;
    let accumulatedDistanceKm = 0;

    chosenStations.forEach((candidate, idx) => {
      const stopDistanceKm = numStopsNeeded === 1
        ? Math.min(Math.round(maxSafeDistanceKm * 0.85), Math.round(baseDistanceKm * 0.55))
        : Math.round((baseDistanceKm / (numStopsNeeded + 1)) * (idx + 1));

      const legDistance = stopDistanceKm - accumulatedDistanceKm;
      const energyUsedLeg = (legDistance * adjustedWhPerKm) / 1000;
      const energyAtArrivalKwh = Math.max(0, currentBatteryEnergy - energyUsedLeg);
      const arrivalSoc = Math.max(
        reserveBufferPercent,
        Math.round((energyAtArrivalKwh / vehicle.usableCapacityKwh) * 100)
      );

      // Connectors matching vehicle
      const matchingConnectors = candidate.connectors.filter((c) =>
        vehicle.supportedConnectors.includes(c.type)
      );
      matchingConnectors.sort((a, b) => {
        if (routingPreference === 'lowest_cost') return a.pricePerKwh - b.pricePerKwh;
        return b.powerKw - a.powerKw;
      });
      const chosenConnector: Connector = matchingConnectors[0];

      const targetSoc = 85; // Optimal charging taper
      const targetKwh = (vehicle.usableCapacityKwh * targetSoc) / 100;
      const energyToChargeKwh = Math.max(5, targetKwh - energyAtArrivalKwh);

      const effectivePowerKw = Math.min(
        chosenConnector.powerKw,
        chosenConnector.type.includes('CCS') || chosenConnector.type.includes('DC')
          ? vehicle.maxDcChargeKw
          : vehicle.maxAcChargeKw
      );
      const realisticAverageKw = effectivePowerKw * 0.82;
      const chargeTimeMinutes = Math.round((energyToChargeKwh / realisticAverageKw) * 60) + 4;

      // Price per kWh and detailed tariff breakdown
      const pricePerKwh = chosenConnector.pricePerKwh;
      const baseEnergyCost = Math.round(energyToChargeKwh * pricePerKwh);
      const reservationFee = candidate.reservationFee || 0;
      const gstTax = Math.round((baseEnergyCost + reservationFee) * 0.18);
      const totalStopCost = baseEnergyCost + reservationFee + gstTax;
      const effectiveCostPerKm = legDistance > 0 ? Number((totalStopCost / legDistance).toFixed(2)) : 0;

      const costBreakdown: StopCostBreakdown = {
        pricePerKwh,
        energyKwh: Number(energyToChargeKwh.toFixed(1)),
        energyCost: baseEnergyCost,
        reservationFee,
        gstTax,
        totalStopCost,
        effectiveCostPerKm,
      };

      stops.push({
        station: candidate,
        selectedConnector: chosenConnector,
        distanceFromOriginKm: stopDistanceKm,
        arrivalBatteryPercent: arrivalSoc,
        targetBatteryPercent: targetSoc,
        chargeTimeMinutes,
        energyNeededKwh: Number(energyToChargeKwh.toFixed(1)),
        estimatedCost: totalStopCost,
        costBreakdown,
        detourMinutes: 2,
        isRecommendedStop: true,
        reserveSafetyMarginPercent: reserveBufferPercent,
      });

      currentBatteryEnergy = targetKwh;
      accumulatedDistanceKm = stopDistanceKm;
    });
  }

  // Calculate final arrival SOC
  let remainingDistanceAfterLastStop = baseDistanceKm;
  let energyAtLastDepartureKwh = startUsableKwh;

  if (stops.length > 0) {
    const lastStop = stops[stops.length - 1];
    remainingDistanceAfterLastStop = baseDistanceKm - lastStop.distanceFromOriginKm;
    energyAtLastDepartureKwh = (vehicle.usableCapacityKwh * lastStop.targetBatteryPercent) / 100;
  }

  const finalLegEnergyKwh = (remainingDistanceAfterLastStop * adjustedWhPerKm) / 1000;
  const finalEnergyKwh = Math.max(0, energyAtLastDepartureKwh - finalLegEnergyKwh);
  const arrivalBatteryPercent = Math.max(3, Math.round((finalEnergyKwh / vehicle.usableCapacityKwh) * 100));

  const avgSpeedKmh = baseDistanceKm > 200 ? 75 : 62;
  const totalDriveTimeMinutes = Math.round((baseDistanceKm / avgSpeedKmh) * 60);
  const totalChargeTimeMinutes = stops.reduce((acc, s) => acc + s.chargeTimeMinutes, 0);

  // Aggregate Route Cost Analysis
  const totalEnergyKwh = Number(stops.reduce((acc, s) => acc + s.costBreakdown.energyKwh, 0).toFixed(1));
  const totalBaseEnergyCost = stops.reduce((acc, s) => acc + s.costBreakdown.energyCost, 0);
  const totalReservationFees = stops.reduce((acc, s) => acc + s.costBreakdown.reservationFee, 0);
  const totalGstTax = stops.reduce((acc, s) => acc + s.costBreakdown.gstTax, 0);
  const totalChargingCost = totalBaseEnergyCost + totalReservationFees + totalGstTax;

  const weightedAvgPricePerKwh = totalEnergyKwh > 0
    ? Number((totalBaseEnergyCost / totalEnergyKwh).toFixed(2))
    : (allStations[0]?.connectors[0]?.pricePerKwh || 20);

  const costPerKm = Number((totalChargingCost / baseDistanceKm).toFixed(2));
  
  // Benchmark against equivalent petrol vehicle: 15 km/L @ ₹102/L (~₹6.80/km)
  const equivalentFuelCost = Math.round(baseDistanceKm * 6.80);
  const fuelSavings = Math.max(0, equivalentFuelCost - totalChargingCost);
  const savingsPercent = equivalentFuelCost > 0 ? Math.round((fuelSavings / equivalentFuelCost) * 100) : 0;
  const homeChargingAlternativeCost = Math.round(totalEnergyKwh * 7.50); // ₹7.50/kWh residential average

  const costAnalysis: RouteCostAnalysis = {
    totalEnergyKwh,
    weightedAvgPricePerKwh,
    totalBaseEnergyCost,
    totalReservationFees,
    totalGstTax,
    totalChargingCost,
    costPerKm,
    equivalentFuelCost,
    fuelSavings,
    savingsPercent,
    homeChargingAlternativeCost,
  };

  const totalCostEstimate = {
    min: Math.round(totalChargingCost * 0.95),
    max: Math.round(totalChargingCost * 1.10),
  };

  return {
    id: `plan_${Date.now()}`,
    origin,
    destination,
    totalDistanceKm: baseDistanceKm,
    totalDriveTimeMinutes,
    totalChargeTimeMinutes,
    stops,
    totalCostEstimate,
    costAnalysis,
    departureBatteryPercent: departureSocPercent,
    arrivalBatteryPercent,
    safetyReservePercent: reserveBufferPercent,
    assumptions: {
      avgSpeedKmh,
      ambientTempC: 31,
      acLoad: acSetting === 'off' ? 'Off' : acSetting === 'normal' ? 'Normal (23°C)' : 'High (19°C Cool)',
      drivingStyle,
    },
  };
}
