import React, { useState } from 'react';
import {
  X,
  Droplets,
  Thermometer,
  Gauge,
  Activity,
  Power,
  Settings2,
  Clock,
  AlertTriangle,
  Bot,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { AIRecommendation, IrrigationZone, UserRole } from '../types';

interface ZoneControlModalProps {
  zone: IrrigationZone | null;
  recommendation?: AIRecommendation;
  userRole: UserRole;
  onClose: () => void;
  onToggleValve: (zoneId: string, open: boolean) => void;
  onTogglePump: (zoneId: string, running: boolean) => void;
  onToggleMode: (zoneId: string, autoMode: boolean) => void;
  onFixIssue?: (zoneId: string) => void;
}

interface PendingConfirmAction {
  type: 'valve_open' | 'valve_close' | 'pump_on' | 'pump_off';
  title: string;
  description: string;
}

export const ZoneControlModal: React.FC<ZoneControlModalProps> = ({
  zone,
  recommendation,
  userRole,
  onClose,
  onToggleValve,
  onTogglePump,
  onToggleMode,
  onFixIssue,
}) => {
  const [confirmAction, setConfirmAction] = useState<PendingConfirmAction | null>(null);

  if (!zone) return null;

  const canControl = userRole === 'admin' || userRole === 'operator';

  const requestAction = (type: PendingConfirmAction['type']) => {
    if (!canControl) return;

    const actionMap: Record<PendingConfirmAction['type'], PendingConfirmAction> = {
      valve_open: {
        type: 'valve_open',
        title: `${zone.id} klapanini ochishni tasdiqlaysizmi?`,
        description: `Klapan ochilgach ${zone.name} ga ${zone.expectedFlow} L/min tezlikda suv uzatiladi.`,
      },
      valve_close: {
        type: 'valve_close',
        title: `${zone.id} klapanini yopishni tasdiqlaysizmi?`,
        description: `${zone.id} sektorida joriy sug‘orish oqimi darhol to‘xtatiladi.`,
      },
      pump_on: {
        type: 'pump_on',
        title: `${zone.id} nasosini yoqishni tasdiqlaysizmi?`,
        description: `Sub-magistral bosim nasosi ishga tushiriladi (ishchi bosim ~2.4 bar).`,
      },
      pump_off: {
        type: 'pump_off',
        title: `${zone.id} nasosini o‘chirishni tasdiqlaysizmi?`,
        description: `Nasos o‘chirilganda ushbu tarmoqda suv aylanishi to‘xtaydi.`,
      },
    };

    setConfirmAction(actionMap[type]);
  };

  const executeConfirmedAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'valve_open') onToggleValve(zone.id, true);
    if (confirmAction.type === 'valve_close') onToggleValve(zone.id, false);
    if (confirmAction.type === 'pump_on') onTogglePump(zone.id, true);
    if (confirmAction.type === 'pump_off') onTogglePump(zone.id, false);
    setConfirmAction(null);
  };

  const getStatusLabel = (status: IrrigationZone['status']) => {
    switch (status) {
      case 'normal':
        return { text: '🟢 Normal', color: 'text-emerald-400' };
      case 'watch':
        return { text: '🟡 Kuzatuv', color: 'text-amber-400' };
      case 'needs_irrigation':
        return { text: '🔴 Sug‘orish kerak', color: 'text-red-400' };
      case 'issue':
        return { text: '⚠️ Muammo', color: 'text-amber-400' };
    }
  };

  const statusMeta = getStatusLabel(zone.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
              <span>ZONA BOSHQARUV PANELI</span>
              <span>·</span>
              <span>{zone.sensorId}</span>
              <span>·</span>
              <span className={statusMeta.color}>{statusMeta.text}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {zone.id} — {zone.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ekin turi: <span className="text-slate-200 font-medium">{zone.cropType}</span> · Maydon:{' '}
              <span className="text-slate-200 font-mono">{zone.areaHectares} ga</span> · Tuproq:{' '}
              <span className="text-slate-200">{zone.soilType}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Tuproq namligi</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {zone.moisture}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Me’yor: {zone.targetMoistureMin}%–{zone.targetMoistureMax}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Harorat</span>
              <Thermometer className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {zone.temperature.toFixed(1)}°C
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Havo namligi: {zone.humidity}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Suv oqimi</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {zone.waterFlow} <span className="text-xs font-normal text-slate-400">L/min</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Nominal: {zone.expectedFlow} L/min
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Quvur bosimi</span>
              <Gauge className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {zone.pressure.toFixed(1)} <span className="text-xs font-normal text-slate-400">bar</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Bugun: {zone.dailyWaterUsed} L
            </div>
          </div>
        </div>

        {/* Current Hardware Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-5 text-xs">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-slate-400">Klapan holati:</span>
            <span className={`font-semibold font-mono ${zone.valveOpen ? 'text-emerald-400' : 'text-slate-300'}`}>
              {zone.valveOpen ? 'Ochiq (OPEN)' : 'Yopiq (CLOSED)'}
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-slate-400">Nasos holati:</span>
            <span className={`font-semibold font-mono ${zone.pumpRunning ? 'text-cyan-400' : 'text-slate-300'}`}>
              {zone.pumpRunning ? 'Ishlamoqda (RUNNING)' : 'To‘xtagan (IDLE)'}
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400">Oxirgi sug‘orish:</span>
            <span className="font-mono text-slate-200">{zone.lastIrrigation}</span>
          </div>
        </div>

        {/* Anomaly Repair Banner if Z8 or flow anomaly exists */}
        {zone.status === 'issue' && onFixIssue && canControl && (
          <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Wrench className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-300">
                  Gidravlik nosozlik aniqlandi (Kutilgan: {zone.expectedFlow} L/min, Haqiqiy: {zone.waterFlow} L/min)
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Quvur filtrini avtomatik yuvish va zaxira klapanga o‘tkazish orqali oqimni tiklash mumkin.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onFixIssue(zone.id)}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs whitespace-nowrap cursor-pointer shrink-0"
            >
              Nosozlikni bartaraf etish
            </button>
          </div>
        )}

        {/* Role Restriction Warning for Farmer */}
        {!canControl && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Siz <strong>Fermer</strong> rolida tizimga kirgansiz. Klapan va nasoslarni bevosita boshqarish faqat
              Administrator va Operator uchun ruxsat etilgan.
            </span>
          </div>
        )}

        {/* Controls Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Valve Control */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                ⚙️ Klapan boshqaruvi (Valve)
              </span>
              <span className="text-xs font-mono text-slate-400">
                {zone.valveOpen ? 'OCHIQ' : 'YOPIQ'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!canControl || zone.valveOpen}
                onClick={() => requestAction('valve_open')}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                  zone.valveOpen
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : canControl
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                [ OCHISH ]
              </button>
              <button
                type="button"
                disabled={!canControl || !zone.valveOpen}
                onClick={() => requestAction('valve_close')}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                  !zone.valveOpen
                    ? 'bg-slate-800/90 border border-slate-700 text-slate-400 cursor-default'
                    : canControl
                    ? 'bg-red-500/90 hover:bg-red-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                [ YOPISH ]
              </button>
            </div>
          </div>

          {/* Pump Control */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                ⚡ Nasos boshqaruvi (Pump)
              </span>
              <span className="text-xs font-mono text-slate-400">
                {zone.pumpRunning ? 'FAOL' : 'O‘CHIQ'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={!canControl || zone.pumpRunning}
                onClick={() => requestAction('pump_on')}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                  zone.pumpRunning
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 cursor-default'
                    : canControl
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                [ YOQISH ]
              </button>
              <button
                type="button"
                disabled={!canControl || !zone.pumpRunning}
                onClick={() => requestAction('pump_off')}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                  !zone.pumpRunning
                    ? 'bg-slate-800/90 border border-slate-700 text-slate-400 cursor-default'
                    : canControl
                    ? 'bg-red-500/90 hover:bg-red-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                [ O‘CHIRISH ]
              </button>
            </div>
          </div>
        </div>

        {/* Automatic vs Manual Mode Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div
            onClick={() => canControl && onToggleMode(zone.id, true)}
            className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
              zone.autoMode
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-slate-900/60 border-slate-800'
            } ${canControl ? 'cursor-pointer hover:border-slate-700' : 'opacity-75'}`}
          >
            <div className="flex items-center gap-3">
              <Bot className={`w-5 h-5 ${zone.autoMode ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-sm font-semibold text-white">Avtomatik boshqaruv</div>
                <div className="text-xs text-slate-400">Sensor va AI me’yorlari asosida</div>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                zone.autoMode ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  zone.autoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div
            onClick={() => canControl && onToggleMode(zone.id, false)}
            className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
              !zone.autoMode
                ? 'bg-cyan-500/10 border-cyan-500/40'
                : 'bg-slate-900/60 border-slate-800'
            } ${canControl ? 'cursor-pointer hover:border-slate-700' : 'opacity-75'}`}
          >
            <div className="flex items-center gap-3">
              <Settings2 className={`w-5 h-5 ${!zone.autoMode ? 'text-cyan-400' : 'text-slate-500'}`} />
              <div>
                <div className="text-sm font-semibold text-white">Qo‘lda boshqarish</div>
                <div className="text-xs text-slate-400">Operator tomonidan bevosita nazorat</div>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                !zone.autoMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  !zone.autoMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* AI Recommendation Context inside Modal */}
        {recommendation && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span>🤖 AQLLISUV AI TAVSIYASI</span>
                <span>·</span>
                <span>Ishonchlilik: {recommendation.confidence}%</span>
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {recommendation.recommendation}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{recommendation.reason}</p>
            </div>
            {recommendation.type === 'irrigate' && !zone.valveOpen && canControl && (
              <button
                type="button"
                onClick={() => requestAction('valve_open')}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs whitespace-nowrap cursor-pointer shrink-0"
              >
                Sug‘orishni boshlash
              </button>
            )}
          </div>
        )}

        {/* Confirmation Dialog Overlay for Dangerous Actions */}
        {confirmAction && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400 mb-3">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-white">{confirmAction.title}</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {confirmAction.description}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-xs font-semibold text-slate-950 cursor-pointer"
                >
                  Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
