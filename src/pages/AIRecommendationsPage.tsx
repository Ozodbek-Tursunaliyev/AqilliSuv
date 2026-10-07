import React, { useState } from 'react';
import {
  Bot,
  Play,
  SlidersHorizontal,
  Info,
  Droplets,
  Thermometer,
  CloudRain,
  Activity,
  CheckCircle2,
  Wrench,
} from 'lucide-react';
import {
  AIRecommendation,
  IrrigationZone,
  UserRole,
  WeatherData,
} from '../types';

interface AIRecommendationsPageProps {
  recommendations: AIRecommendation[];
  zones: IrrigationZone[];
  weather: WeatherData;
  userRole: UserRole;
  onStartIrrigation: (zoneId: string, durationMin: number) => void;
  onManageZone: (zone: IrrigationZone) => void;
  onFixZoneIssue: (zoneId: string) => void;
}

export const AIRecommendationsPage: React.FC<AIRecommendationsPageProps> = ({
  recommendations,
  zones,
  weather,
  userRole,
  onStartIrrigation,
  onManageZone,
  onFixZoneIssue,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'irrigate' | 'inspect' | 'postpone'>('all');

  const canControl = userRole === 'admin' || userRole === 'operator';

  const filteredRecs = recommendations.filter((r) => {
    if (filterType === 'all') return true;
    if (filterType === 'postpone') return r.type === 'postpone' || r.type === 'optimal';
    return r.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            INTELLEKTUAL QAROR QABUL QILISH TIZIMI
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            🤖 AqlliSuv AI
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Sun’iy intellekt asosida sug‘orish tavsiyalari
          </p>
        </div>

        {/* Prototype Decision-Support Transparency Note */}
        <div className="max-w-md p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block">
              Qarorlarni qo‘llab-quvvatlash prototipi (calculateIrrigationRecommendation)
            </span>
            <span className="text-slate-400 text-[11px]">
              Tuproq namligi, harorat, havo namligi, suv oqimi, bosim, yomg‘ir ehtimoli va ekin turi
              asosida hisoblanadi. Kelgusida o‘qitilgan ML-modelga ulanadi.
            </span>
          </div>
        </div>
      </div>

      {/* Input Factors Analyzed by AI Engine */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Tuproq namligi', val: '28% – 67%' },
          { label: 'Dala harorati', val: '26.8°C – 31°C' },
          { label: 'Havo namligi', val: `${weather.humidity}%` },
          { label: 'Suv oqimi', val: '8 – 32 L/min' },
          { label: 'Quvur bosimi', val: '1.6 – 2.6 bar' },
          { label: 'Yomg‘ir ehtimoli', val: `${weather.rainProbability}%` },
          { label: 'Oxirgi sug‘orish', val: 'Soatlik jurnal' },
          { label: 'Ekin turlari', val: '10 xil agro-kultura' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#0F172A] border border-slate-800/80 rounded-xl p-3 text-xs"
          >
            <span className="text-slate-400 block truncate">{item.label}</span>
            <span className="font-mono font-semibold text-cyan-300 mt-1 block">{item.val}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0F172A] border border-slate-800 rounded-xl">
          {[
            { id: 'all', label: `Barcha tahlillar (${recommendations.length})` },
            { id: 'irrigate', label: '🔴 Sug‘orish tavsiya etilganlar' },
            { id: 'inspect', label: '⚠️ Tekshiruv zarur (Oqim/Quvur)' },
            { id: 'postpone', label: '🟢 Hozir sug‘orish shart emas' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterType(t.id as typeof filterType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterType === t.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRecs.map((rec) => {
          const zoneObj = zones.find((z) => z.id === rec.zoneId);
          const isRed = rec.statusColor === 'red';
          const isAmber = rec.statusColor === 'amber';

          const borderClass = isRed
            ? 'border-red-500/45 bg-gradient-to-b from-red-950/15 to-[#0F172A]'
            : isAmber
            ? 'border-amber-500/45 bg-gradient-to-b from-amber-950/15 to-[#0F172A]'
            : 'border-emerald-500/35 bg-[#0F172A]';

          return (
            <div
              key={rec.zoneId}
              className={`rounded-2xl border ${borderClass} p-5 flex flex-col justify-between transition-all`}
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {isRed ? '🔴' : isAmber ? '⚠️' : '🟢'}
                      </span>
                      <h3 className="text-xl font-bold font-mono text-white">{rec.zoneId}</h3>
                      <span className="text-xs text-slate-400">· {rec.cropType}</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">{rec.title}</div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className="text-[11px] text-slate-400 block">Ishonchlilik</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {rec.confidence}%
                    </span>
                  </div>
                </div>

                {/* Reason & Telemetry Details */}
                <div className="my-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Sabab:</span>
                    <p className="text-slate-200 leading-relaxed">{rec.reason}</p>
                  </div>

                  {/* Specific Flow Comparison for Z8 or anomaly cards */}
                  {rec.type === 'inspect' && (
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">Kutilayotgan oqim:</span>
                        <span className="text-white font-bold">{rec.expectedFlow} L/min</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">Haqiqiy oqim:</span>
                        <span className="text-amber-400 font-bold">{rec.actualFlow} L/min</span>
                      </div>
                      {rec.possibleCauses && (
                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-slate-400 block mb-1">Ehtimoliy sabablar:</span>
                          <ul className="list-disc list-inside text-amber-200 space-y-0.5">
                            {rec.possibleCauses.map((cause) => (
                              <li key={cause}>{cause}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Decision Output Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>AI TAVSIYASI</span>
                      <span>Muhimlik: {rec.priority}</span>
                    </div>
                    <div className="text-sm font-bold text-emerald-400">
                      {rec.recommendation}
                    </div>
                    {rec.recommendedDurationMin > 0 && (
                      <div className="text-[11px] font-mono text-slate-300 pt-1">
                        Davomiyligi: <strong>{rec.recommendedDurationMin} daqiqa</strong> · Taxminiy
                        suv: <strong>{rec.estimatedWaterLiters} L</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2.5">
                {rec.type === 'irrigate' && (
                  <button
                    type="button"
                    disabled={!canControl}
                    onClick={() =>
                      onStartIrrigation(rec.zoneId, rec.recommendedDurationMin || 18)
                    }
                    className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      canControl
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Sug‘orishni boshlash</span>
                  </button>
                )}

                {rec.type === 'inspect' && canControl && (
                  <button
                    type="button"
                    onClick={() => onFixZoneIssue(rec.zoneId)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Oqimni tiklash / Tozalash</span>
                  </button>
                )}

                {zoneObj && (
                  <button
                    type="button"
                    onClick={() => onManageZone(zoneObj)}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Zona paneli</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
