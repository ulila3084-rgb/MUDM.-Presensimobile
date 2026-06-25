export interface Teacher {
  nig: string;
  nama: string;
  kode: string;
}

export interface ScheduleItem {
  hari: string;
  kelas: string;
  sesi: string;
  mapel: string;
  kodeGuru: string;
}

export interface AttendanceRecord {
  id?: string;
  timestamp: string;
  tanggal: string; // YYYY-MM-DD
  pekan: number;
  bulan: number;
  tahun: number;
  hari: string;
  kelas: string;
  sesi: string;
  jam: string;
  mapel: string;
  kodeGuru: string;
  namaGuru: string;
  status: 'Masuk' | 'Izin' | 'Sakit' | 'Alpa' | 'Belum Hadir' | '';
  jamMasuk: string;
  jamKeluar: string;
  jenis: 'JADWAL' | 'PIKET';
}

export interface DayDataResult {
  info: {
    tanggal: string;
    hari: string;
    pekan: number;
    bulan: number;
    tahun: number;
  };
  mengajar: AttendanceRecord[];
  piket: AttendanceRecord[];
}

export interface DashboardData {
  info: DayDataResult['info'];
  mengajar: AttendanceRecord[];
  piket: AttendanceRecord[];
  total: number;
  sudah: number;
  belum: number;
  persen: number;
  presensi: AttendanceRecord[];
}
