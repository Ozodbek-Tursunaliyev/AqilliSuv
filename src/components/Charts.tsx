import React, { useState } from 'react';
import { IrrigationZone } from '../types';
import { DAILY_HOURLY_WATER_DATA, WEEKLY_WATER_DATA } from '../data/initialData';

/**
 * 1. Soil Moisture Analytics Chart across all 10 zones (Z1..Z10)
 * With period selector: Bugun | 7 kun | 30 kun
 */
interface SoilMoistureChartProps {
  zones: IrrigationZone[];
  onSelectZone?: (zone: IrrigationZone) => void;
}

export const SoilMoistureChart: React.FC<SoilMoistureChartProps> = ({ zones, onSelectZone }) => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today');

  const getAdjustedMoisture = (baseMoisture: number, index: number) => {
    if (period === 'today') return baseMoisture;
    if (period === '7d') return Math.min(78, Math.max(25, baseMoisture + ((index % 3) - 1) * 4));
    return Math.min(80, Math.max(28, baseMoisture + ((index % 2 === 0 ? 1 : -1) * 5)));
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            TUPROQ NAMLIGI TAHLILI
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Tuproq namligi (10 ta zona bo‘yicha ko‘rsatkichlar)
          </h3>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              period === 'today'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bugun
          </button>
          <button
            type="button"
            onClick={() => setPeriod('7d')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              period === '7d'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 kun
          </button>
          <button
            type="button"
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              period === '30d'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            30 kun
          </button>
        </div>
      </div>

      {/* Interactive Vertical Bar Chart for Z1..Z10 */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 sm:gap-3 pt-4 pb-2 items-end h-56 border-b border-slate-800/80 relative">
        {/* Horizontal Reference Lines (30% min, 65% max) */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-red-500/40 pointer-events-none flex justify-end pr-1"
          style={{ bottom: '30%' }}
        >
          <span className="text-[10px] font-mono text-red-400 -mt-4 bg-[#0F172A] px-1">
            Min 30%
          </span>
        </div>
        <div
          className="absolute left-0 right-0 border-t border-dashed border-emerald-500/35 pointer-events-none flex justify-end pr-1"
          style={{ bottom: '65%' }}
        >
          <span className="text-[10px] font-mono text-emerald-400 -mt-4 bg-[#0F172A] px-1">
            Opt 65%
          </span>
        </div>

        {zones.map((zone, idx) => {
          const val = getAdjustedMoisture(zone.moisture, idx);
          const barColor =
            val <= 30
              ? 'from-red-500 to-red-400'
              : val <= 42
              ? 'from-amber-500 to-amber-400'
              : 'from-emerald-500 to-cyan-400';

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone && onSelectZone(zone)}
              className="flex flex-col items-center justify-end h-full group cursor-pointer z-10"
            >
              <span className="text-xs font-mono font-semibold text-slate-200 mb-1.5 tabular-nums group-hover:text-emerald-300 transition-colors">
                {val}%
              </span>
              <div className="w-full max-w-[38px] bg-slate-900/90 rounded-t-lg h-36 flex items-end p-0.5 border border-slate-800/80 group-hover:border-slate-600">
                <div
                  className={`w-full rounded-t-md bg-gradient-to-t ${barColor} transition-all duration-500`}
                  style={{ height: `${Math.min(100, val)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 mt-2">{zone.id}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span>
          O‘rtacha namlik:{' '}
          <strong className="font-mono text-white">
            {Math.round(
              zones.reduce((s, z, i) => s + getAdjustedMoisture(z.moisture, i), 0) / zones.length
            )}
            %
          </strong>
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Z3 (28%) va Z9 (34%) zonalarida namlik nazorat chegarasida
        </span>
      </div>
    </div>
  );
};

/**
 * 2. Daily Water Consumption Chart (Interactive SVG Area + Line Chart)
 */
export const DailyWaterChart: React.FC = () => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const maxLiters = 3800;

  return (
    <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono text-cyan-400">SOATLIK MONITORING</span>
          <h3 className="text-base font-bold text-white mt-0.5">Kunlik suv sarfi (Bugun, Litr)</h3>
        </div>
        <div className="text-right font-mono">
          <div className="text-lg font-bold text-white tabular-nums">12 450 L</div>
          <div className="text-[11px] text-emerald-400">+8.4% kechagiga nisbatan</div>
        </div>
      </div>

      <div className="relative h-52 pt-4">
        <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="waterAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((r, idx) => (
            <line
              key={idx}
              x1="0"
              y1={150 * r}
              x2="600"
              y2={150 * r}
              stroke="#1E293B"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Area & Line Path */}
          {(() => {
            const points = DAILY_HOURLY_WATER_DATA.map((d, i) => {
              const x = (i / (DAILY_HOURLY_WATER_DATA.length - 1)) * 560 + 20;
              const y = 150 - (d.liters / maxLiters) * 130;
              return { x, y, ...d };
            });

            const linePath = points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');
            const areaPath = `${linePath} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

            return (
              <>
                <path d={areaPath} fill="url(#waterAreaGrad)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {points.map((p, i) => (
                  <g
                    key={p.time}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoverIdx === i ? 6 : 4}
                      fill={hoverIdx === i ? '#10B981' : '#090E17'}
                      stroke="#22D3EE"
                      strokeWidth="2.5"
                    />
                    <text
                      x={p.x}
                      y={170}
                      textAnchor="middle"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {p.time}
                    </text>
                    {hoverIdx === i && (
                      <g>
                        <rect
                          x={Math.min(500, Math.max(10, p.x - 45))}
                          y={Math.max(4, p.y - 36)}
                          width="90"
                          height="26"
                          rx="6"
                          fill="#0F172A"
                          stroke="#22D3EE"
                        />
                        <text
                          x={Math.min(545, Math.max(55, p.x))}
                          y={Math.max(21, p.y - 19)}
                          textAnchor="middle"
                          className="fill-white text-[11px] font-mono font-bold"
                        >
                          {p.liters} L
                        </text>
                      </g>
                    )}
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

/**
 * 3. Weekly Water Consumption & Saved Water Chart
 */
export const WeeklyWaterChart: React.FC = () => {
  const maxVal = 16000;

  return (
    <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono text-emerald-400">HAFTALIK DINAMIKA</span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Haftalik suv sarfi va AI tejamkorligi
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 inline-block" /> Sarflangan (L)
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" /> Tejalgan (L)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2.5 pt-4 h-52 items-end border-b border-slate-800/80">
        {WEEKLY_WATER_DATA.map((item) => {
          const usedPct = Math.round((item.used / maxVal) * 100);
          const savedPct = Math.round((item.saved / maxVal) * 100);
          return (
            <div key={item.day} className="flex flex-col items-center h-full justify-end group">
              <div className="text-[10px] font-mono text-slate-400 mb-1 tabular-nums">
                {(item.used / 1000).toFixed(1)}k
              </div>
              <div className="w-full max-w-[42px] h-36 flex items-end justify-center gap-1 bg-slate-900/60 p-1 rounded-t-lg border border-slate-800/70">
                <div
                  className="w-1/2 bg-cyan-400 rounded-t-sm transition-all duration-300"
                  style={{ height: `${usedPct}%` }}
                  title={`Sarflangan: ${item.used} L`}
                />
                <div
                  className="w-1/2 bg-emerald-400 rounded-t-sm transition-all duration-300"
                  style={{ height: `${savedPct}%` }}
                  title={`Tejalgan: ${item.saved} L`}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-300 mt-2 truncate max-w-full">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 4. Water Consumption by Zone (Z1..Z10)
 */
export const ZoneWaterConsumptionChart: React.FC<{ zones: IrrigationZone[] }> = ({ zones }) => {
  const maxZoneWater = Math.max(...zones.map((z) => z.dailyWaterUsed), 2000);

  return (
    <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-mono text-cyan-400">SEKTORLAR KESIMIDA</span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Zonalar bo‘yicha suv sarfi (Z1 – Z10)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Litr / kun</span>
      </div>

      <div className="space-y-2.5">
        {zones.map((z) => {
          const pct = Math.min(100, Math.round((z.dailyWaterUsed / maxZoneWater) * 100));
          return (
            <div key={z.id} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-mono font-bold text-white shrink-0">{z.id}</span>
              <span className="w-36 text-slate-400 truncate hidden sm:inline">{z.cropType}</span>
              <div className="flex-1 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-16 text-right font-mono font-semibold text-slate-200 tabular-nums shrink-0">
                {z.dailyWaterUsed} L
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 5. Flow Rate Over Time (Expected vs Actual L/min)
 */
export const FlowRateOverTimeChart: React.FC<{ currentFlow: number }> = ({ currentFlow }) => {
  return (
    <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-xs font-mono text-emerald-400">GIDRAVLIK OQIM GRAFIGI</span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Vaqt bo‘yicha suv oqimi tezligi (L/min)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-cyan-400">● Haqiqiy: {currentFlow} L/min</span>
          <span className="text-slate-400">--- Kutilgan me’yor</span>
        </div>
      </div>

      <div className="h-48 pt-2">
        <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
          {[0.25, 0.5, 0.75, 1].map((r, idx) => (
            <line
              key={idx}
              x1="0"
              y1={135 * r}
              x2="600"
              y2={135 * r}
              stroke="#1E293B"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}

          {(() => {
            const maxFlow = 90;
            const pts = DAILY_HOURLY_WATER_DATA.map((d, i) => {
              const x = (i / (DAILY_HOURLY_WATER_DATA.length - 1)) * 560 + 20;
              const yActual = 135 - (d.flow / maxFlow) * 115;
              const yExp = 135 - (d.expectedFlow / maxFlow) * 115;
              return { x, yActual, yExp, ...d };
            });

            const actualLine = pts
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yActual}`)
              .join(' ');
            const expLine = pts
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yExp}`)
              .join(' ');

            return (
              <>
                <path
                  d={expLine}
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <path
                  d={actualLine}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {pts.map((p) => (
                  <g key={p.time}>
                    <circle cx={p.x} cy={p.yActual} r="3.5" fill="#10B981" />
                    <text
                      x={p.x}
                      y={154}
                      textAnchor="middle"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {p.time}
                    </text>
                  </g>
                ))}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};
