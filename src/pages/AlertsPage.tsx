import React, { useState } from 'react';
import { CheckCheck, Bell, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AlertItem } from '../types';

interface AlertsPageProps {
  alerts: AlertItem[];
  onMarkAllRead: () => void;
  onResolveAlert: (id: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onMarkAllRead,
  onResolveAlert,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | AlertItem['severity']>('all');

  const filtered = alerts.filter(
    (a) => filterSeverity === 'all' || a.severity === filterSeverity
  );

  const getSeverityBadge = (sev: AlertItem['severity']) => {
    switch (sev) {
      case 'critical':
        return { icon: '🔴', label: 'Kritik', color: 'text-red-400 border-red-500/40 bg-red-950/20' };
      case 'warning':
        return {
          icon: '⚠️',
          label: 'Ogohlantirish',
          color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        };
      case 'success':
        return {
          icon: '🟢',
          label: 'Muvaffaqiyatli',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        };
      default:
        return {
          icon: '🟡',
          label: 'Ma’lumot',
          color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            TIZIM XABARNOMALARI VA HODISALAR JURNALI
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">⚠️ Ogohlantirishlar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sensor chegaralari, gidravlik bosim o‘zgarishlari va sug‘orish sikli bildirishnomalari
          </p>
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Barchasini o‘qilgan deb belgilash</span>
        </button>
      </div>

      {/* Severity Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0F172A] border border-slate-800 rounded-xl w-fit">
        {[
          { id: 'all', label: `Barchasi (${alerts.length})` },
          { id: 'critical', label: '🔴 Kritik' },
          { id: 'warning', label: '⚠️ Ogohlantirish' },
          { id: 'success', label: '🟢 Yakunlangan' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterSeverity(tab.id as typeof filterSeverity)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterSeverity === tab.id
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts List Table / Cards */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const meta = getSeverityBadge(alert.severity);
          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.read
                  ? 'bg-[#0F172A]/80 border-slate-800/80'
                  : 'bg-[#0F172A] border-emerald-500/40 shadow-lg shadow-emerald-950/10'
              }`}
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span>{meta.icon}</span>
                  <span className="font-bold text-white">{alert.zoneId}</span>
                  <span>·</span>
                  <span className={meta.color.split(' ')[0]}>{meta.label}</span>
                  <span>·</span>
                  <span className="text-slate-400">{alert.time}</span>
                  {!alert.read && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">YANGI</span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">{alert.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span
                  className={`text-xs font-mono font-semibold ${
                    alert.status === 'Hal qilindi'
                      ? 'text-emerald-400'
                      : alert.status === 'Faol'
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  Holat: {alert.status}
                </span>

                {alert.status !== 'Hal qilindi' && (
                  <button
                    type="button"
                    onClick={() => onResolveAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer whitespace-nowrap"
                  >
                    Tasdiqlash / Yopish
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
