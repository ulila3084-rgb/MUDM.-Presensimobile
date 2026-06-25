import { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Search, 
  TrendingUp, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { Teacher, AttendanceRecord } from '../types';
import { formatMasehi, getTodayInfo } from '../utils/dateUtils';

interface ReportsProps {
  teachers: Teacher[];
  attendanceLogs: AttendanceRecord[];
  selectedDate: string;
}

export default function Reports({
  teachers,
  attendanceLogs,
  selectedDate
}: ReportsProps) {
  const [reportType, setReportType] = useState<'harian' | 'pekanan' | 'bulanan'>('harian');
  
  // Date filtering state
  const currentInfo = getTodayInfo(selectedDate);
  const [filterDate, setFilterDate] = useState(selectedDate);
  const [filterMonth, setFilterMonth] = useState(`${currentInfo.tahun}-${String(currentInfo.bulan).padStart(2, '0')}`);
  const [filterWeek, setFilterWeek] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');

  const teacherMap = teachers.reduce((acc, t) => {
    acc[t.kode] = { name: t.nama, nig: t.nig };
    return acc;
  }, {} as Record<string, { name: string, nig: string }>);

  // Compile report data based on inputs
  const compileReportData = () => {
    let filteredLogs = [...attendanceLogs];

    if (reportType === 'harian') {
      filteredLogs = filteredLogs.filter(r => r.tanggal === filterDate);
    } else if (reportType === 'pekanan') {
      // Replicate GAS: filter where year matches, and calculate if in month and corresponding week index
      // To make it easy and reliable, we'll map week numbers or filter by selected month and week of month
      const [y, m] = filterMonth.split('-').map(Number);
      filteredLogs = filteredLogs.filter(r => {
        const logDate = new Date(r.tanggal + 'T12:00:00');
        const logYear = logDate.getFullYear();
        const logMonth = logDate.getMonth() + 1;
        
        // Find week of month (1 to 5)
        const date = logDate.getDate();
        const weekOfMonth = Math.ceil(date / 7);

        return logYear === y && logMonth === m && String(weekOfMonth) === filterWeek;
      });
    } else if (reportType === 'bulanan') {
      const [y, m] = filterMonth.split('-').map(Number);
      filteredLogs = filteredLogs.filter(r => {
        const logDate = new Date(r.tanggal + 'T12:00:00');
        const logYear = logDate.getFullYear();
        const logMonth = logDate.getMonth() + 1;
        return logYear === y && logMonth === m;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filteredLogs = filteredLogs.filter(r => 
        r.namaGuru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kodeGuru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.kelas.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Build statistics
    const totalCount = filteredLogs.length;
    const masukCount = filteredLogs.filter(r => r.status === 'Masuk').length;
    const izinCount = filteredLogs.filter(r => r.status === 'Izin').length;
    const sakitCount = filteredLogs.filter(r => r.status === 'Sakit').length;
    const alpaCount = filteredLogs.filter(r => r.status === 'Alpa').length;

    // Compile Rekap (Summarized teacher stats)
    const rekapMap: Record<string, {
      kode: string;
      nig: string;
      namaGuru: string;
      totalMengajar: number;
      masuk: number;
      izin: number;
      sakit: number;
      alpa: number;
      tanggalMasuk: string[];
      tanggalIzin: string[];
      tanggalSakit: string[];
      tanggalAlpa: string[];
    }> = {};

    // Seed all teachers
    teachers.forEach((t) => {
      rekapMap[t.kode] = {
        kode: t.kode,
        nig: t.nig,
        namaGuru: t.nama,
        totalMengajar: 0,
        masuk: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
        tanggalMasuk: [],
        tanggalIzin: [],
        tanggalSakit: [],
        tanggalAlpa: []
      };
    });

    // Accumulate logs
    filteredLogs.forEach((log) => {
      const k = log.kodeGuru;
      if (!rekapMap[k]) {
        rekapMap[k] = {
          kode: k,
          nig: teacherMap[k]?.nig || '-',
          namaGuru: log.namaGuru,
          totalMengajar: 0,
          masuk: 0,
          izin: 0,
          sakit: 0,
          alpa: 0,
          tanggalMasuk: [],
          tanggalIzin: [],
          tanggalSakit: [],
          tanggalAlpa: []
        };
      }

      const row = rekapMap[k];
      row.totalMengajar++;

      if (log.status === 'Masuk') {
        row.masuk++;
        if (!row.tanggalMasuk.includes(log.tanggal)) row.tanggalMasuk.push(log.tanggal);
      } else if (log.status === 'Izin') {
        row.izin++;
        if (!row.tanggalIzin.includes(log.tanggal)) row.tanggalIzin.push(log.tanggal);
      } else if (log.status === 'Sakit') {
        row.sakit++;
        if (!row.tanggalSakit.includes(log.tanggal)) row.tanggalSakit.push(log.tanggal);
      } else if (log.status === 'Alpa') {
        row.alpa++;
        if (!row.tanggalAlpa.includes(log.tanggal)) row.tanggalAlpa.push(log.tanggal);
      }
    });

    return {
      logs: filteredLogs,
      rekap: Object.values(rekapMap).filter(r => reportType === 'harian' ? true : r.totalMengajar > 0),
      stats: { total: totalCount, masuk: masukCount, izin: izinCount, sakit: sakitCount, alpa: alpaCount }
    };
  };

  const { logs, rekap, stats } = compileReportData();

  // Export visible data to CSV format
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === 'harian') {
      csvContent += "Tanggal,Hari,Kelas,Sesi,Jam,Mapel,NIG,Nama Guru,Status,Jam Masuk,Jam Keluar,Jenis Tugas\n";
      logs.forEach(r => {
        csvContent += `"${r.tanggal}","${r.hari}","${r.kelas}","${r.sesi}","${r.jam}","${r.mapel}","${teacherMap[r.kodeGuru]?.nig || '-'}","${r.namaGuru}","${r.status}","${r.jamMasuk}","${r.jamKeluar}","${r.jenis}"\n`;
      });
    } else {
      csvContent += "No,NIG,Kode,Nama Guru,Total Mengajar,Masuk,Izin,Sakit,Alpa,Tanggal Masuk,Tanggal Izin,Tanggal Sakit,Tanggal Alpa\n";
      rekap.forEach((r, idx) => {
        csvContent += `"${idx + 1}","${r.nig}","${r.kode}","${r.namaGuru}",${r.totalMengajar},${r.masuk},${r.izin},${r.sakit},${r.alpa},"${r.tanggalMasuk.join(' | ')}","${r.tanggalIzin.join(' | ')}","${r.tanggalSakit.join(' | ')}","${r.tanggalAlpa.join(' | ')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_MUDM_${reportType}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get report subtitle text based on filter
  const getReportSubtitle = () => {
    if (reportType === 'harian') {
      return `Laporan Harian Detail - Tanggal ${formatMasehi(filterDate)}`;
    }
    const [y, m] = filterMonth.split('-');
    const months = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (reportType === 'pekanan') {
      return `Laporan Pekanan Rekap Guru - Bulan ${months[parseInt(m)]} ${y}, Minggu Ke-${filterWeek}`;
    }
    return `Laporan Bulanan Rekap Guru - Bulan ${months[parseInt(m)]} ${y}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Report controls panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5 no-print">
        
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
            <Filter className="w-5 h-5" />
          </span>
          <h3 className="text-base font-bold text-slate-800">Filter Parameter Laporan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Select Report Mode */}
          <div>
            <label htmlFor="report_type_select" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jenis Laporan</label>
            <select
              id="report_type_select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-600"
            >
              <option value="harian">Harian Detail</option>
              <option value="pekanan">Pekanan Rekap Guru</option>
              <option value="bulanan">Bulanan Rekap Guru</option>
            </select>
          </div>

          {/* Dynamic Filters depending on report mode */}
          {reportType === 'harian' && (
            <div>
              <label htmlFor="harian_date_input" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pilih Tanggal</label>
              <input
                id="harian_date_input"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-600"
              />
            </div>
          )}

          {(reportType === 'pekanan' || reportType === 'bulanan') && (
            <div>
              <label htmlFor="bulanan_month_input" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pilih Bulan</label>
              <input
                id="bulanan_month_input"
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-600"
              />
            </div>
          )}

          {reportType === 'pekanan' && (
            <div>
              <label htmlFor="pekan_select" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Minggu Ke</label>
              <select
                id="pekan_select"
                value={filterWeek}
                onChange={(e) => setFilterWeek(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-600"
              >
                <option value="1">Minggu 1</option>
                <option value="2">Minggu 2</option>
                <option value="3">Minggu 3</option>
                <option value="4">Minggu 4</option>
                <option value="5">Minggu 5</option>
              </select>
            </div>
          )}

          {/* Search bar inside Reports */}
          <div className="md:col-span-1">
            <label htmlFor="search_reports_input" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Cari Guru / Kelas / Kode</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="search_reports_input"
                type="text"
                placeholder="Kata kunci..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-50 pt-4">
          <button
            id="btn_download_csv"
            onClick={exportToCSV}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          
          <button
            id="btn_print_reports"
            onClick={() => window.print()}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak A4</span>
          </button>
        </div>

      </div>

      {/* Actual Printable Report Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Printable Report Header */}
        <div className="text-center space-y-2 border-b-2 border-slate-900 pb-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-sans uppercase">MADRASAH IBTIDAIYAH MUDM</h2>
          <h3 className="text-sm font-extrabold text-slate-700 tracking-wide font-mono">SISTEM PRESENSI DIGITAL REKAPITULASI KEHADIRAN GURU</h3>
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1" id="reportTitle">
            {getReportSubtitle()}
          </p>
        </div>

        {/* Core Stats Overview */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-4 print:bg-white print:border print:border-slate-300">
          <div className="text-center py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Total Mengajar</span>
            <strong className="text-xl font-extrabold text-slate-800 font-sans block mt-1">{stats.total}</strong>
          </div>
          <div className="text-center py-1 border-l border-slate-100 print:border-slate-300">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block font-mono">Hadir (Masuk)</span>
            <strong className="text-xl font-extrabold text-emerald-700 font-sans block mt-1">{stats.masuk}</strong>
          </div>
          <div className="text-center py-1 border-l border-slate-100 print:border-slate-300">
            <span className="text-[10px] font-bold text-amber-600 uppercase block font-mono">Izin</span>
            <strong className="text-xl font-extrabold text-amber-700 font-sans block mt-1">{stats.izin}</strong>
          </div>
          <div className="text-center py-1 border-l border-slate-100 print:border-slate-300">
            <span className="text-[10px] font-bold text-blue-600 uppercase block font-mono">Sakit</span>
            <strong className="text-xl font-extrabold text-blue-700 font-sans block mt-1">{stats.sakit}</strong>
          </div>
          <div className="text-center py-1 border-l border-slate-100 print:border-slate-300">
            <span className="text-[10px] font-bold text-rose-600 uppercase block font-mono">Alpa</span>
            <strong className="text-xl font-extrabold text-rose-700 font-sans block mt-1">{stats.alpa}</strong>
          </div>
        </div>

        {/* Display table depending on report type */}
        {reportType === 'harian' ? (
          /* Detailed logs */
          <div className="overflow-x-auto border border-slate-100 rounded-xl print:border-slate-300">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-600 font-bold print:bg-slate-100">
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Hari</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Sesi</th>
                  <th className="py-3 px-3">Jam Jadwal</th>
                  <th className="py-3 px-3">Mapel</th>
                  <th className="py-3 px-3">NIG</th>
                  <th className="py-3 px-3">Nama Guru</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Jam Masuk</th>
                  <th className="py-3 px-3">Jam Keluar</th>
                  <th className="py-3 px-3 text-right">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-300">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-10 text-center text-slate-400 font-medium">
                      Belum ada data laporan untuk kriteria ini.
                    </td>
                  </tr>
                ) : (
                  logs.map((x, i) => (
                    <tr key={i} className="hover:bg-slate-50/20">
                      <td className="py-3 px-3 font-mono">{x.tanggal}</td>
                      <td className="py-3 px-3 font-semibold">{x.hari}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 font-sans">{x.kelas}</td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded text-[9px] font-bold border border-teal-100 print:bg-white print:border-slate-400">{x.sesi}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{x.jam}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{x.mapel}</td>
                      <td className="py-3 px-3 font-mono">{teacherMap[x.kodeGuru]?.nig || '-'}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{x.namaGuru}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                          x.status === 'Masuk' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                          x.status === 'Izin' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                          x.status === 'Sakit' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                          x.status === 'Alpa' ? 'bg-rose-50 text-rose-700 border border-rose-150' : 'bg-slate-50 text-slate-400'
                        }`}>
                          {x.status === 'Masuk' ? 'Hadir' : x.status || 'Belum Hadir'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-teal-700 font-bold">{x.jamMasuk || '-'}</td>
                      <td className="py-3 px-3 font-mono text-blue-700 font-bold">{x.jamKeluar || '-'}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-400">MUDM</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Summarized (rekap) teacher logs */
          <div className="overflow-x-auto border border-slate-100 rounded-xl print:border-slate-300">
            <table className="w-full text-left border-collapse text-[11px] print:text-[10px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-600 font-bold print:bg-slate-100">
                  <th className="py-3 px-2 w-[40px] text-center">No</th>
                  <th className="py-3 px-2">NIG</th>
                  <th className="py-3 px-2 w-[50px] text-center">Kode</th>
                  <th className="py-3 px-2">Nama Guru</th>
                  <th className="py-3 px-2 text-center">Jadwal Mengajar</th>
                  <th className="py-3 px-2 text-center text-emerald-700">Masuk</th>
                  <th className="py-3 px-2 text-center text-amber-700">Izin</th>
                  <th className="py-3 px-2 text-center text-blue-700">Sakit</th>
                  <th className="py-3 px-2 text-center text-rose-700">Alpa</th>
                  <th className="py-3 px-2 text-slate-500">Tanggal Hadir (Masuk)</th>
                  <th className="py-3 px-2 text-slate-500">Tanggal Absen (Izin/Sakit/Alpa)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-300">
                {rekap.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-400 font-medium">
                      Belum ada data rekapitulasi untuk kriteria ini.
                    </td>
                  </tr>
                ) : (
                  rekap.map((x, idx) => {
                    const absenList = [
                      ...x.tanggalIzin.map(d => `${d} (Izin)`),
                      ...x.tanggalSakit.map(d => `${d} (Sakit)`),
                      ...x.tanggalAlpa.map(d => `${d} (Alpa)`)
                    ];

                    return (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        <td className="py-3 px-2 text-center font-mono">{idx + 1}</td>
                        <td className="py-3 px-2 font-mono">{x.nig || '-'}</td>
                        <td className="py-3 px-2 text-center font-bold">
                          <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] print:bg-white">{x.kode}</span>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-950 font-sans">{x.namaGuru}</td>
                        <td className="py-3 px-2 text-center font-bold">{x.totalMengajar}</td>
                        <td className="py-3 px-2 text-center text-emerald-700 font-black">{x.masuk}</td>
                        <td className="py-3 px-2 text-center text-amber-700 font-bold">{x.izin}</td>
                        <td className="py-3 px-2 text-center text-blue-700 font-bold">{x.sakit}</td>
                        <td className="py-3 px-2 text-center text-rose-700 font-bold">{x.alpa}</td>
                        <td className="py-3 px-2 font-mono text-[10px] text-slate-500 leading-relaxed max-w-[150px] truncate" title={x.tanggalMasuk.join(', ')}>
                          {x.tanggalMasuk.length > 0 ? (
                            <div className="max-h-[50px] overflow-y-auto font-mono text-[9px] text-emerald-700">
                              {x.tanggalMasuk.map((t, idx) => (
                                <div key={idx}>&bull; {t}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 font-mono text-[10px] text-slate-500 leading-relaxed">
                          {absenList.length > 0 ? (
                            <div className="max-h-[50px] overflow-y-auto font-mono text-[9px] text-amber-800">
                              {absenList.map((t, idx) => (
                                <div key={idx}>&bull; {t}</div>
                              ))}
                            </div>
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
        )}

        {/* Printable Report Footer Signatures */}
        <div className="grid grid-cols-2 pt-12 text-center text-xs font-semibold text-slate-700 z-10 relative">
          <div className="space-y-16">
            <p>Mengetahui,<br/>Kepala Madrasah Ibtidaiyah MUDM</p>
            <div>
              <p className="font-extrabold text-slate-900 underline">Ahmad Shofyan Yahya, M.Pd</p>
              <p className="text-[10px] text-slate-400 font-mono">NIG. 001496</p>
            </div>
          </div>
          <div className="space-y-16">
            <p>Malang, {new Date(selectedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Petugas Tata Usaha / Admin</p>
            <div>
              <p className="font-extrabold text-slate-900 underline">Administrator MUDM</p>
              <p className="text-[10px] text-slate-400 font-mono">ID: MUDM</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
