import React, { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { IrrigationZone } from '../types';
import {
  SoilMoistureChart,
  WeeklyWaterChart,
  ZoneWaterConsumptionChart,
} from '../components/Charts';
import { WEEKLY_WATER_DATA, MONTHLY_WATER_DATA } from '../data/initialData';

interface StatisticsPageProps {
  zones: IrrigationZone[];
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const StatisticsPage: React.FC<StatisticsPageProps> = ({ zones, onShowToast }) => {
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('2026-10-01');
  const [customEnd, setCustomEnd] = useState('2026-10-07');

  const avgMoisture = Math.round(
    zones.reduce((acc, z) => acc + z.moisture, 0) / Math.max(1, zones.length)
  );
  const activeZones = zones.filter((z) => z.valveOpen).length;

  const statsByRange = {
    today: {
      waterSaved: '4 120 L',
      totalIrrigation: '12 450 L',
      avgDuration: '19 daqiqa',
    },
    '7d': {
      waterSaved: '28 920 L',
      totalIrrigation: '87 500 L',
      avgDuration: '21 daqiqa',
    },
    '30d': {
      waterSaved: '112 100 L',
      totalIrrigation: '334 200 L',
      avgDuration: '22 daqiqa',
    },
    custom: {
      waterSaved: '34 600 L',
      totalIrrigation: '96 400 L',
      avgDuration: '20 daqiqa',
    },
  }[range];

  const handleExportCSV = () => {
    const headers = 'Zona,Nomi,Ekin,Namlik(%),Harorat(C),Oqim(L/min),KunlikSuv(L)\n';
    const rows = zones
      .map(
        (z) =>
          `${z.id},"${z.name}","${z.cropType}",${z.moisture},${z.temperature},${z.waterFlow},${z.dailyWaterUsed}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AqlliSuv_Statistika_${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Statistik hisobot CSV formatida yuklab olindi.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Range Filters */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            AGRO-ANALITIKA VA SAMARADORLIK HISOBOTI
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">📊 Statistika</h1>
          <p className="text-xs text-slate-400 mt-1">
            Suv tejamkorligi, namlik tendensiyasi, sug‘orish chastotasi va zonalar samaradorligi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {[
              { id: 'today', label: 'Bugun' },
              { id: '7d', label: '7 kun' },
              { id: '30d', label: '30 kun' },
              { id: 'custom', label: 'Maxsus davr' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id as typeof range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  range === t.id
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV Eksport</span>
          </button>
        </div>
      </div>

      {/* Custom Date Inputs if selected */}
      {range === 'custom' && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Maxsus sana oralig‘ini tanlang:</span>
          </div>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
          />
          <span className="text-slate-500">—</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
          />
        </div>
      )}

      {/* 5 Summary Cards (Section 18) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Tejalgan suv (AI yordamida)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2 tabular-nums">
            {statsByRange.waterSaved}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            An’anaviy sug‘orishga nisbatan 28% kam
          </span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Umumiy sug‘orish hajmi</span>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {statsByRange.totalIrrigation}
          </div>
          <span className="text-[11px] text-cyan-400 font-mono mt-1 block">10 gektar jami</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">O‘rtacha namlik</span>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {avgMoisture}%
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Optimal balans</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">Faol zonalar</span>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-2 tabular-nums">
            {activeZones} / {zones.length}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">Avtomatik nazoratda</span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block">O‘rtacha sug‘orish vaqti</span>
          <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
            {statsByRange.avgDuration}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">1 sikl davomiyligi</span>
        </div>
      </div>

      {/* 4 Analytical Charts: Water consumption, Moisture trend, Irrigation frequency, Zone comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyWaterChart />
        <SoilMoistureChart zones={zones} />
        <ZoneWaterConsumptionChart zones={zones} />

        {/* Irrigation Frequency & Monthly Comparison Chart */}
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400">SUG‘ORISH CHASTOTASI</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Haftalik sug‘orish seanslari va o‘rtacha namlik trendi
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Seanslar soni</span>
          </div>

          <div className="space-y-3 pt-2">
            {(range === '30d' ? MONTHLY_WATER_DATA : WEEKLY_WATER_DATA).map((row, idx) => {
              const label = 'day' in row ? row.day : row.period;
              const maxSess = range === '30d' ? 50 : 10;
              const pct = Math.min(100, Math.round((row.sessions / maxSess) * 100));
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-24 font-mono text-slate-300 shrink-0">{label}</span>
                  <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 text-right font-mono text-white tabular-nums">
                    {row.sessions} seans
                  </span>
                  <span className="w-20 text-right font-mono text-cyan-400 tabular-nums">
                    🌱 {row.avgMoisture}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
