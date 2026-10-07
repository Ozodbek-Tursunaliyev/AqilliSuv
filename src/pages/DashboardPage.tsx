import React from 'react';
import {
  Wind,
  CloudRain,
  Droplets,
  ArrowUpRight,
  Bot,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import {
  AIRecommendation,
  AlertItem,
  IrrigationZone,
  NavPageId,
  User,
  WeatherData,
} from '../types';
import { ZoneCard } from '../components/ZoneCard';
import { FieldMapSVG } from '../components/FieldMapSVG';
import { SoilMoistureChart } from '../components/Charts';

interface DashboardPageProps {
  user: User;
  zones: IrrigationZone[];
  weather: WeatherData;
  recommendations: AIRecommendation[];
  alerts: AlertItem[];
  onManageZone: (zone: IrrigationZone) => void;
  onStartRecommendedIrrigation: (zoneId: string, durationMin: number) => void;
  onNavigate: (page: NavPageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  zones,
  weather,
  recommendations,
  alerts,
  onManageZone,
  onStartRecommendedIrrigation,
  onNavigate,
}) => {
  const firstName = user.name.split(' ')[0] || 'Ozodbek';
  const activeZonesCount = zones.filter((z) => z.valveOpen && z.pumpRunning).length;
  const avgMoisture = Math.round(
    zones.reduce((sum, z) => sum + z.moisture, 0) / Math.max(1, zones.length)
  );
  const totalWaterToday = zones.reduce((sum, z) => sum + z.dailyWaterUsed, 0);
  const anyPumpRunning = zones.some((z) => z.pumpRunning);
  const topRecommendations = recommendations.slice(0, 3);
  const unreadAlerts = alerts.filter((a) => !a.read);

  return (
    <div className="space-y-6">
      {/* Main Greeting & System Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Xush kelibsiz, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bugungi sug‘orish holati va AqlliSuv monitoringi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <span>🟢 Tizim ishlamoqda</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            DEMO MODE · ESP32 Live
          </div>
        </div>
      </div>

      {/* 4 KPI Cards + Weather Card Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {/* KPI CARD 1 */}
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Bugungi suv sarfi</span>
            <span className="text-lg">💧</span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {totalWaterToday.toLocaleString('ru-RU')} L
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-emerald-400 font-semibold">+8.4%</span>
            <span className="text-slate-500">kechagiga nisbatan</span>
          </div>
        </div>

        {/* KPI CARD 2 */}
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">O‘rtacha tuproq namligi</span>
            <span className="text-lg">🌱</span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {avgMoisture}%
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400">Optimal</span>
            <span className="text-slate-500 font-mono">Me’yor: 35%–65%</span>
          </div>
        </div>

        {/* KPI CARD 3 */}
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Faol zonalar</span>
            <span className="text-lg">🚿</span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {activeZonesCount} / {zones.length}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-400 font-mono">
              {zones
                .filter((z) => z.valveOpen)
                .map((z) => z.id)
                .join(', ') || 'Kutishda'}
            </span>
            <span className="text-slate-500">sug‘orilmoqda</span>
          </div>
        </div>

        {/* KPI CARD 4 */}
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Nasos holati</span>
            <span className="text-lg">⚡</span>
          </div>
          <div className="my-3">
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                anyPumpRunning ? 'text-emerald-400' : 'text-slate-300'
              }`}
            >
              {anyPumpRunning ? 'Faol' : 'Kutishda'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Bosim: 2.4 bar</span>
            <span className="text-slate-500">Magistral #1</span>
          </div>
        </div>

        {/* WEATHER CARD (Section 6) */}
        <div className="bg-gradient-to-br from-slate-900 via-[#0F172A] to-cyan-950/30 border border-cyan-500/25 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase">OB-HAVO STANSIYASI</div>
              <div className="text-base font-bold text-white mt-0.5">{weather.location}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">☀️</span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {weather.temperature}°C
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-slate-800/80 text-[11px]">
            <div>
              <span className="text-slate-400 block">Namlik:</span>
              <span className="font-mono font-semibold text-white">{weather.humidity}%</span>
            </div>
            <div>
              <span className="text-slate-400 block">Shamol:</span>
              <span className="font-mono font-semibold text-white">{weather.windSpeed} km/h</span>
            </div>
            <div>
              <span className="text-slate-400 block">Yomg‘ir:</span>
              <span className="font-mono font-semibold text-cyan-300">
                {weather.rainProbability}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Irrigation Zones Grid (Z1 .. Z10) */}
      <div className="bg-[#0F172A]/60 border border-slate-800/90 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              REAL VAQT TELEMETRIYASI
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Sug‘orish zonalari (Z1 – Z10)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('zones')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Barcha zonalar va avtomatika</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {zones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} onManage={onManageZone} />
          ))}
        </div>
      </div>

      {/* 10-Zone Interactive Visual Field Map */}
      <FieldMapSVG zones={zones} onSelectZone={onManageZone} />

      {/* Soil Moisture Analytics + Quick AI & Alerts Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <SoilMoistureChart zones={zones} onSelectZone={onManageZone} />
        </div>

        {/* AI Priority Recommendations Summary */}
        <div className="xl:col-span-5 bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400">AQLLISUV AI QARORLARI</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  🤖 Tezkor AI tavsiyalari
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('ai')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Batafsil</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {topRecommendations.map((rec) => (
                <div
                  key={rec.zoneId}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <span>
                        {rec.statusColor === 'red'
                          ? '🔴'
                          : rec.statusColor === 'amber'
                          ? '⚠️'
                          : '🟢'}
                      </span>
                      <span className="font-mono">{rec.zoneId}</span>
                      <span>—</span>
                      <span>{rec.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{rec.reason}</p>
                    <p className="text-xs font-semibold text-emerald-400 mt-1">
                      AI tavsiyasi: {rec.recommendation} (Ishonchlilik: {rec.confidence}%)
                    </p>
                  </div>

                  {rec.type === 'irrigate' && (
                    <button
                      type="button"
                      onClick={() =>
                        onStartRecommendedIrrigation(rec.zoneId, rec.recommendedDurationMin)
                      }
                      className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs whitespace-nowrap cursor-pointer shrink-0"
                    >
                      Sug‘orishni boshlash
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Unread Alerts Footer Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Faol ogohlantirishlar: {unreadAlerts.length} ta o‘qilmagan</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('alerts')}
              className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Ko‘rish →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
