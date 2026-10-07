import React from 'react';
import { IrrigationZone } from '../types';
import { SlidersHorizontal } from 'lucide-react';

interface ZoneCardProps {
  zone: IrrigationZone;
  onManage: (zone: IrrigationZone) => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({ zone, onManage }) => {
  const getStatusMeta = (status: IrrigationZone['status']) => {
    switch (status) {
      case 'normal':
        return {
          text: '🟢 Normal',
          textColor: 'text-emerald-400',
          borderColor: 'border-slate-800/90 hover:border-emerald-500/40',
        };
      case 'watch':
        return {
          text: '🟡 Kuzatuv',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/30 hover:border-amber-500/60',
        };
      case 'needs_irrigation':
        return {
          text: '🔴 Sug‘orish kerak',
          textColor: 'text-red-400',
          borderColor: 'border-red-500/45 hover:border-red-500/75',
        };
      case 'issue':
        return {
          text: '⚠️ Muammo',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/50 hover:border-amber-400',
        };
    }
  };

  const meta = getStatusMeta(zone.status);

  return (
    <div
      className={`bg-[#0F172A] border ${meta.borderColor} rounded-2xl p-4 flex flex-col justify-between transition-all`}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold font-mono text-white">{zone.id}</h4>
              <span className="text-xs text-slate-400 font-mono">· {zone.areaHectares} ga</span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[190px]" title={zone.cropType}>
              {zone.cropType}
            </p>
          </div>
          <span className={`text-xs font-semibold whitespace-nowrap ${meta.textColor}`}>
            {meta.text}
          </span>
        </div>

        {/* Sensor Metrics */}
        <div className="space-y-2 my-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">🌱 Namlik:</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                zone.moisture <= 30
                  ? 'text-red-400'
                  : zone.moisture <= 42
                  ? 'text-amber-300'
                  : 'text-white'
              }`}
            >
              {zone.moisture}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">🌡️ Harorat:</span>
            <span className="font-mono font-semibold text-slate-200 tabular-nums">
              {zone.temperature.toFixed(1)}°C
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">💧 Oqim:</span>
            <span className="font-mono font-semibold text-cyan-300 tabular-nums">
              {zone.waterFlow} L/min
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">⚙️ Klapan:</span>
            <span
              className={`font-mono font-semibold ${
                zone.valveOpen ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {zone.valveOpen ? 'Ochiq' : 'Yopiq'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={() => onManage(zone)}
        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-800 hover:border-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Boshqarish</span>
      </button>
    </div>
  );
};
