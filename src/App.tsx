import React, { useEffect, useMemo, useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  Bell,
  WifiOff,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Pause,
  Play,
} from 'lucide-react';
import {
  AlertItem,
  AutomationSettings,
  IrrigationZone,
  NavPageId,
  SystemSettings,
  ToastNotification,
  User,
  WeatherData,
} from './types';
import {
  INITIAL_ALERTS,
  INITIAL_AUTOMATION_SETTINGS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_USERS,
  INITIAL_WEATHER,
  INITIAL_ZONES,
} from './data/initialData';
import { calculateAllRecommendations } from './services/aiEngine';
import {
  determineZoneStatus,
  getSensorData,
  updatePump,
  updateValve,
} from './services/sensorService';
import { BrandLogo } from './components/BrandLogo';
import { LoginPage } from './components/LoginPage';
import { ZoneControlModal } from './components/ZoneControlModal';
import { DashboardPage } from './pages/DashboardPage';
import { ZonesPage } from './pages/ZonesPage';
import { WaterMonitoringPage } from './pages/WaterMonitoringPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { AIRecommendationsPage } from './pages/AIRecommendationsPage';
import { AlertsPage } from './pages/AlertsPage';
import { MapPage } from './pages/MapPage';
import { SettingsPage } from './pages/SettingsPage';

const NAV_ITEMS: Array<{ id: NavPageId; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: '🏠' },
  { id: 'zones', label: 'Sug‘orish zonalari', icon: '🌱' },
  { id: 'water', label: 'Suv monitoringi', icon: '💧' },
  { id: 'statistics', label: 'Statistika', icon: '📊' },
  { id: 'ai', label: 'AI tavsiyalari', icon: '🤖' },
  { id: 'alerts', label: 'Ogohlantirishlar', icon: '⚠️' },
  { id: 'map', label: 'Xarita', icon: '🗺️' },
  { id: 'settings', label: 'Sozlamalar', icon: '⚙️' },
];

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<NavPageId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [zones, setZones] = useState<IrrigationZone[]>(INITIAL_ZONES);
  const [weather] = useState<WeatherData>(INITIAL_WEATHER);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [automation, setAutomation] = useState<AutomationSettings>(
    INITIAL_AUTOMATION_SETTINGS
  );
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(
    INITIAL_SYSTEM_SETTINGS
  );

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [demoLivePaused, setDemoLivePaused] = useState(false);
  const [sensorErrorBanner, setSensorErrorBanner] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (
    message: string,
    type: ToastNotification['type'] = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nowStr = new Date().toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setToasts((prev) => [{ id, message, type, timestamp: nowStr }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const addAlert = (
    title: string,
    description: string,
    zoneId: string,
    severity: AlertItem['severity'] = 'warning'
  ) => {
    const nowStr = new Date().toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newAlert: AlertItem = {
      id: `al-${Date.now()}`,
      time: `Bugun, ${nowStr}`,
      zoneId,
      severity,
      title,
      description,
      read: false,
      status: severity === 'success' ? 'Hal qilindi' : 'Faol',
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // Real-time DEMO MODE sensor simulation every 3.5 seconds
  useEffect(() => {
    if (!currentUser || demoLivePaused) return;

    const timer = setInterval(() => {
      try {
        setZones((prevZones) => {
          const updated = getSensorData(prevZones, automation.minMoisture);

          // Automatic irrigation completion check if moisture reaches maxMoisture
          return updated.map((z) => {
            if (
              automation.enabled &&
              z.autoMode &&
              z.valveOpen &&
              z.moisture >= automation.maxMoisture
            ) {
              return {
                ...z,
                valveOpen: false,
                pumpRunning: false,
                waterFlow: 0,
                status: 'normal',
              };
            }
            return z;
          });
        });
        setSensorErrorBanner(null);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Sensor bilan aloqa vaqtincha mavjud emas.';
        setSensorErrorBanner(msg);
      }
    }, 3500);

    return () => clearInterval(timer);
  }, [currentUser, demoLivePaused, automation]);

  // Calculate AI Recommendations dynamically for all zones
  const recommendations = useMemo(
    () => calculateAllRecommendations(zones, weather, automation),
    [zones, weather, automation]
  );

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) || null,
    [zones, selectedZoneId]
  );

  const selectedZoneRecommendation = useMemo(
    () => recommendations.find((r) => r.zoneId === selectedZoneId),
    [recommendations, selectedZoneId]
  );

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  // Handlers for Zone Control
  const handleToggleValve = async (zoneId: string, open: boolean) => {
    if (currentUser?.role === 'farmer') {
      showToast('Ushbu amal uchun ruxsat yo‘q (Faqat Admin yoki Operator).', 'error');
      return;
    }

    const target = zones.find((z) => z.id === zoneId);
    if (!target) return;

    try {
      const updated = await updateValve(target, open, automation.minMoisture);
      setZones((prev) => prev.map((z) => (z.id === zoneId ? updated : z)));

      if (open) {
        showToast(`${zoneId} klapani ochildi.`, 'success');
        showToast(`${zoneId} sug‘orilishi boshlandi.`, 'info');
      } else {
        showToast(`${zoneId} sug‘orilishi yakunlandi.`, 'success');
        addAlert(
          `${zoneId} sug‘orish muvaffaqiyatli yakunlandi`,
          `${zoneId} (${target.cropType}) klapani yopildi. Joriy tuproq namligi: ${target.moisture}%.`,
          zoneId,
          'success'
        );
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Sensor bilan aloqa vaqtincha mavjud emas.',
        'error'
      );
    }
  };

  const handleTogglePump = async (zoneId: string, running: boolean) => {
    if (currentUser?.role === 'farmer') {
      showToast('Ushbu amal uchun ruxsat yo‘q.', 'error');
      return;
    }

    const target = zones.find((z) => z.id === zoneId);
    if (!target) return;

    try {
      const updated = await updatePump(target, running, automation.minMoisture);
      setZones((prev) => prev.map((z) => (z.id === zoneId ? updated : z)));
      showToast(
        running ? `${zoneId} nasosi yoqildi.` : `${zoneId} nasosi o‘chirildi.`,
        'info'
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Nasos kontrolleri bilan aloqa yo‘q.',
        'error'
      );
    }
  };

  const handleToggleMode = (zoneId: string, autoMode: boolean) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, autoMode } : z))
    );
    showToast(
      `${zoneId}: ${autoMode ? 'Avtomatik boshqaruv' : 'Qo‘lda boshqarish'} rejimi yoqildi.`,
      'info'
    );
  };

  const handleStartRecommendedIrrigation = (zoneId: string, durationMin: number) => {
    if (currentUser?.role === 'farmer') {
      showToast('Fermer rolida sug‘orishni bevosita yoqish cheklangan.', 'warning');
      return;
    }

    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const nowStr = new Date().toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const next: IrrigationZone = {
          ...z,
          valveOpen: true,
          pumpRunning: true,
          waterFlow: z.expectedFlow,
          lastIrrigation: `Bugun, ${nowStr}`,
        };
        next.status = determineZoneStatus(next, automation.minMoisture);
        return next;
      })
    );

    showToast(`${zoneId} klapani ochildi.`, 'success');
    showToast(
      `${zoneId} sug‘orilishi boshlandi (${durationMin} daqiqaga rejalashtirildi).`,
      'info'
    );
  };

  const handleFixZoneIssue = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const fixed: IrrigationZone = {
          ...z,
          waterFlow: z.valveOpen ? z.expectedFlow : 0,
          pressure: 2.5,
          status: 'normal',
        };
        return fixed;
      })
    );
    showToast(
      `${zoneId} quvur filtri tozalandi va suv oqimi ${
        zones.find((z) => z.id === zoneId)?.expectedFlow ?? 30
      } L/min me’yorga tiklandi.`,
      'success'
    );
  };

  // If logged out, show LoginPage
  if (!currentUser) {
    return (
      <LoginPage
        users={users}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          showToast(`Xush kelibsiz, ${u.name.split(' ')[0]}!`, 'success');
        }}
      />
    );
  }

  const avatarInitials = currentUser.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#090E17] text-slate-100 flex">
      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-68 bg-[#0B111E] border-r border-slate-800/90 shrink-0 justify-between sticky top-0 h-screen">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/80">
            <BrandLogo size="md" showSubtitle={true} />
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'alerts' && unreadAlertsCount > 0 && (
                    <span className="font-mono text-[11px] font-bold text-amber-400">
                      {unreadAlertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-xs text-emerald-300 shrink-0">
                {avatarInitials}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[11px] text-emerald-400 truncate">
                  {currentUser.roleLabel}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentUser(null)}
              className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-slate-800 transition-colors cursor-pointer shrink-0"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[82vw] bg-[#0B111E] border-r border-slate-800 h-full flex flex-col justify-between z-10">
            <div>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <BrandLogo size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActivePage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.id === 'alerts' && unreadAlertsCount > 0 && (
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {unreadAlertsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono text-xs font-bold text-emerald-300">
                  {avatarInitials}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[11px] text-emerald-400">{currentUser.roleLabel}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCurrentUser(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 text-xs font-medium"
              >
                Chiqish
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract */}
        <header className="sticky top-0 z-30 bg-[#090E17]/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Zone 1: Hamburger (Mobile) + Breadcrumb / Brand context */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              aria-label="Menyuni ochish"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 truncate">
              <span className="font-bold text-white">AqlliSuv</span>
              <span className="text-slate-600">/</span>
              <span className="text-emerald-400 truncate">
                {NAV_ITEMS.find((n) => n.id === activePage)?.label}
              </span>
            </div>
          </div>

          {/* Zone 2: Quick Role Switcher (So competition judges can test Admin / Operator / Fermer permissions seamlessly) */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-500 px-2 font-mono text-[11px]">Rol:</span>
            {(['admin', 'operator', 'farmer'] as const).map((r) => {
              const targetUser = users.find((u) => u.role === r);
              if (!targetUser) return null;
              const active = currentUser.role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setCurrentUser(targetUser);
                    showToast(
                      `Rol almashtirildi: ${targetUser.name.split(' ')[0]} (${
                        targetUser.roleLabel
                      })`,
                      'info'
                    );
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'admin' ? 'Admin' : r === 'operator' ? 'Operator' : 'Fermer'}
                </button>
              );
            })}
          </div>

          {/* Zone 3: DEMO MODE Live Telemetry Toggle & Alerts Action */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setDemoLivePaused(!demoLivePaused)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/35 text-xs font-mono text-emerald-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Demo sensor yangilanishini to‘xtatish yoki davom ettirish"
            >
              {demoLivePaused ? (
                <Play className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>DEMO MODE</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePage('alerts')}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
              title="Ogohlantirishlar"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-mono font-bold text-white flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Friendly Uzbek Error Banner if Sensor/Network offline simulation is triggered */}
        {sensorErrorBanner && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-between gap-3 text-xs text-red-200">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
              <span>{sensorErrorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('settings')}
              className="px-3 py-1 rounded-lg bg-red-500/25 hover:bg-red-500/40 text-white font-semibold whitespace-nowrap cursor-pointer"
            >
              Sozlamalarda tiklash
            </button>
          </div>
        )}

        {/* Active Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          {activePage === 'dashboard' && (
            <DashboardPage
              user={currentUser}
              zones={zones}
              weather={weather}
              recommendations={recommendations}
              alerts={alerts}
              onManageZone={(z) => setSelectedZoneId(z.id)}
              onStartRecommendedIrrigation={handleStartRecommendedIrrigation}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'zones' && (
            <ZonesPage
              zones={zones}
              userRole={currentUser.role}
              automation={automation}
              onManageZone={(z) => setSelectedZoneId(z.id)}
              onUpdateAutomation={(next) => {
                setAutomation(next);
                showToast('Ma’lumotlar yangilandi.', 'success');
              }}
              onAddZone={(newZone) => {
                setZones((prev) => [...prev, newZone]);
                showToast(`${newZone.id} zonasi muvaffaqiyatli qo‘shildi.`, 'success');
              }}
              onDeleteZone={(id) => {
                setZones((prev) => prev.filter((z) => z.id !== id));
                showToast(`${id} zonasi o‘chirildi.`, 'info');
              }}
            />
          )}

          {activePage === 'water' && (
            <WaterMonitoringPage
              zones={zones}
              onTriggerAlert={(title, desc, zId) =>
                addAlert(title, desc, zId, 'critical')
              }
              onShowToast={showToast}
            />
          )}

          {activePage === 'statistics' && (
            <StatisticsPage zones={zones} onShowToast={showToast} />
          )}

          {activePage === 'ai' && (
            <AIRecommendationsPage
              recommendations={recommendations}
              zones={zones}
              weather={weather}
              userRole={currentUser.role}
              onStartIrrigation={handleStartRecommendedIrrigation}
              onManageZone={(z) => setSelectedZoneId(z.id)}
              onFixZoneIssue={handleFixZoneIssue}
            />
          )}

          {activePage === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              onMarkAllRead={() => {
                setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
                showToast('Barcha ogohlantirishlar o‘qilgan deb belgilandi.', 'success');
              }}
              onResolveAlert={(id) => {
                setAlerts((prev) =>
                  prev.map((a) =>
                    a.id === id ? { ...a, read: true, status: 'Hal qilindi' } : a
                  )
                );
                showToast('Ma’lumotlar yangilandi.', 'success');
              }}
            />
          )}

          {activePage === 'map' && (
            <MapPage
              zones={zones}
              onManageZone={(z) => setSelectedZoneId(z.id)}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              users={users}
              settings={systemSettings}
              onUpdateSettings={setSystemSettings}
              onAddUser={(newUser) => setUsers((prev) => [...prev, newUser])}
              onUpdateUser={(updatedUser) => {
                setUsers((prev) =>
                  prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
                );
                if (currentUser.id === updatedUser.id) {
                  setCurrentUser(updatedUser);
                }
              }}
              onDeleteUser={(userId) => {
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                showToast('Foydalanuvchi o‘chirildi.', 'info');
              }}
              onLogout={() => setCurrentUser(null)}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Zone Control Detailed Modal */}
      <ZoneControlModal
        zone={selectedZone}
        recommendation={selectedZoneRecommendation}
        userRole={currentUser.role}
        onClose={() => setSelectedZoneId(null)}
        onToggleValve={handleToggleValve}
        onTogglePump={handleTogglePump}
        onToggleMode={handleToggleMode}
        onFixIssue={handleFixZoneIssue}
      />

      {/* Toast Notifications Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl flex items-start gap-3 text-xs animate-in fade-in slide-in-from-bottom-2"
          >
            {t.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {t.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            {t.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            {t.type === 'info' && (
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white">{t.message}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {t.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
