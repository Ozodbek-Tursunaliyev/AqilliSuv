import React, { useState } from 'react';
import {
  Save,
  UserPlus,
  Trash2,
  Edit3,
  LogOut,
  Wifi,
  WifiOff,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { SystemSettings, User, UserRole } from '../types';
import { getHardwareConfig, setHardwareConfig } from '../services/sensorService';

interface SettingsPageProps {
  currentUser: User;
  users: User[];
  settings: SystemSettings;
  onUpdateSettings: (next: SystemSettings) => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  users,
  settings,
  onUpdateSettings,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onLogout,
  onShowToast,
}) => {
  const [formState, setFormState] = useState<SystemSettings>(settings);
  const [accountName, setAccountName] = useState(currentUser.name);
  const [accountPassword, setAccountPassword] = useState(currentUser.password || 'admin123');
  const [simulateOffline, setSimulateOffline] = useState(
    () => getHardwareConfig().simulateNetworkError
  );

  // User Modal State (Admin Only)
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [uName, setUName] = useState('');
  const [uLogin, setULogin] = useState('');
  const [uPassword, setUPassword] = useState('fermer123');
  const [uRole, setURole] = useState<UserRole>('farmer');
  const [uStatus, setUStatus] = useState<'Faol' | 'Nofaol'>('Faol');

  const isAdmin = currentUser.role === 'admin';

  const handleSaveSystemSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formState);
    onShowToast('Ma’lumotlar yangilandi.', 'success');
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...currentUser,
      name: accountName,
      password: accountPassword,
    });
    onShowToast('Shaxsiy hisob ma’lumotlari saqlandi.', 'success');
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUName('');
    setULogin('');
    setUPassword('operator123');
    setURole('operator');
    setUStatus('Faol');
    setUserModalOpen(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUser(u);
    setUName(u.name);
    setULogin(u.login);
    setUPassword(u.password || '123456');
    setURole(u.role);
    setUStatus(u.status);
    setUserModalOpen(true);
  };

  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uLogin.trim()) return;

    const roleLabelMap: Record<UserRole, string> = {
      admin: 'Administrator',
      operator: 'Operator',
      farmer: 'Fermer / Agronom',
    };

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: uName.trim(),
        login: uLogin.trim(),
        password: uPassword,
        role: uRole,
        roleLabel: roleLabelMap[uRole],
        status: uStatus,
      });
      onShowToast(`${uName} ma’lumotlari yangilandi.`, 'success');
    } else {
      const created: User = {
        id: `u-${Date.now()}`,
        name: uName.trim(),
        login: uLogin.trim(),
        password: uPassword,
        role: uRole,
        roleLabel: roleLabelMap[uRole],
        status: uStatus,
        lastActivity: 'Yangi qo‘shildi',
        department: 'Farg‘ona Agro klasteri',
        phone: '+998 90 000 00 00',
      };
      onAddUser(created);
      onShowToast(`Yangi foydalanuvchi (${created.name}) qo‘shildi.`, 'success');
    }
    setUserModalOpen(false);
  };

  const toggleHardwareNetworkError = () => {
    const next = !simulateOffline;
    setSimulateOffline(next);
    setHardwareConfig({ simulateNetworkError: next });
    if (next) {
      onShowToast('Sensor bilan aloqa vaqtincha mavjud emas.', 'error');
    } else {
      onShowToast('ESP32 sensor tugunlari bilan aloqa tiklandi.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
            KONFIGURATSIYA VA FOYDALANUVCHILAR
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">⚙️ Sozlamalar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tizim parametrlari, sug‘orish me’yorlari, bildirishnomalar, foydalanuvchilar va ESP32
            integratsiyasi
          </p>
        </div>
      </div>

      {/* Section 19: USER MANAGEMENT (Admin Only) */}
      {isAdmin && (
        <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-cyan-400">FAQAT ADMINISTRATOR UCHUN</span>
              <h2 className="text-lg font-bold text-white mt-0.5">Foydalanuvchilar boshqaruvi</h2>
            </div>

            <button
              type="button"
              onClick={openAddUserModal}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Foydalanuvchi qo‘shish</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3">Ism-sharif</th>
                  <th className="py-2.5 px-3">Login</th>
                  <th className="py-2.5 px-3">Rol</th>
                  <th className="py-2.5 px-3">Holat</th>
                  <th className="py-2.5 px-3">Oxirgi faollik</th>
                  <th className="py-2.5 px-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-cyan-300">{u.login}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          u.role === 'admin'
                            ? 'text-emerald-400'
                            : u.role === 'operator'
                            ? 'text-cyan-400'
                            : 'text-amber-300'
                        }`}
                      >
                        {u.roleLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className={u.status === 'Faol' ? 'text-emerald-400' : 'text-slate-500'}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">{u.lastActivity}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditUserModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {u.login !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => onDeleteUser(u.id)}
                            className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white cursor-pointer"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 20: System, Irrigation, Notifications & Account Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System & Irrigation Form */}
        <form
          onSubmit={handleSaveSystemSettings}
          className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 space-y-5"
        >
          <div>
            <h3 className="text-base font-bold text-white">Tizim va Sug‘orish sozlamalari</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Xo‘jalik ma’lumotlari va standart sug‘orish chegaralari
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Tizim nomi (System name)</label>
              <input
                type="text"
                value={formState.systemName}
                onChange={(e) => setFormState({ ...formState, systemName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Xo‘jalik nomi (Farm name)</label>
              <input
                type="text"
                value={formState.farmName}
                onChange={(e) => setFormState({ ...formState, farmName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Joylashuv (Location)</label>
              <input
                type="text"
                value={formState.location}
                onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-slate-300 mb-1">Minimal namlik (%)</label>
                <input
                  type="number"
                  value={formState.minMoisture}
                  onChange={(e) =>
                    setFormState({ ...formState, minMoisture: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Maksimal namlik (%)</label>
                <input
                  type="number"
                  value={formState.maxMoisture}
                  onChange={(e) =>
                    setFormState({ ...formState, maxMoisture: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Standart vaqt (daq)</label>
                <input
                  type="number"
                  value={formState.defaultDurationMin}
                  onChange={(e) =>
                    setFormState({ ...formState, defaultDurationMin: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notifications Toggles */}
          <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
            <h4 className="font-semibold text-white">Xabarnomalar (Notifications)</h4>

            {[
              {
                key: 'emailNotification' as const,
                label: 'Email xabarnoma',
                desc: 'Kunlik suv sarfi hisobotlarini pochtaga yuborish',
              },
              {
                key: 'browserNotification' as const,
                label: 'Brauzer xabarnomasi',
                desc: 'Klapan ochilishi va sug‘orish tugashi haqida Push-bildirishnoma',
              },
              {
                key: 'criticalAlertNotification' as const,
                label: 'Kritik ogohlantirishlar',
                desc: 'Suv sizib chiqishi va namlik 30% dan tushganda tezkor signal',
              },
            ].map((item) => (
              <div
                key={item.key}
                onClick={() =>
                  setFormState({ ...formState, [item.key]: !formState[item.key] })
                }
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer"
              >
                <div>
                  <div className="font-medium text-slate-200">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    formState[item.key] ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      formState[item.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Sozlamalarni saqlash</span>
          </button>
        </form>

        {/* Account & ESP32 Hardware Integration Panel */}
        <div className="space-y-6">
          <form
            onSubmit={handleSaveAccount}
            className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-white">Shaxsiy hisob (Account)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Joriy foydalanuvchi: <strong className="text-emerald-400">{currentUser.roleLabel}</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Ism-sharif (Name)</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Yangi parol (Password)</label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs cursor-pointer"
              >
                Hisobni yangilash
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 font-semibold text-xs flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Chiqish</span>
              </button>
            </div>
          </form>

          {/* ESP32 / IoT Gateway & Error Handling Simulator */}
          <div className="bg-[#0F172A] border border-slate-800/90 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400">ESP32 / ARDUINO GATEWAY</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  IoT apparat qatlami va aloqa diagnostikasi
                </h3>
              </div>
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div>REST Endpoint: <span className="text-cyan-400">POST /api/v1/iot/telemetry</span></div>
              <div>MQTT Broker: <span className="text-emerald-400">wss://iot.aqllisuv.uz:8883/mqtt</span></div>
              <div>Rejim: <span className="text-amber-300">DEMO MODE (Avto-generatsiya har 3s)</span></div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
              <div>
                <div className="font-semibold text-white">
                  Sensor / Tarmoq uzilishini sinash (Error Handling)
                </div>
                <div className="text-slate-400 mt-0.5">
                  “Sensor bilan aloqa vaqtincha mavjud emas” xatolik holatini tekshirish
                </div>
              </div>
              <button
                type="button"
                onClick={toggleHardwareNetworkError}
                className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  simulateOffline
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {simulateOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Aloqani tiklash</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Uzilishni sinash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-white">
              {editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi qo‘shish'}
            </h3>
            <form onSubmit={handleUserFormSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Ism-sharif</label>
                <input
                  type="text"
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="Masalan: Jamshid Karimov"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Login</label>
                <input
                  type="text"
                  value={uLogin}
                  onChange={(e) => setULogin(e.target.value)}
                  placeholder="jamshid_op"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Parol</label>
                <input
                  type="text"
                  value={uPassword}
                  onChange={(e) => setUPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Rol</label>
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                    <option value="farmer">Fermer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Holat</label>
                  <select
                    value={uStatus}
                    onChange={(e) => setUStatus(e.target.value as 'Faol' | 'Nofaol')}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="Faol">Faol</option>
                    <option value="Nofaol">Nofaol</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold cursor-pointer"
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
