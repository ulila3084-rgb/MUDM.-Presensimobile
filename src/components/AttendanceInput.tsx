import { useState } from 'react';
import { 
  Check, 
  Clock, 
  HelpCircle, 
  Search, 
  SlidersHorizontal, 
  UserCheck, 
  FileCheck,
  AlertCircle,
  Undo2
} from 'lucide-react';
import { Teacher, AttendanceRecord } from '../types';
import { getTodayInfo } from '../utils/dateUtils';
import { DAYS_LIST } from '../data';

interface AttendanceInputProps {
  teachers: Teacher[];
  attendanceLogs: AttendanceRecord[];
  schedule: Record<string, Record<string, [string, string, string][]>>;
  selectedDay: string;
  selectedDate: string;
  onFilterChange: (day: string, date: string) => void;
  onSaveAttendance: (items: AttendanceRecord[]) => void;
}

export default function AttendanceInput({
  teachers,
  attendanceLogs,
  schedule,
  selectedDay,
  selectedDate,
  onFilterChange,
  onSaveAttendance
}: AttendanceInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'JADWAL' | 'PIKET'>('ALL');
  const [tempStatuses, setTempStatuses] = useState<Record<string, 'Masuk' | 'Izin' | 'Sakit' | 'Alpa' | 'Belum Hadir'>>({});

  const teacherMap = teachers.reduce((acc, t) => {
    acc[t.kode] = t.nama;
    return acc;
  }, {} as Record<string, string>);

  const info = getTodayInfo(selectedDate);
  const daySchedule = schedule[selectedDay] || {};

  // Build current day's active rows (Jadwal & Piket combined)
  const rows: AttendanceRecord[] = [];
  const usedCodes: Record<string, boolean> = {};

  // 1. Process scheduled items
  Object.keys(daySchedule).forEach((kelas) => {
    daySchedule[kelas].forEach(([sesi, mapel, kodeGuru]) => {
      usedCodes[kodeGuru] = true;

      // Find log if saved
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

      rows.push({
        id: `JADWAL_${kelas}_${sesi}_${kodeGuru}`,
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

  // 2. Process Piket items
  teachers.forEach((t) => {
    if (!usedCodes[t.kode]) {
      const log = attendanceLogs.find(
        (r) =>
          r.tanggal === selectedDate &&
          r.kodeGuru === t.kode &&
          r.jenis === 'PIKET'
      );

      rows.push({
        id: `PIKET_PIKET_PIKET_${t.kode}`,
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

  // Filter rows by search and category
  const filteredRows = rows.filter((r) => {
    const matchesSearch = 
      r.namaGuru.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.kodeGuru.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'ALL' || 
      r.jenis === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Handle setting status inside input table row
  const handleStatusChangeInRow = (rowId: string, status: 'Masuk' | 'Izin' | 'Sakit' | 'Alpa') => {
    setTempStatuses(prev => ({ ...prev, [rowId]: status }));
  };

  // Perform save actions (Check-In, Save, Check-Out)
  const triggerSaveAction = (row: AttendanceRecord, action: 'MASUK' | 'SIMPAN' | 'KELUAR') => {
    const rowId = row.id || '';
    const selectedStatus = tempStatuses[rowId] || (row.status === 'Belum Hadir' ? '' : row.status);

    if (action !== 'KELUAR' && !selectedStatus) {
      alert('Pilih status kehadiran terlebih dahulu!');
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

    let updatedJamMasuk = row.jamMasuk;
    let updatedJamKeluar = row.jamKeluar;
    let finalStatus = selectedStatus;

    if (action === 'MASUK') {
      finalStatus = 'Masuk';
      updatedJamMasuk = formattedTime;
      updatedJamKeluar = ''; // Reset checkout if checking in again
    } else if (action === 'KELUAR') {
      updatedJamKeluar = formattedTime;
      if (row.status !== 'Masuk') {
        finalStatus = 'Masuk'; // Force Masuk if checking out
        updatedJamMasuk = row.jamMasuk || formattedTime; // Set check-in if missing
      }
    } else if (action === 'SIMPAN') {
      if (selectedStatus === 'Masuk' && !row.jamMasuk) {
        updatedJamMasuk = formattedTime;
      } else if (selectedStatus !== 'Masuk') {
        updatedJamMasuk = '';
        updatedJamKeluar = '';
      }
    }

    const itemToSave: AttendanceRecord = {
      ...row,
      status: finalStatus as any,
      jamMasuk: updatedJamMasuk,
      jamKeluar: updatedJamKeluar,
      timestamp: now.toISOString()
    };

    onSaveAttendance([itemToSave]);

    // Clear local state storage for this row
    setTempStatuses(prev => {
      const copy = { ...prev };
      delete copy[rowId];
      return copy;
    });
  };

  // Bulk operation to mark all filtered/visible teachers as "Masuk"
  const handleBulkCheckIn = () => {
    const unsubmitted = filteredRows.filter(r => r.status === 'Belum Hadir' || !r.status);
    if (unsubmitted.length === 0) {
      alert('Semua guru di daftar saat ini sudah memiliki status presensi.');
      return;
    }

    const confirmed = window.confirm(`Konfirmasi: Beri status 'Masuk' (Hadir) untuk ${unsubmitted.length} guru secara massal?`);
    if (!confirmed) return;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

    const itemsToSave = unsubmitted.map(row => ({
      ...row,
      status: 'Masuk' as const,
      jamMasuk: formattedTime,
      jamKeluar: '',
      timestamp: now.toISOString()
    }));

    onSaveAttendance(itemsToSave);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Bulk action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Input Presensi Harian</h2>
          <p className="text-xs text-slate-400 mt-1">
            Lakukan pencatatan kehadiran untuk hari <strong className="text-teal-700">{selectedDay}</strong>, tanggal <strong className="text-teal-700">{selectedDate}</strong>
          </p>
        </div>

        <button
          id="bulk_checkin_btn"
          onClick={handleBulkCheckIn}
          className="px-4 py-2 bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserCheck className="w-4 h-4" />
          <span>Isi Hadir Massal ({filteredRows.filter(r => r.status === 'Belum Hadir').length})</span>
        </button>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Day selection */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <label htmlFor="select_day_input" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hari Kerja</label>
          <select
            id="select_day_input"
            value={selectedDay}
            onChange={(e) => onFilterChange(e.target.value, selectedDate)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-600 cursor-pointer"
          >
            {DAYS_LIST.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-end">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="attendance_search"
              type="text"
              placeholder="Cari guru, kelas, kode, atau mapel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-600 text-slate-700"
            />
          </div>
        </div>

        {/* Filter Category */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <label htmlFor="category_filter" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kategori Tugas</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${categoryFilter === 'ALL' ? 'bg-white shadow-xs text-teal-800 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setCategoryFilter('JADWAL')}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${categoryFilter === 'JADWAL' ? 'bg-white shadow-xs text-teal-800 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mengajar
            </button>
            <button
              onClick={() => setCategoryFilter('PIKET')}
              className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${categoryFilter === 'PIKET' ? 'bg-white shadow-xs text-teal-800 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Piket
            </button>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="py-3.5 px-4 w-[110px]">Tugas / Kelas</th>
                <th className="py-3.5 px-4">Jam Mengajar</th>
                <th className="py-3.5 px-4">Mata Pelajaran</th>
                <th className="py-3.5 px-4">Kode & Nama Guru</th>
                <th className="py-3.5 px-4 text-center min-w-[200px]">Pilih Kehadiran</th>
                <th className="py-3.5 px-4">Histori Sesi</th>
                <th className="py-3.5 px-4 text-right">Aksi Simpan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span>Data jadwal tidak ditemukan sesuai pencarian/filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((x, i) => {
                  const rowId = x.id || '';
                  const activeStatus = tempStatuses[rowId] || (x.status === 'Belum Hadir' ? '' : x.status);

                  return (
                    <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                      {/* Class */}
                      <td className="py-4 px-4">
                        {x.jenis === 'PIKET' ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-lg font-sans">
                            GURU PIKET
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 font-sans block">Kelas {x.kelas}</span>
                            <span className="px-1.5 py-0.2 bg-teal-50 text-teal-700 border border-teal-100 text-[9px] font-extrabold rounded">
                              Sesi {x.sesi}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Time Slot */}
                      <td className="py-4 px-4 text-slate-500 font-medium font-mono text-[11px]">
                        {x.jam}
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 block">{x.mapel}</span>
                      </td>

                      {/* Teacher information */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                            {x.kodeGuru}
                          </span>
                          <span className="font-bold text-slate-700 truncate max-w-[140px] block">{x.namaGuru}</span>
                        </div>
                      </td>

                      {/* Attendance Selector badging */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex p-1 bg-slate-50 border border-slate-200 rounded-xl gap-1">
                          {(['Masuk', 'Izin', 'Sakit', 'Alpa'] as const).map((st) => {
                            let selectStyle = "text-slate-400 hover:text-slate-600";
                            if (activeStatus === st) {
                              if (st === 'Masuk') selectStyle = "bg-emerald-600 text-white shadow-xs";
                              if (st === 'Izin') selectStyle = "bg-amber-500 text-white shadow-xs";
                              if (st === 'Sakit') selectStyle = "bg-blue-600 text-white shadow-xs";
                              if (st === 'Alpa') selectStyle = "bg-red-600 text-white shadow-xs";
                            }

                            return (
                              <button
                                key={st}
                                onClick={() => handleStatusChangeInRow(rowId, st)}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${selectStyle}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Check-In/Check-Out Live Record */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-400 font-medium">In:</span>
                            <strong className="font-mono text-slate-700">
                              {x.jamMasuk || '-'}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="text-slate-400 font-medium">Out:</span>
                            <strong className="font-mono text-slate-700">
                              {x.jamKeluar || '-'}
                            </strong>
                          </div>
                        </div>
                      </td>

                      {/* Submission Action triggers */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Checked-in quick triggers */}
                          <button
                            onClick={() => triggerSaveAction(x, 'MASUK')}
                            title="Lakukan Check-In (Masuk)"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 rounded-lg transition-all cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>

                          {/* Checkout quick trigger */}
                          <button
                            onClick={() => triggerSaveAction(x, 'KELUAR')}
                            disabled={!x.jamMasuk}
                            title="Lakukan Check-Out (Keluar)"
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white disabled:bg-slate-100 disabled:text-slate-300 border border-blue-100 disabled:border-slate-200 rounded-lg transition-all cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>

                          {/* Save standard status */}
                          <button
                            onClick={() => triggerSaveAction(x, 'SIMPAN')}
                            title="Simpan Kehadiran"
                            className="px-2 py-1.5 bg-slate-100 hover:bg-teal-700 hover:text-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Simpan</span>
                          </button>

                        </div>
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
  );
}
