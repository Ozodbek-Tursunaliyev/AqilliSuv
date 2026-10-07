import React, { useState } from 'react';
import { IrrigationZone } from '../types';
import { FieldMapSVG } from '../components/FieldMapSVG';
import { MapPin, Droplets, Gauge, Cpu, SlidersHorizontal } from 'lucide-react';

interface MapPageProps {
  zones: IrrigationZone[];
  onManageZone: (zone: IrrigationZone) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ zones, onManageZone }) => {
  const [selectedId, setSelectedId] = useState<string>('Z3');
  const activeZone = zones.find((z) => z.id === selectedId) || zones[0];
  const totalArea = zones.reduce((acc, z) => acc + z.areaHectares, 0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            AGRO-GEOGRAFIK VA GIDRAVLIK XARITA
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            🗺️ Xarita — 10 gektar fermer xo‘jaligi sxemasi
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Asosiy suv manbai, nasos stansiyasi, magistral quvurlar, klapanlar va 10 ta sug‘orish
            zonasi joylashuvi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
            Umumiy maydon: <strong className="text-emerald-400">{totalArea} gektar</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
            Zonalar: <strong className="text-cyan-400">{zones.length} ta</strong>
          </div>
        </div>
      </div>

      {/* Infrastructure Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="text-2xl">💧</div>
          <div>
            <div className="text-xs text-slate-400">Asosiy suv manbai</div>
            <div className="text-sm font-bold text-white">Janubiy Farg‘ona kanali</div>
            <div className="text-[11px] font-mono text-cyan-400">Suv sathi: Barqaror (94%)</div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="text-2xl">🚰</div>
          <div>
            <div className="text-xs text-slate-400">Magistral quvur tarmog‘i</div>
            <div className="text-sm font-bold text-white">PE-100 Ø160mm (2 liniya)</div>
            <div className="text-[11px] font-mono text-emerald-400">Bosim: 2.4 bar</div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="text-2xl">⚙️</div>
          <div>
            <div className="text-xs text-slate-400">Markaziy nasos stansiyasi</div>
            <div className="text-sm font-bold text-white">Grundfos Agro-Pro 5.5kW</div>
            <div className="text-[11px] font-mono text-emerald-400">Status: Faol (Avto-rejim)</div>
          </div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="text-2xl">🔧</div>
          <div>
            <div className="text-xs text-slate-400">Elektromagnit klapanlar</div>
            <div className="text-sm font-bold text-white">
              {zones.filter((z) => z.valveOpen).length} ta ochiq / {zones.length} ta jami
            </div>
            <div className="text-[11px] font-mono text-cyan-400">24V Solenoid + ESP32</div>
          </div>
        </div>
      </div>

      {/* Main Interactive 10-Zone Field Map */}
      <FieldMapSVG
        zones={zones}
        selectedZoneId={selectedId}
        detailed={true}
        onSelectZone={(z) => {
          setSelectedId(z.id);
          onManageZone(z);
        }}
      />

      {/* Selected Zone Quick Inspector Table */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-white">
            Barcha 10 ta sektorning topografik va gidravlik jadvali
          </h3>
          <span className="text-xs text-slate-400">
            Qator ustiga bosib klapan va nasosni boshqaring
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono">
                <th className="py-2.5 px-3">Zona</th>
                <th className="py-2.5 px-3">Sektor va ekin turi</th>
                <th className="py-2.5 px-3 text-right">Maydon</th>
                <th className="py-2.5 px-3 text-right">Namlik</th>
                <th className="py-2.5 px-3 text-right">Harorat</th>
                <th className="py-2.5 px-3 text-right">Suv oqimi</th>
                <th className="py-2.5 px-3 text-right">Bosim</th>
                <th className="py-2.5 px-3">Klapan</th>
                <th className="py-2.5 px-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {zones.map((z) => (
                <tr
                  key={z.id}
                  onClick={() => onManageZone(z)}
                  className="hover:bg-slate-900/70 transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-white">{z.id}</td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {z.name} · <span className="text-slate-400">{z.cropType}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                    {z.areaHectares} ga
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums ${
                      z.moisture <= 30
                        ? 'text-red-400'
                        : z.moisture <= 42
                        ? 'text-amber-300'
                        : 'text-emerald-400'
                    }`}
                  >
                    {z.moisture}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                    {z.temperature.toFixed(1)}°C
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-cyan-300">
                    {z.waterFlow} L/min
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                    {z.pressure.toFixed(1)} bar
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className={z.valveOpen ? 'text-emerald-400' : 'text-slate-500'}>
                      {z.valveOpen ? '🔧 Ochiq' : 'Yopiq'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageZone(z);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 font-medium transition-colors cursor-pointer"
                    >
                      Boshqarish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
