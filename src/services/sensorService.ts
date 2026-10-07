import {
  IrrigationZone,
  LeakDetectionReport,
  WeatherData,
  ZoneStatus,
} from '../types';

/**
 * ESP32 / IoT Hardware Service Layer (sensorService.ts)
 *
 * Ready for future REST API or MQTT WebSocket integration with physical
 * ESP32 / Arduino nodes (e.g., Soil Moisture Capacitive v1.2, DS18B20,
 * YF-S201 Water Flow Sensor, and 12V Solenoid Relays).
 *
 * Currently runs in realistic DEMO MODE with live telemetry simulation.
 */

export interface HardwareEndpointConfig {
  baseUrl: string;
  mqttBrokerUrl: string;
  demoMode: boolean;
  simulateNetworkError: boolean;
}

let hardwareConfig: HardwareEndpointConfig = {
  baseUrl: '/api/v1/iot',
  mqttBrokerUrl: 'wss://iot.aqllisuv.uz:8883/mqtt',
  demoMode: true,
  simulateNetworkError: false,
};

export function getHardwareConfig(): HardwareEndpointConfig {
  return { ...hardwareConfig };
}

export function setHardwareConfig(partial: Partial<HardwareEndpointConfig>): HardwareEndpointConfig {
  hardwareConfig = { ...hardwareConfig, ...partial };
  return { ...hardwareConfig };
}

export function determineZoneStatus(zone: IrrigationZone, minMoisture = 30): ZoneStatus {
  if (!zone.sensorOnline) return 'issue';
  if (zone.valveOpen && Math.abs(zone.expectedFlow - zone.waterFlow) >= 12) {
    return 'issue';
  }
  if (zone.moisture <= minMoisture) {
    return 'needs_irrigation';
  }
  if (zone.moisture <= minMoisture + 11) {
    return 'watch';
  }
  return 'normal';
}

/**
 * Simulates reading fresh telemetry from ESP32 nodes every few seconds.
 * Example:
 * soil moisture: 28 -> 29 -> 30 (when irrigating) or slight natural drift
 * temperature: 31 -> 31.2 -> 30.8
 * water flow: 32 -> 31 -> 33
 */
export function getSensorData(
  currentZones: IrrigationZone[],
  minMoistureThreshold = 30
): IrrigationZone[] {
  if (hardwareConfig.simulateNetworkError) {
    throw new Error('Sensor bilan aloqa vaqtincha mavjud emas.');
  }

  return currentZones.map((zone) => {
    if (!zone.sensorOnline) return zone;

    // Temperature micro-fluctuation: e.g. 31 -> 31.2 -> 30.8
    const tempDelta = (Math.random() - 0.48) * 0.3;
    const nextTemp = Number(Math.max(18, Math.min(43, zone.temperature + tempDelta)).toFixed(1));

    // Moisture & water flow dynamics
    let nextMoisture = zone.moisture;
    let nextFlow = 0;
    let nextPressure = zone.pressure;
    let nextDailyWater = zone.dailyWaterUsed;

    if (zone.valveOpen && zone.pumpRunning) {
      // If Z8 has the simulated blockage, keep flow around 8 L/min unless fixed
      if (zone.id === 'Z8' && zone.waterFlow <= 12) {
        nextFlow = Math.max(6, Math.min(10, Math.round(8 + (Math.random() - 0.5) * 2)));
        nextPressure = Number((1.6 + (Math.random() - 0.5) * 0.1).toFixed(1));
      } else if (zone.waterFlow > zone.expectedFlow + 15) {
        // Simulated leak state if active
        nextFlow = Math.round(zone.waterFlow + (Math.random() - 0.5) * 2);
        nextPressure = Number((1.7 + (Math.random() - 0.5) * 0.1).toFixed(1));
      } else {
        // Normal active flow: 32 -> 31 -> 33
        const flowJitter = Math.round((Math.random() - 0.5) * 2.4);
        nextFlow = Math.max(18, zone.expectedFlow + flowJitter);
        nextPressure = Number((2.4 + (Math.random() - 0.5) * 0.15).toFixed(1));
      }

      // Soil moisture increases gradually when irrigating
      if (Math.random() > 0.35) {
        nextMoisture = Math.min(82, zone.moisture + 1);
      }
      nextDailyWater = zone.dailyWaterUsed + Math.round(nextFlow / 12);
    } else {
      nextFlow = 0;
      nextPressure = Number((2.4 + (Math.random() - 0.5) * 0.1).toFixed(1));
      // Natural slow evapotranspiration drop occasionally
      if (Math.random() > 0.86 && zone.moisture > 18) {
        nextMoisture = zone.moisture - 1;
      }
    }

    const updated: IrrigationZone = {
      ...zone,
      moisture: nextMoisture,
      temperature: nextTemp,
      waterFlow: nextFlow,
      pressure: nextPressure,
      dailyWaterUsed: nextDailyWater,
    };

    updated.status = determineZoneStatus(updated, minMoistureThreshold);
    return updated;
  });
}

export function getZoneStatus(zone: IrrigationZone, minMoisture = 30): ZoneStatus {
  return determineZoneStatus(zone, minMoisture);
}

export async function updateValve(
  zone: IrrigationZone,
  open: boolean,
  minMoisture = 30
): Promise<IrrigationZone> {
  if (hardwareConfig.simulateNetworkError) {
    throw new Error('Klapan boshqaruv blokiga ulanib bo‘lmadi. Tarmoqni tekshiring.');
  }

  const nowStr = new Date().toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const nextPump = open ? true : zone.pumpRunning;
  const nextFlow = open ? (zone.id === 'Z8' && zone.status === 'issue' ? 8 : zone.expectedFlow) : 0;

  const updated: IrrigationZone = {
    ...zone,
    valveOpen: open,
    pumpRunning: open ? nextPump : false,
    waterFlow: nextFlow,
    lastIrrigation: open ? `Bugun, ${nowStr}` : zone.lastIrrigation,
  };

  updated.status = determineZoneStatus(updated, minMoisture);
  return updated;
}

export async function updatePump(
  zone: IrrigationZone,
  running: boolean,
  minMoisture = 30
): Promise<IrrigationZone> {
  if (hardwareConfig.simulateNetworkError) {
    throw new Error('Nasos stansiyasi kontrolleri javob bermayapti.');
  }

  const nextFlow = running && zone.valveOpen ? zone.expectedFlow : 0;
  const updated: IrrigationZone = {
    ...zone,
    pumpRunning: running,
    waterFlow: nextFlow,
  };

  updated.status = determineZoneStatus(updated, minMoisture);
  return updated;
}

export async function sendSensorData(payload: Partial<IrrigationZone> & { id: string }): Promise<{
  ok: boolean;
  receivedAt: string;
}> {
  if (hardwareConfig.simulateNetworkError) {
    throw new Error('ESP32 telemetriya paketini yuborishda xatolik yuz berdi.');
  }
  return {
    ok: true,
    receivedAt: new Date().toISOString(),
  };
}

/**
 * Water Leak & Flow Anomaly Detection Service
 * Compares expected vs actual flow rate across active zones or simulated main pipeline test.
 */
export function runLeakDiagnostic(
  zones: IrrigationZone[],
  simulateMainPipeLeakTest = false
): LeakDetectionReport {
  const nowStr = new Date().toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (simulateMainPipeLeakTest) {
    return {
      timestamp: `Bugun, ${nowStr}`,
      expectedTotalFlow: 30,
      actualTotalFlow: 68,
      mainPipePressure: 1.7,
      hasLeak: true,
      suspectedZoneId: 'Z3 - Asosiy kollektor',
      anomalyType: 'leak',
      details:
        'Asosiy magistral quvurda kutilayotgan 30 L/min o‘rniga 68 L/min (+126%) suv oqimi va bosim pasayishi (1.7 bar) aniqlandi. Ehtimoliy suv sizib chiqishi!',
    };
  }

  const activeZones = zones.filter((z) => z.valveOpen);
  const expectedTotal = activeZones.reduce((sum, z) => sum + z.expectedFlow, 0);
  const actualTotal = activeZones.reduce((sum, z) => sum + z.waterFlow, 0);

  const blockageZone = activeZones.find((z) => z.expectedFlow - z.waterFlow >= 12);
  const leakZone = activeZones.find((z) => z.waterFlow - z.expectedFlow >= 12);

  if (leakZone) {
    return {
      timestamp: `Bugun, ${nowStr}`,
      expectedTotalFlow: expectedTotal,
      actualTotalFlow: actualTotal,
      mainPipePressure: 1.8,
      hasLeak: true,
      suspectedZoneId: leakZone.id,
      anomalyType: 'leak',
      details: `${leakZone.id} tarmog‘ida kutilgan ${leakZone.expectedFlow} L/min o‘rniga ${leakZone.waterFlow} L/min oqim qayd etildi. Quvurda sizib chiqish aniqlandi.`,
    };
  }

  if (blockageZone) {
    return {
      timestamp: `Bugun, ${nowStr}`,
      expectedTotalFlow: expectedTotal,
      actualTotalFlow: actualTotal,
      mainPipePressure: 2.1,
      hasLeak: false,
      suspectedZoneId: blockageZone.id,
      anomalyType: 'blockage',
      details: `${blockageZone.id} tarmog‘ida kutilgan ${blockageZone.expectedFlow} L/min o‘rniga atigi ${blockageZone.waterFlow} L/min oqim o‘tmoqda. Quvur tiqilishi yoki klapan nosozligi.`,
    };
  }

  return {
    timestamp: `Bugun, ${nowStr}`,
    expectedTotalFlow: expectedTotal || 30,
    actualTotalFlow: actualTotal || 30,
    mainPipePressure: 2.4,
    hasLeak: false,
    suspectedZoneId: null,
    anomalyType: 'nominal',
    details: 'Barcha quvur tarmoqlari va klapanlarda suv oqimi me’yorida. Sizib chiqish aniqlanmadi.',
  };
}

export async function fetchWeatherData(current: WeatherData): Promise<WeatherData> {
  return current;
}
