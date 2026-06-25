import { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Users, 
  FileSpreadsheet, 
  BookOpen, 
  Info,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Teacher, AttendanceRecord } from '../types';
import { formatMasehi, formatHijri, getTodayInfo } from '../utils/dateUtils';
import { DAYS_LIST } from '../data';

interface DashboardProps {
  teachers: Teacher[];
  attendanceLogs: AttendanceRecord[];
  schedule: Record<string, Record<string, [string, string, string][]>>;
  selectedDay: string;
  selectedDate: string;
  onFilterChange: (day: string, date: string) => void;
}

export default function Dashboard({
  teachers,
  attendanceLogs,
  schedule,
  selectedDay,
  selectedDate,
  onFilterChange
}: DashboardProps) {
  const [liveTime, setLiveTime] = useState<string>('');

  // Live Clock effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper: map of teacher code -> name
  const teacherMap = teachers.reduce((acc, t) => {
    acc[t.kode] = t.nama;
    return acc;
  }, {} as Record<string, string>);

  // Compile today's schedule based on selectedDay & selectedDate
  const getTodayScheduleData = () => {
    const list: AttendanceRecord[] = [];
    const usedCodes: Record<string, boolean> = {};

    const info = getTodayInfo(selectedDate);
    const daySchedule = schedule[selectedDay] || {};

    Object.keys(daySchedule).forEach((kelas) => {
      daySchedule[kelas].forEach(([sesi, mapel, kodeGuru]) => {
        usedCodes[kodeGuru] = true;

        // Check if there is already an attendance log for this specific slot
        const log = attendanceLogs.find(
          (r) =>
            r.tanggal === selectedDate &&
            r.kelas === kelas &&
            r.sesi === sesi &&
            r.kodeGuru === kodeGuru &&
            r.jenis === 'JADWAL'
        );

        let timeStr = '13.00 - 14.00 WIB';
        if (sesi === '3-4') timeStr = '14.00 - 15.00 WIB';
        if (sesi === '5-6') timeStr = '15.00 - 16.00 WIB';

        list.push({
          id: `${selectedDate}_${kelas}_${sesi}_${kodeGuru}`,
          timestamp: log?.timestamp || '',
          tanggal: selectedDate,
          pekan: info.pekan,
          bulan: info.bulan,
          tahun: info.tahun,
          hari: selectedDay,
          kelas,
          sesi,
          jam: timeStr,
          mapel,
          kodeGuru,
          namaGuru: teacherMap[kodeGuru] || kodeGuru,
          status: log ? log.status : 'Belum Hadir',
          jamMasuk: log?.jamMasuk || '',
          jamKeluar: log?.jamKeluar || '',
          jenis: 'JADWAL'
        });
      });
    });

    // Compile today's piket logs or possible entries
    const piketList: AttendanceRecord[] = [];
    teachers.forEach((t) => {
      if (!usedCodes[t.kode]) {
        // Find existing piket logs
        const log = attendanceLogs.find(
          (r) =>
            r.tanggal === selectedDate &&
            r.kodeGuru === t.kode &&
            r.jenis === 'PIKET'
        );

        piketList.push({
          id: `${selectedDate}_piket_${t.kode}`,
          timestamp: log?.timestamp || '',
          tanggal: selectedDate,
          pekan: info.pekan,
          bulan: info.bulan,
          tahun: info.tahun,
          hari: selectedDay,
          kelas: 'PIKET',
          sesi: 'PIKET',
          jam: 'Guru Bantu',
          mapel: 'Guru Bantu',
          kodeGuru: t.kode,
          namaGuru: t.nama,
          status: log ? log.status : 'Belum Hadir',
          jamMasuk: log?.jamMasuk || '',
          jamKeluar: log?.jamKeluar || '',
          jenis: 'PIKET'
        });
      }
    });

    return { scheduleList: list, piketList };
  };

  const { scheduleList, piketList } = getTodayScheduleData();

  // Stats compilation
  // A teacher in today's unique teaching list is counted as present if they have checked in "Masuk" for at least one slot
  const uniqueTeachersNgajar = Array.from(new Set(scheduleList.map((x) => x.kodeGuru)));
  const totalNgajar = uniqueTeachersNgajar.length;

  // Let's check status for these unique codes
  const checkedInTeachers = uniqueTeachersNgajar.filter((kode) => {
    return scheduleList.some((slot) => slot.kodeGuru === kode && slot.status === 'Masuk');
  }).length;

  const belumHadirCount = Math.max(totalNgajar - checkedInTeachers, 0);
  const percentHadir = totalNgajar ? Math.round((checkedInTeachers / totalNgajar) * 100) : 0;

  // Global attendance logs for selectedDate
  const todayLogs = attendanceLogs.filter((r) => r.tanggal === selectedDate);
  const sumHadir = todayLogs.filter((r) => r.status === 'Masuk').length;
  const sumIzin = todayLogs.filter((r) => r.status === 'Izin').length;
  const sumSakit = todayLogs.filter((r) => r.status === 'Sakit').length;
  const sumAlpa = todayLogs.filter((r) => r.status === 'Alpa').length;

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Islamic Calendar Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar and Clock Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-300 pointer-events-none">
            <Calendar className="w-40 h-40 text-teal-800" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
            <div>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold font-mono rounded-full uppercase tracking-wider">
                Kalender Akademik
              </span>
              <h2 className="text-xl font-bold text-slate-800 mt-2">
                {formatMasehi(selectedDate)}
              </h2>
              <p className="text-sm font-medium text-amber-600 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {formatHijri(selectedDate)} H
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="p-2.5 bg-teal-600 rounded-xl text-white">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono">Live WIB</p>
                <p className="text-lg font-bold font-mono text-slate-800">{liveTime || '00:00:00'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-6 pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
            <div>
              Hari Aktif: <strong className="text-slate-700">{selectedDay}</strong>
            </div>
            <div>
              Tahun Ajaran: <strong className="text-slate-700">{selectedDate.split('-')[0]} / {parseInt(selectedDate.split('-')[0]) + 1}</strong>
            </div>
            <div>
              Pekan Ke: <strong className="text-slate-700">{getTodayInfo(selectedDate).pekan}</strong>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                <Info className="w-4.5 h-4.5" />
              </span>
              <h3 className="text-sm font-bold text-slate-800">Uji Coba & Navigasi Tanggal</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Pilih tanggal atau hari untuk mensimulasikan jadwal mengajar dan melihat data presensi harian guru.
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label htmlFor="select_day_dash" className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pilih Hari Mengajar</label>
              <select
                id="select_day_dash"
                value={selectedDay}
                onChange={(e) => {
                  // Find a date matching this day of the week, or keep current date
                  onFilterChange(e.target.value, selectedDate);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 text-slate-700 cursor-pointer"
              >
                {DAYS_LIST.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="select_date_dash" className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Simulasi Tanggal Kalender</label>
              <input
                id="select_date_dash"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  const info = getTodayInfo(e.target.value);
                  // Ensure if day changes we update both
                  onFilterChange(DAYS_LIST.includes(info.hari) ? info.hari : 'SABTU', e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10 text-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div id="stat_total_scheduled" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Guru Mengajar</span>
            <span className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-3">{totalNgajar}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-medium">
            <span>Terjadwal aktif hari {selectedDay}</span>
          </div>
        </div>

        <div id="stat_present" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sudah Masuk</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-3">{checkedInTeachers}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Guru telah melakukan check-in</span>
          </div>
        </div>

        <div id="stat_absent" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum Hadir</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mt-3">{belumHadirCount}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-medium">
            <span>Menunggu kehadiran guru</span>
          </div>
        </div>

        <div id="stat_percentage" className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Persentase</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-3xl font-extrabold text-slate-800">{percentHadir}%</p>
            <span className="text-xs font-semibold text-slate-400">Target 100%</span>
          </div>
          
          {/* Animated custom bar indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${percentHadir}%` }}
            />
          </div>
        </div>

      </div>

      {/* Quick Summary Counts Banner */}
      <div className="bg-teal-900 text-teal-100 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-800/20 to-emerald-600/10" />
        <div className="flex items-center gap-3 z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="text-xs font-bold font-sans uppercase tracking-wider">Status Akumulasi Log Hari Ini</h4>
        </div>
        <div className="flex items-center gap-6 z-10 font-mono text-xs text-teal-200">
          <div>
            Masuk: <strong className="text-white text-sm">{sumHadir}</strong>
          </div>
          <div className="border-l border-teal-800 h-4" />
          <div>
            Izin: <strong className="text-amber-300 text-sm">{sumIzin}</strong>
          </div>
          <div className="border-l border-teal-800 h-4" />
          <div>
            Sakit: <strong className="text-blue-300 text-sm">{sumSakit}</strong>
          </div>
          <div className="border-l border-teal-800 h-4" />
          <div>
            Alpa: <strong className="text-red-300 text-sm">{sumAlpa}</strong>
          </div>
        </div>
      </div>

      {/* Schedule Table and Sessions Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scheduled Slots */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-800">Jadwal Mengajar Harian ({selectedDay})</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Menampilkan {scheduleList.length} Entri Jadwal</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Sesi & Jam</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Guru</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Jam Masuk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {scheduleList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                        Tidak ada jadwal mengajar pada hari {selectedDay}.
                      </td>
                    </tr>
                  ) : (
                    scheduleList.map((x, i) => {
                      // Styling badge based on status
                      let badgeStyle = "bg-slate-50 text-slate-400 border-slate-100";
                      if (x.status === "Masuk") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      if (x.status === "Izin") badgeStyle = "bg-amber-50 text-amber-700 border-amber-100";
                      if (x.status === "Sakit") badgeStyle = "bg-blue-50 text-blue-700 border-blue-100";
                      if (x.status === "Alpa") badgeStyle = "bg-rose-50 text-rose-700 border-rose-100";

                      return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800 font-sans">Kelas {x.kelas}</td>
                          <td className="py-3.5 px-4 font-medium">
                            <span className="block font-semibold text-slate-700">Sesi {x.sesi}</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{x.jam}</span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">{x.mapel}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-teal-100">
                                {x.kodeGuru}
                              </span>
                              <span className="font-semibold truncate max-w-[140px]">{x.namaGuru}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${badgeStyle}`}>
                              {x.status === 'Masuk' ? 'Hadir' : x.status || 'Belum Hadir'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-700">
                            {x.jamMasuk ? (
                              <span className="bg-teal-50 px-2 py-0.5 rounded text-[10px] border border-teal-100">{x.jamMasuk}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Legend Panel & Piket Guru */}
        <div className="space-y-6">
          
          {/* Sesi Legenda */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Ketentuan Jam Kegiatan
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-slate-700">Sesi 1 - 2</span>
                <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">13.00 – 14.00 WIB</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-slate-700">Sesi 3 - 4</span>
                <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">14.00 – 15.00 WIB</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="font-bold text-slate-700">Sesi 5 - 6</span>
                <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">15.00 – 16.00 WIB</span>
              </div>
            </div>
          </div>

          {/* Piket / Guru Bantu List */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Piket / Guru Bantu
              </h3>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                {piketList.length} Guru
              </span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Daftar guru yang tidak terjadwal mengajar kelas pada hari ini, ditugaskan sebagai Guru Bantu.
            </p>

            <div className="max-h-[180px] overflow-y-auto divide-y divide-slate-50 pr-1.5 scrollbar-thin">
              {piketList.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">Semua guru terjadwal mengajar.</div>
              ) : (
                piketList.map((p, idx) => {
                  const log = todayLogs.find(r => r.kodeGuru === p.kodeGuru && r.jenis === 'PIKET');
                  let pStyle = "bg-slate-50 text-slate-400 border-slate-100";
                  if (log?.status === "Masuk") pStyle = "bg-emerald-50 text-emerald-700 border-emerald-100";

                  return (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 shrink-0 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold font-mono rounded-full flex items-center justify-center">
                          {p.kodeGuru}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 truncate">{p.namaGuru}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border shrink-0 ${pStyle}`}>
                        {log?.status === 'Masuk' ? 'Piket Aktif' : 'Belum Hadir'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
