import React, { useState } from 'react';
import {
  Droplets,
  Activity,
  Gauge,
  Zap,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { IrrigationZone, LeakDetectionReport } from '../types';
import {
  DailyWaterChart,
  WeeklyWaterChart,
  ZoneWaterConsumptionChart,
  FlowRateOverTimeChart,
} from '../components/Charts';
import { runLeakDiagnostic } from '../services/sensorService';

interface WaterMonitoringPageProps {
  zones: IrrigationZone[];
  onTriggerAlert: (title: string, description: string, zoneId: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const WaterMonitoringPage: React.FC<WaterMonitoringPageProps> = ({
  zones,
  onTriggerAlert,
  onShowToast,
}) => {
  const [leakTestSimulated, setLeakTestSimulated] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [leakReport, setLeakReport] = useState<LeakDetectionReport>(() =>
    runLeakDiagnostic(zones, true)
  );

  const todayConsumption = zones.reduce((acc, z) => acc + z.dailyWaterUsed, 0);
  const weeklyConsumption = 87500;
  const monthlyConsumption = 334200;
  const currentTotalFlow = zones.reduce(
    (acc, z) => acc + (z.valveOpen && z.pumpRunning ? z.waterFlow : 0),
    0
  );
  const anyPumpRunning = zones.some((z) => z.pumpRunning);
  const avgPipePressure = (
    zones.reduce((acc, z) => acc + z.pressure, 0) / Math.max(1, zones.length)
  ).toFixed(1);

  const handleSystemInspect = () => {
    setIsScanning(true);
    setTimeout(() => {
      const nextSimState = !leakTestSimulated;
      setLeakTestSimulated(nextSimState);
      const report = runLeakDiagnostic(zones, nextSimState);
      setLeakReport(report);
      setIsScanning(false);

      if (report.hasLeak) {
        onTriggerAlert(
          'Magistral quvurda suv sizib chiqishi aniqlandi (68 L/min)',
          report.details,
          'ASOSIY'
        );
        onShowToast('Ogohlantirish yaratildi: Suv sizib chiqishi ehtimoli!', 'warning');
      } else {
        onShowToast('Tizim tekshirildi: Gidravlik bosim va oqim barqaror.', 'success');
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400">GIDRAVLIK TELEMETRIYA</span>
          <h1 className="text-2xl font-bold text-white mt-0.5">💧 Suv monitoringi</h1>
          <p className="text-xs text-slate-400 mt-1">
            Kunlik, haftalik va oylik suv sarfi, oqim tezligi, magistral bosim hamda suv sizib
            chiqishini aniqlash tizimi
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
          <span>Hisoblagich: YF-S201-PRO</span>
        </div>
      </div>

      {/* 6 Top Metrics (Section 10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Bugungi suv sarfi</span>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {todayConsumption.toLocaleString('ru-RU')} L
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">+8.4% me’yoriy</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Haftalik suv sarfi</span>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {weeklyConsumption.toLocaleString('ru-RU')} L
          </div>
          <span className="text-[11px] text-cyan-400 font-mono mt-1 block">28 920 L tejaldi</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Oylik suv sarfi</span>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {monthlyConsumption.toLocaleString('ru-RU')} L
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">-24% o‘tgan oyga</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Joriy oqim tezligi</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-2 tabular-nums">
            {currentTotalFlow} L/min
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Real vaqtda</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Nasos holati</span>
          <div
            className={`text-2xl font-bold mt-2 ${
              anyPumpRunning ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            {anyPumpRunning ? 'Faol' : 'Kutishda'}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Quvvat: 4.2 kW</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Asosiy quvur bosimi</span>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {avgPipePressure} bar
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Nominal: 2.4 bar</span>
        </div>
      </div>

      {/* Section 16: WATER LEAK DETECTION (Suv sizib chiqishini aniqlash) */}
      <div
        className={`rounded-2xl p-5 border transition-all ${
          leakReport.hasLeak
            ? 'bg-red-950/20 border-red-500/45'
            : 'bg-[#0F172A] border-slate-800/90'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase">
              <span>GIDRAVLIK DIAGNOSTIKA MODULI</span>
              <span>·</span>
              <span>OXIRGI TEKSHIRUV: {leakReport.timestamp}</span>
            </div>
            <h2 className="text-lg font-bold text-white">Suv sizib chiqishini aniqlash</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{leakReport.details}</p>
          </div>

          {/* Expected vs Actual Flow Comparison Box */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[130px]">
              <span className="text-[11px] text-slate-400 block">Kutilayotgan oqim</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {leakReport.expectedTotalFlow} L/min
              </span>
            </div>

            <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center min-w-[130px]">
              <span className="text-[11px] text-slate-400 block">Haqiqiy oqim</span>
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  leakReport.hasLeak ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {leakReport.actualTotalFlow} L/min
              </span>
            </div>

            <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 min-w-[210px]">
              <span className="text-[11px] text-slate-400 block">Diagnostika natijasi:</span>
              {leakReport.hasLeak ? (
                <div className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1.5">
                  <span>🔴 Suv sizib chiqishi ehtimoli aniqlandi</span>
                </div>
              ) : (
                <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>🟢 Quvur tizimi germetik (Me’yorda)</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSystemInspect}
              disabled={isScanning}
              className="px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Tizimni tekshirish</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive Water Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyWaterChart />
        <WeeklyWaterChart />
        <ZoneWaterConsumptionChart zones={zones} />
        <FlowRateOverTimeChart currentFlow={currentTotalFlow} />
      </div>
    </div>
  );
};
