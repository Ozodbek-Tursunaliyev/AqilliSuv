import React from 'react';
import { Droplets, Thermometer, Activity, Wrench } from 'lucide-react';
import { IrrigationZone } from '../types';

interface FieldMapSVGProps {
  zones: IrrigationZone[];
  onSelectZone: (zone: IrrigationZone) => void;
  selectedZoneId?: string | null;
  detailed?: boolean;
}

export const FieldMapSVG: React.FC<FieldMapSVGProps> = ({
  zones,
  onSelectZone,
  selectedZoneId,
  detailed = false,
}) => {
  const row1 = zones.slice(0, 5); // Z1..Z5
  const row2 = zones.slice(5, 10); // Z6..Z10
  const anyActive = zones.some((z) => z.valveOpen && z.pumpRunning);
  const totalFlow = zones.reduce((acc, z) => acc + (z.valveOpen ? z.waterFlow : 0), 0);

  const getStatusStyles = (zone: IrrigationZone) => {
    if (zone.valveOpen && zone.pumpRunning) {
      if (zone.status === 'issue') {
        return {
          border: 'border-amber-500/80',
          bg: 'bg-amber-950/35',
          indicator: 'text-amber-400',
          label: '⚠️ Muammo (Oqim past)',
        };
      }
      return {
        border: 'border-cyan-400/80',
        bg: 'bg-cyan-950/30',
        indicator: 'text-cyan-300',
        label: '🚿 Sug‘orilmoqda',
      };
    }

    switch (zone.status) {
      case 'needs_irrigation':
        return {
          border: 'border-red-500/70',
          bg: 'bg-red-950/25',
          indicator: 'text-red-400',
          label: '🔴 Sug‘orish kerak',
        };
      case 'issue':
        return {
          border: 'border-amber-500/70',
          bg: 'bg-amber-950/25',
          indicator: 'text-amber-400',
          label: '⚠️ Muammo',
        };
      case 'watch':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-slate-900/90',
          indicator: 'text-amber-300',
          label: '🟡 Kuzatuv',
        };
      default:
        return {
          border: 'border-emerald-500/35',
          bg: 'bg-slate-900/80',
          indicator: 'text-emerald-400',
          label: '🟢 Normal',
        };
    }
  };

  return (
    <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
      {/* Top Hydraulic Infrastructure Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span>10 GEKTARLIK AGRO-XARITA</span>
            <span>·</span>
            <span>GIDRAVLIK SXEMA (Z1 – Z10)</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">
            Dala sektorlari va magistral quvur tarmog‘i
          </h3>
        </div>

        {/* Hydraulic Infrastructure Nodes */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span>💧 Asosiy suv manbai:</span>
            <span className="font-mono text-cyan-400 font-semibold">Farg‘ona kanali</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span>⚙️ Nasos stansiyasi:</span>
            <span className={`font-mono font-semibold ${anyActive ? 'text-emerald-400' : 'text-slate-400'}`}>
              {anyActive ? `FAOL (${totalFlow} L/min)` : 'KUTISHDA'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Pipeline Visual SVG Connector */}
      <div className="relative">
        {/* Top Main Pipeline */}
        <div className="mb-3 flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shrink-0">
            🚰 Shimoliy magistral quvur (Z1–Z5)
          </div>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative">
            {row1.some((z) => z.valveOpen && z.pumpRunning) && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-400 to-emerald-400 animate-pulse"
              />
            )}
          </div>
        </div>

        {/* Row 1: Z1 | Z2 | Z3 | Z4 | Z5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          {row1.map((zone) => {
            const st = getStatusStyles(zone);
            const isFlowing = zone.valveOpen && zone.pumpRunning;
            const isSelected = selectedZoneId === zone.id;

            return (
              <div
                key={zone.id}
                onClick={() => onSelectZone(zone)}
                className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer select-none ${
                  st.bg
                } ${st.border} ${
                  isSelected ? 'ring-2 ring-emerald-400' : 'hover:border-slate-600'
                }`}
              >
                {/* Animated water-flow indicator line when active */}
                {isFlowing && (
                  <svg className="w-full h-1.5 mb-2 overflow-visible">
                    <line
                      x1="0"
                      y1="3"
                      x2="100%"
                      y2="3"
                      stroke={zone.status === 'issue' ? '#F59E0B' : '#22D3EE'}
                      strokeWidth="3"
                      className="animate-flow"
                    />
                  </svg>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-white">{zone.id}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{zone.areaHectares} ga</span>
                  </div>
                  <span className={`text-[11px] font-medium ${st.indicator}`}>{st.label}</span>
                </div>

                <div className="text-xs text-slate-300 truncate mb-2.5" title={zone.cropType}>
                  {zone.cropType}
                </div>

                {/* Moisture progress bar */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      Namlik
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {zone.moisture}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        zone.moisture <= 30
                          ? 'bg-red-500'
                          : zone.moisture <= 42
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, zone.moisture)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    {zone.temperature.toFixed(1)}°C
                  </span>
                  <span className="flex items-center gap-1">
                    🔧 {zone.valveOpen ? 'Ochiq' : 'Yopiq'}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Activity className="w-3 h-3" />
                    {zone.waterFlow} L/m
                  </span>
                </div>

                {detailed && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Bosim: {zone.pressure.toFixed(1)} bar</span>
                    <span>{zone.autoMode ? 'AVTO' : 'QO‘LDA'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Main Pipeline */}
        <div className="mb-3 flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-cyan-500/15 border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shrink-0">
            🚰 Janubiy magistral quvur (Z6–Z10)
          </div>
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative">
            {row2.some((z) => z.valveOpen && z.pumpRunning) && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-400 to-emerald-400 animate-pulse"
              />
            )}
          </div>
        </div>

        {/* Row 2: Z6 | Z7 | Z8 | Z9 | Z10 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {row2.map((zone) => {
            const st = getStatusStyles(zone);
            const isFlowing = zone.valveOpen && zone.pumpRunning;
            const isSelected = selectedZoneId === zone.id;

            return (
              <div
                key={zone.id}
                onClick={() => onSelectZone(zone)}
                className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer select-none ${
                  st.bg
                } ${st.border} ${
                  isSelected ? 'ring-2 ring-emerald-400' : 'hover:border-slate-600'
                }`}
              >
                {isFlowing && (
                  <svg className="w-full h-1.5 mb-2 overflow-visible">
                    <line
                      x1="0"
                      y1="3"
                      x2="100%"
                      y2="3"
                      stroke={zone.status === 'issue' ? '#F59E0B' : '#22D3EE'}
                      strokeWidth="3"
                      className="animate-flow"
                    />
                  </svg>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-mono text-white">{zone.id}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{zone.areaHectares} ga</span>
                  </div>
                  <span className={`text-[11px] font-medium ${st.indicator}`}>{st.label}</span>
                </div>

                <div className="text-xs text-slate-300 truncate mb-2.5" title={zone.cropType}>
                  {zone.cropType}
                </div>

                <div className="mb-2.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      Namlik
                    </span>
                    <span className="font-mono font-bold text-white tabular-nums">
                      {zone.moisture}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        zone.moisture <= 30
                          ? 'bg-red-500'
                          : zone.moisture <= 42
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, zone.moisture)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-amber-400" />
                    {zone.temperature.toFixed(1)}°C
                  </span>
                  <span className="flex items-center gap-1">
                    🔧 {zone.valveOpen ? 'Ochiq' : 'Yopiq'}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Activity className="w-3 h-3" />
                    {zone.waterFlow} L/m
                  </span>
                </div>

                {detailed && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Bosim: {zone.pressure.toFixed(1)} bar</span>
                    <span>{zone.autoMode ? 'AVTO' : 'QO‘LDA'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span>🟢 Normal (43%–70%)</span>
          <span>🟡 Kuzatuv (31%–42%)</span>
          <span>🔴 Sug‘orish kerak (&le;30%)</span>
          <span>⚠️ Quvur/Oqim muammosi</span>
          <span className="text-cyan-300">🚿 Faol suv oqimi animatsiyasi</span>
        </div>
        <span className="text-slate-500">Batafsil boshqarish uchun istalgan zonani bosing</span>
      </div>
    </div>
  );
};
