import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  FileText, 
  Database, 
  LogOut, 
  Menu, 
  X,
  School,
  RefreshCw,
  FolderLock,
  Smartphone,
  Sparkles,
  Apple
} from 'lucide-react';
import { Teacher, AttendanceRecord } from './types';
import { INITIAL_TEACHERS, INITIAL_SCHEDULE } from './data';
import { getTodayInfo } from './utils/dateUtils';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AttendanceInput from './components/AttendanceInput';
import Reports from './components/Reports';
import MasterData from './components/MasterData';
import SheetSync from './components/SheetSync';
import MobileExport from './components/MobileExport';

export default function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('loginPresensi') === '1';
  });

  // Simulator State for showcasing Android / iOS App Experience
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);
  const [simulatorDevice, setSimulatorDevice] = useState<'ios' | 'android'>('ios');

  // Database Master States (Persisted in localStorage)
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('mudm_teachers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TEACHERS;
      }
    }
    return INITIAL_TEACHERS;
  });

  const [schedule, setSchedule] = useState<Record<string, Record<string, [string, string, string][]>>>(() => {
    const saved = localStorage.getItem('mudm_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SCHEDULE;
      }
    }
    return INITIAL_SCHEDULE;
  });

  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('mudm_attendance_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // UI Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'reports' | 'master' | 'sync' | 'mobile'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Date/Day state for harian filtering
  const [selectedDate, setSelectedDate] = useState(() => {
    return getTodayInfo().tanggal;
  });
  const [selectedDay, setSelectedDay] = useState(() => {
    const info = getTodayInfo();
    const daysArr = ['SABTU', 'AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS'];
    return daysArr.includes(info.hari) ? info.hari : 'SABTU';
  });

  // Synchronize master database to localStorage on modifications
  useEffect(() => {
    localStorage.setItem('mudm_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('mudm_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('mudm_attendance_logs', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  // Auth logins
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loginPresensi');
    setIsLoggedIn(false);
  };

  // Helper to handle filter selection
  const handleFilterChange = (day: string, date: string) => {
    setSelectedDay(day);
    setSelectedDate(date);
  };

  // Handle saving attendance records (inserts or updates duplicates)
  const handleSaveAttendance = (items: AttendanceRecord[]) => {
    setAttendanceLogs((prevLogs) => {
      const logsCopy = [...prevLogs];

      items.forEach((newItem) => {
        // Find if we have a matching entry already recorded
        const duplicateIndex = logsCopy.findIndex((r) => {
          if (newItem.jenis === 'PIKET') {
            return (
              r.tanggal === newItem.tanggal &&
              r.kodeGuru === newItem.kodeGuru &&
              r.jenis === 'PIKET'
            );
          } else {
            return (
              r.tanggal === newItem.tanggal &&
              r.kodeGuru === newItem.kodeGuru &&
              r.kelas === newItem.kelas &&
              r.sesi === newItem.sesi &&
              r.jenis === 'JADWAL'
            );
          }
        });

        if (duplicateIndex > -1) {
          // Replace with updated status/times
          logsCopy[duplicateIndex] = newItem;
        } else {
          // Append new log
          logsCopy.push(newItem);
        }
      });

      return logsCopy;
    });
  };

  // Import JSON Database Backups
  const handleImportBackup = (data: {
    teachers: Teacher[];
    schedule: Record<string, Record<string, [string, string, string][]>>;
    attendanceLogs: AttendanceRecord[];
  }) => {
    setTeachers(data.teachers);
    setSchedule(data.schedule);
    setAttendanceLogs(data.attendanceLogs);
  };

  // Force system clock refresh
  const handleSystemRefresh = () => {
    const info = getTodayInfo();
    const daysArr = ['SABTU', 'AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS'];
    setSelectedDate(info.tanggal);
    setSelectedDay(daysArr.includes(info.hari) ? info.hari : 'SABTU');
  };

  // Guard: Admin Login
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            teachers={teachers}
            attendanceLogs={attendanceLogs}
            schedule={schedule}
            selectedDay={selectedDay}
            selectedDate={selectedDate}
            onFilterChange={handleFilterChange}
          />
        );
      case 'input':
        return (
          <AttendanceInput
            teachers={teachers}
            attendanceLogs={attendanceLogs}
            schedule={schedule}
            selectedDay={selectedDay}
            selectedDate={selectedDate}
            onFilterChange={handleFilterChange}
            onSaveAttendance={handleSaveAttendance}
          />
        );
      case 'reports':
        return (
          <Reports
            teachers={teachers}
            attendanceLogs={attendanceLogs}
            selectedDate={selectedDate}
          />
        );
      case 'master':
        return (
          <MasterData
            teachers={teachers}
            schedule={schedule}
            onUpdateTeachers={setTeachers}
            onUpdateSchedule={setSchedule}
          />
        );
      case 'sync':
        return (
          <SheetSync
            teachers={teachers}
            attendanceLogs={attendanceLogs}
            schedule={schedule}
            onImportBackup={handleImportBackup}
          />
        );
      case 'mobile':
        return <MobileExport />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50/50 text-slate-800 flex flex-col antialiased pb-20 md:pb-0 ${isSimulatorActive ? 'lg:bg-slate-900/95' : ''}`}>
      
      {/* Simulator Control Panel - ONLY visible on desktop if simulator is enabled */}
      {isSimulatorActive && (
        <div className="hidden lg:flex bg-slate-850 text-white border-b border-slate-750 px-6 py-3 items-center justify-between z-50 no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg animate-pulse">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xs font-black tracking-wider uppercase">Live Simulator Android & iOS</h2>
              <p className="text-[10px] text-slate-400 font-bold">Uji responsivitas & nuansa aplikasi seluler asli langsung di browser</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setSimulatorDevice('ios')}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  simulatorDevice === 'ios' 
                    ? 'bg-teal-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>Apple iOS</span>
              </button>
              
              <button
                onClick={() => setSimulatorDevice('android')}
                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  simulatorDevice === 'android' 
                    ? 'bg-teal-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android OS</span>
              </button>
            </div>

            <button
              onClick={() => setIsSimulatorActive(false)}
              className="px-4 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-[10px] font-black rounded-xl border border-rose-500/30 transition-all cursor-pointer"
            >
              Keluar Simulator
            </button>
          </div>
        </div>
      )}

      {/* Upper Navigation Header - Hidden on simulated mobile screens to mimic standalone app */}
      <header className={`bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40 no-print ${isSimulatorActive ? 'lg:hidden' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black font-sans tracking-tight text-slate-900 uppercase">Ibtidaiyah MUDM</h1>
                <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase">Presensi Digital Guru</p>
              </div>
            </div>

            {/* Desktop Navigation Link Tabs */}
            <nav className="hidden md:flex space-x-1 items-center">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'input', label: 'Input Presensi', icon: UserCheck },
                { id: 'reports', label: 'Laporan Rekap', icon: FileText },
                { id: 'master', label: 'Master Data', icon: Database },
                { id: 'sync', label: 'Sheet Sync', icon: RefreshCw },
                { id: 'mobile', label: 'Aplikasi HP', icon: Smartphone },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    id={`nav_tab_${tab.id}`}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-teal-50 text-teal-800 border border-teal-100/30' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Header Right Action Area */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsSimulatorActive(true)}
                title="Buka Mode Simulator Aplikasi HP"
                className="px-3 py-1.5 bg-teal-50/50 hover:bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 animate-bounce" />
                <span>Simulator HP</span>
              </button>

              <button
                id="btn_header_refresh"
                onClick={handleSystemRefresh}
                title="Sinkronisasi & Segarkan Hari Ini"
                className="p-2 text-slate-400 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>

              <div className="w-px h-6 bg-slate-100" />

              <button
                id="btn_header_logout"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu trigger button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={handleSystemRefresh}
                title="Segarkan Hari Ini"
                className="p-2 text-slate-400 hover:text-teal-700 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
              
              <button
                id="btn_mobile_menu_toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu collapsible panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-2 py-3 space-y-1 no-print">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'input', label: 'Input Presensi', icon: UserCheck },
              { id: 'reports', label: 'Laporan Rekap', icon: FileText },
              { id: 'master', label: 'Master Data', icon: Database },
              { id: 'sync', label: 'Sheet Sync', icon: RefreshCw },
              { id: 'mobile', label: 'Aplikasi Android/iOS', icon: Smartphone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`nav_mobile_tab_${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    isActive 
                      ? 'bg-teal-50 text-teal-850' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="border-t border-slate-50 my-2 pt-2 flex items-center justify-between px-4">
              <button
                onClick={handleSystemRefresh}
                className="text-xs font-bold text-slate-500 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Hari Ini</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* CORE BODY AREA */}
      {isSimulatorActive ? (
        /* LIVE MOBILE DEVICE WRAPPER FRAME (SIMULATOR) */
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 relative z-10 no-print">
          
          {/* Smartphone Chassis Container */}
          <div className={`relative mx-auto ${
            simulatorDevice === 'ios' 
              ? 'w-[390px] h-[800px] border-[12px] border-slate-950 rounded-[55px] shadow-2xl bg-white' 
              : 'w-[385px] h-[790px] border-[10px] border-slate-800 rounded-[40px] shadow-2xl bg-white'
          } flex flex-col overflow-hidden transition-all duration-300 relative`}>
            
            {/* iOS Dynamic Island / Android Punch Hole */}
            {simulatorDevice === 'ios' ? (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6.5 bg-slate-950 rounded-full z-50 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-indigo-950/40 rounded-full mr-12" />
                <div className="w-1.5 h-1.5 bg-indigo-950/30 rounded-full" />
              </div>
            ) : (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-center">
                <div className="w-1 h-1 bg-indigo-950/20 rounded-full" />
              </div>
            )}

            {/* Phone Status Bar */}
            <div className="bg-slate-50 text-slate-900 h-11 px-6 pt-1 flex justify-between items-center text-[10px] font-black select-none z-45 shrink-0">
              <div>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="flex items-center gap-1.5 font-mono">
                <span>MUDM-Net</span>
                <span className="text-[9px]">📶</span>
                <span className="text-[9px]">🔋 98%</span>
              </div>
            </div>

            {/* Simulated App Minimal Title Bar */}
            <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <School className="w-4 h-4 text-teal-700" />
                <span className="text-[10px] font-black text-slate-900 tracking-tight uppercase">MUDM Mobile</span>
              </div>
              <span className="text-[8px] font-black bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded uppercase">
                {simulatorDevice === 'ios' ? 'iOS Standalone' : 'Android App'}
              </span>
            </div>

            {/* Scrollable Simulator App Body Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <div className="space-y-4 scale-95 origin-top">
                {renderActiveTabContent()}
              </div>
            </div>

            {/* Simulated Apple/Android Home Indicator Bar & Navigation */}
            <div className="bg-white border-t border-slate-100 pb-5 pt-2 flex flex-col items-center shrink-0">
              
              {/* Virtual Bottom Tab Bar inside simulation */}
              <div className="w-full grid grid-cols-6 text-center select-none mb-1 text-slate-400">
                {[
                  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
                  { id: 'input', label: 'Absen', icon: UserCheck },
                  { id: 'reports', label: 'Rekap', icon: FileText },
                  { id: 'master', label: 'Master', icon: Database },
                  { id: 'sync', label: 'Sync', icon: RefreshCw },
                  { id: 'mobile', label: 'Export', icon: Smartphone },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors ${
                        isActive ? 'text-teal-700 font-bold' : 'hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[8px]">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* iOS Home pill line indicator */}
              {simulatorDevice === 'ios' ? (
                <div className="w-28 h-1 bg-slate-900 rounded-full mt-2" />
              ) : (
                /* Android navigation dot buttons */
                <div className="flex gap-10 mt-1.5">
                  <span className="text-slate-400 text-[10px] font-bold">◀</span>
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400" />
                  <span className="w-2.5 h-2.5 rounded-xs border-2 border-slate-400" />
                </div>
              )}
            </div>

          </div>

          {/* Quick tips */}
          <p className="text-[11px] text-slate-500 mt-4 text-center">
            *Tips: Sentuh/klik tombol-tombol di dalam simulator di atas untuk menguji navigasi mobile.
          </p>

        </div>
      ) : (
        /* STANDARD RESPONSIVE WEB INTERFACE (WITHOUT SIMULATOR OVERLAY) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0">
          {renderActiveTabContent()}
        </main>
      )}

      {/* STICKY BOTTOM NAVIGATION BAR FOR ACTUAL MOBILE DEVICES (Viewport < 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2.5 px-2 flex justify-around items-center z-50 shadow-lg no-print">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'input', label: 'Absen', icon: UserCheck },
          { id: 'reports', label: 'Rekap', icon: FileText },
          { id: 'master', label: 'Master', icon: Database },
          { id: 'sync', label: 'Sync', icon: RefreshCw },
          { id: 'mobile', label: 'App HP', icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors px-2 py-1 ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Page Footer - Hidden when Simulator is active to keep it clean */}
      {!isSimulatorActive && (
        <footer className="bg-white border-t border-slate-100 py-4 mt-12 text-center text-[10px] text-slate-400 no-print pb-28 md:pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-medium">Madrasah Ibtidaiyah MUDM Digital Attendance System</p>
            <p className="font-mono mt-0.5">Sistem Terintegrasi Google Workspace API &bull; Pelayanan Pendidikan Lebih Modern</p>
          </div>
        </footer>
      )}

    </div>
  );
}
