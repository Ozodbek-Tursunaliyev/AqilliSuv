import React, { useState } from 'react';
import {
  Plus,
  Search,
  Bot,
  ShieldCheck,
  CloudRain,
  Activity,
  Gauge,
  Trash2,
} from 'lucide-react';
import { AutomationSettings, IrrigationZone, UserRole } from '../types';
import { ZoneCard } from '../components/ZoneCard';

interface ZonesPageProps {
  zones: IrrigationZone[];
  userRole: UserRole;
  automation: AutomationSettings;
  onManageZone: (zone: IrrigationZone) => void;
  onUpdateAutomation: (next: AutomationSettings) => void;
  onAddZone: (newZone: IrrigationZone) => void;
  onDeleteZone: (zoneId: string) => void;
}

export const ZonesPage: React.FC<ZonesPageProps> = ({
  zones,
  userRole,
  automation,
  onManageZone,
  onUpdateAutomation,
  onAddZone,
  onDeleteZone,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | IrrigationZone['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCrop, setNewZoneCrop] = useState('');
  const [newZoneArea, setNewZoneArea] = useState('1.0');

  const filteredZones = zones.filter((z) => {
    const matchesStatus = filterStatus === 'all' || z.status === filterStatus;
    const matchesSearch =
      z.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.cropType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneCrop.trim()) return;
    const nextNum = zones.length + 1;
    const newId = `Z${nextNum}`;
    const created: IrrigationZone = {
      id: newId,
      name: newZoneName.trim(),
      cropType: newZoneCrop.trim(),
      areaHectares: parseFloat(newZoneArea) || 1.0,
      moisture: 48,
      temperature: 28.0,
      humidity: 42,
      waterFlow: 0,
      expectedFlow: 30,
      pressure: 2.4,
      valveOpen: false,
      pumpRunning: false,
      autoMode: true,
      lastIrrigation: 'Yangi qo‘shildi',
      status: 'normal',
      sensorOnline: true,
      dailyWaterUsed: 0,
      targetMoistureMin: 30,
      targetMoistureMax: 65,
      soilType: 'Bo‘z tuproq',
      sensorId: `ESP32-NODE-${String(nextNum).padStart(2, '0')}`,
    };
    onAddZone(created);
    setNewZoneName('');
    setNewZoneCrop('');
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
        <div>
          <span className="text-xs font-mono text-emerald-400">SEKTORLAR VA AVTOMATIKA</span>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            🌱 Sug‘orish zonalari ({zones.length} ta sektor)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Har bir zona bo‘yicha namlik, harorat, suv oqimi, klapanlar va avtomatik sug‘orish
            qoidalarini boshqarish
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi zona qo‘shish</span>
          </button>
        )}
      </div>

      {/* Section 15: AUTOMATION (Avtomatik sug‘orish) */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Avtomatik sug‘orish sozlamalari</h2>
              <p className="text-xs text-slate-400">
                Namlik &lt; {automation.minMoisture}% bo‘lganda avtomatik yoqish, yomg‘ir &gt; 70%
                bo‘lganda kechiktirish va nosozlikda to‘xtatish
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="text-xs font-semibold text-slate-200">☑ Avtomatik boshqaruv</span>
            <button
              type="button"
              disabled={userRole === 'farmer'}
              onClick={() =>
                onUpdateAutomation({ ...automation, enabled: !automation.enabled })
              }
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                automation.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  automation.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block mb-1">Minimal namlik</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {automation.minMoisture}%
              </span>
              {userRole !== 'farmer' && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateAutomation({
                        ...automation,
                        minMoisture: Math.max(15, automation.minMoisture - 1),
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateAutomation({
                        ...automation,
                        minMoisture: Math.min(50, automation.minMoisture + 1),
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block mb-1">Maksimal namlik</span>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold font-mono text-white tabular-nums">
                {automation.maxMoisture}%
              </span>
              {userRole !== 'farmer' && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateAutomation({
                        ...automation,
                        maxMoisture: Math.max(55, automation.maxMoisture - 1),
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateAutomation({
                        ...automation,
                        maxMoisture: Math.min(85, automation.maxMoisture + 1),
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-slate-400 block mb-1">Maks. davomiylik</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {automation.maxIrrigationDuration} daqiqa
            </span>
          </div>

          <div
            onClick={() =>
              userRole !== 'farmer' &&
              onUpdateAutomation({ ...automation, rainProtection: !automation.rainProtection })
            }
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Yomg‘ir himoyasi</span>
              <CloudRain className="w-4 h-4 text-cyan-400" />
            </div>
            <span
              className={`font-semibold mt-1 ${
                automation.rainProtection ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {automation.rainProtection ? 'Yoqilgan (Enabled)' : 'O‘chiq'}
            </span>
          </div>

          <div
            onClick={() =>
              userRole !== 'farmer' &&
              onUpdateAutomation({ ...automation, leakDetection: !automation.leakDetection })
            }
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Sizib chiqish nazorati</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <span
              className={`font-semibold mt-1 ${
                automation.leakDetection ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {automation.leakDetection ? 'Yoqilgan (Enabled)' : 'O‘chiq'}
            </span>
          </div>

          <div
            onClick={() =>
              userRole !== 'farmer' &&
              onUpdateAutomation({
                ...automation,
                pressureProtection: !automation.pressureProtection,
              })
            }
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span>Bosim himoyasi</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <span
              className={`font-semibold mt-1 ${
                automation.pressureProtection ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {automation.pressureProtection ? 'Yoqilgan (Enabled)' : 'O‘chiq'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0F172A] border border-slate-800 rounded-xl">
          {[
            { id: 'all', label: `Barchasi (${zones.length})` },
            { id: 'normal', label: '🟢 Normal' },
            { id: 'watch', label: '🟡 Kuzatuv' },
            { id: 'needs_irrigation', label: '🔴 Sug‘orish kerak' },
            { id: 'issue', label: '⚠️ Muammo' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as typeof filterStatus)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zona yoki ekin qidirish..."
            className="w-full pl-9 pr-3 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredZones.map((zone) => (
          <div key={zone.id} className="relative group">
            <ZoneCard zone={zone} onManage={onManageZone} />
            {userRole === 'admin' && zones.length > 10 && (
              <button
                type="button"
                onClick={() => onDeleteZone(zone.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Zonani o‘chirish"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Zone Modal (Admin Only) */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-white">Yangi sug‘orish zonasi qo‘shish</h3>
            <p className="text-xs text-slate-400 mt-1">
              Yangi ESP32 sensor tuguni va klapan liniyasini tizimga biriktirish
            </p>
            <form onSubmit={handleCreateZone} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Zona tavsifi / nomi</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Masalan: 11-sektor: Yangi tokzor"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Ekin turi</label>
                <input
                  type="text"
                  value={newZoneCrop}
                  onChange={(e) => setNewZoneCrop(e.target.value)}
                  placeholder="Masalan: Uzum (Qora kishmish)"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Maydon (gektar)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newZoneArea}
                  onChange={(e) => setNewZoneArea(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-xs font-semibold text-slate-950 cursor-pointer"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
