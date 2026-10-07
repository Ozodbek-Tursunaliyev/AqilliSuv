export type UserRole = 'admin' | 'operator' | 'farmer';

export interface User {
  id: string;
  name: string;
  login: string;
  password?: string;
  role: UserRole;
  roleLabel: string;
  status: 'Faol' | 'Nofaol';
  lastActivity: string;
  department: string;
  phone: string;
}

export type ZoneStatus = 'normal' | 'watch' | 'needs_irrigation' | 'issue';

export interface IrrigationZone {
  id: string; // Z1 .. Z10
  name: string;
  cropType: string;
  areaHectares: number;
  moisture: number; // %
  temperature: number; // °C
  humidity: number; // %
  waterFlow: number; // L/min
  expectedFlow: number; // L/min
  pressure: number; // bar
  valveOpen: boolean;
  pumpRunning: boolean;
  autoMode: boolean;
  lastIrrigation: string;
  status: ZoneStatus;
  sensorOnline: boolean;
  dailyWaterUsed: number; // Liters
  targetMoistureMin: number;
  targetMoistureMax: number;
  soilType: string;
  sensorId: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  evapotranspiration: number; // mm/day
  forecast: Array<{
    day: string;
    temp: number;
    rainProb: number;
    icon: 'sun' | 'cloud' | 'rain';
  }>;
}

export type AIRecommendationType = 'irrigate' | 'postpone' | 'inspect' | 'optimal';

export interface AIRecommendation {
  zoneId: string;
  zoneName: string;
  cropType: string;
  type: AIRecommendationType;
  statusColor: 'red' | 'green' | 'amber' | 'cyan';
  title: string;
  reason: string;
  recommendation: string;
  recommendedDurationMin: number;
  priority: 'Yuqori' | 'O‘rta' | 'Past';
  confidence: number; // %
  moisture: number;
  temperature: number;
  expectedFlow?: number;
  actualFlow?: number;
  possibleCauses?: string[];
  estimatedWaterLiters: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface AlertItem {
  id: string;
  time: string;
  zoneId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  read: boolean;
  status: 'Faol' | 'Hal qilindi' | 'Kuzatuvda';
}

export interface AutomationSettings {
  enabled: boolean;
  minMoisture: number; // 30%
  maxMoisture: number; // 65%
  maxIrrigationDuration: number; // 30 minutes
  rainProtection: boolean;
  leakDetection: boolean;
  pressureProtection: boolean;
}

export interface SystemSettings {
  systemName: string;
  farmName: string;
  location: string;
  totalAreaHectares: number;
  minMoisture: number;
  maxMoisture: number;
  defaultDurationMin: number;
  emailNotification: boolean;
  browserNotification: boolean;
  criticalAlertNotification: boolean;
}

export interface LeakDetectionReport {
  timestamp: string;
  expectedTotalFlow: number;
  actualTotalFlow: number;
  mainPipePressure: number;
  hasLeak: boolean;
  suspectedZoneId: string | null;
  anomalyType: 'leak' | 'blockage' | 'nominal';
  details: string;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
}

export type NavPageId =
  | 'dashboard'
  | 'zones'
  | 'water'
  | 'statistics'
  | 'ai'
  | 'alerts'
  | 'map'
  | 'settings';
