import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Grid, 
  CalendarDays, 
  GraduationCap, 
  AlertCircle,
  FolderEdit,
  Save
} from 'lucide-react';
import { Teacher, ScheduleItem } from '../types';
import { DAYS_LIST, CLASSES_LIST, TIMES } from '../data';

interface MasterDataProps {
  teachers: Teacher[];
  schedule: Record<string, Record<string, [string, string, string][]>>;
  onUpdateTeachers: (teachers: Teacher[]) => void;
  onUpdateSchedule: (schedule: Record<string, Record<string, [string, string, string][]>>) => void;
}

export default function MasterData({
  teachers,
  schedule,
  onUpdateTeachers,
  onUpdateSchedule
}: MasterDataProps) {
  const [activeSubTab, setActiveSubTab] = useState<'teachers' | 'schedule'>('teachers');
  
  // Teachers state
  const [editingTeacherCode, setEditingTeacherCode] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNig, setEditNig] = useState('');
  
  const [newNig, setNewNig] = useState('');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Schedule Editor state
  const [selectedSchDay, setSelectedSchDay] = useState('SABTU');
  const [selectedSchClass, setSelectedSchClass] = useState('II');
  
  // New Slot Assignment state
  const [newSlotSesi, setNewSlotSesi] = useState('1-2');
  const [newSlotMapel, setNewSlotMapel] = useState('');
  const [newSlotTeacherCode, setNewSlotTeacherCode] = useState('');
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // TEACHER CRUD ACTIONS
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);

    const code = newCode.trim().toUpperCase();
    const name = newName.trim();
    const nig = newNig.trim();

    if (!code || !name || !nig) {
      setTeacherError('Semua kolom data guru wajib diisi!');
      return;
    }

    // Validation: Code must be unique
    if (teachers.some(t => t.kode === code)) {
      setTeacherError(`Kode Guru '${code}' sudah digunakan!`);
      return;
    }

    // Validation: NIG must be unique
    if (teachers.some(t => t.nig === nig)) {
      setTeacherError(`NIG '${nig}' sudah terdaftar!`);
      return;
    }

    const updated = [...teachers, { kode: code, nama: name, nig }];
    onUpdateTeachers(updated);

    // Reset Form
    setNewCode('');
    setNewName('');
    setNewNig('');
  };

  const handleDeleteTeacher = (code: string, name: string) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus Guru '${name}' (${code})? Semua jadwal terkait guru ini akan tetap ada namun kodenya tidak terdaftar.`);
    if (!confirmed) return;

    const updated = teachers.filter(t => t.kode !== code);
    onUpdateTeachers(updated);
  };

  const startEditTeacher = (t: Teacher) => {
    setEditingTeacherCode(t.kode);
    setEditName(t.nama);
    setEditNig(t.nig);
  };

  const handleSaveEditTeacher = (code: string) => {
    if (!editName.trim() || !editNig.trim()) {
      alert('Nama dan NIG guru tidak boleh kosong!');
      return;
    }

    const updated = teachers.map(t => {
      if (t.kode === code) {
        return { ...t, nama: editName.trim(), nig: editNig.trim() };
      }
      return t;
    });

    onUpdateTeachers(updated);
    setEditingTeacherCode(null);
  };

  // SCHEDULE CRUD ACTIONS
  const handleAddScheduleSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);

    const mapel = newSlotMapel.trim();
    const code = newSlotTeacherCode;

    if (!mapel || !code) {
      setScheduleError('Nama Mata Pelajaran dan Guru harus diisi!');
      return;
    }

    // Load active schedules deep copy
    const scheduleCopy = JSON.parse(JSON.stringify(schedule)) as Record<string, Record<string, [string, string, string][]>>;
    
    if (!scheduleCopy[selectedSchDay]) {
      scheduleCopy[selectedSchDay] = {};
    }
    if (!scheduleCopy[selectedSchDay][selectedSchClass]) {
      scheduleCopy[selectedSchDay][selectedSchClass] = [];
    }

    const dayClassSlots = scheduleCopy[selectedSchDay][selectedSchClass];

    // Validation: Check if session is already scheduled for this class on this day
    if (dayClassSlots.some(slot => slot[0] === newSlotSesi)) {
      setScheduleError(`Sesi ${newSlotSesi} sudah terdaftar untuk Kelas ${selectedSchClass} pada hari ${selectedSchDay}! Silakan hapus sesi lama terlebih dahulu.`);
      return;
    }

    // Add slot
    dayClassSlots.push([newSlotSesi, mapel, code]);
    
    // Sort slots by session (1-2, 3-4, 5-6)
    dayClassSlots.sort((a, b) => a[0].localeCompare(b[0]));

    onUpdateSchedule(scheduleCopy);
    setNewSlotMapel('');
  };

  const handleDeleteScheduleSlot = (sesi: string) => {
    const confirmed = window.confirm(`Hapus jadwal Sesi ${sesi} untuk Kelas ${selectedSchClass} pada hari ${selectedSchDay}?`);
    if (!confirmed) return;

    const scheduleCopy = JSON.parse(JSON.stringify(schedule)) as Record<string, Record<string, [string, string, string][]>>;
    
    if (scheduleCopy[selectedSchDay]?.[selectedSchClass]) {
      scheduleCopy[selectedSchDay][selectedSchClass] = scheduleCopy[selectedSchDay][selectedSchClass].filter(
        slot => slot[0] !== sesi
      );
      onUpdateSchedule(scheduleCopy);
    }
  };

  // Get current active slots displayed in matrix view
  const currentSlots = schedule[selectedSchDay]?.[selectedSchClass] || [];

  return (
    <div className="space-y-6">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-150">
        <button
          onClick={() => setActiveSubTab('teachers')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'teachers' 
              ? 'border-teal-700 text-teal-850 bg-teal-50/10' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Kelola Master Data Guru ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'schedule' 
              ? 'border-teal-700 text-teal-850 bg-teal-50/10' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FolderEdit className="w-4 h-4" />
          <span>Edit Jadwal Mengajar</span>
        </button>
      </div>

      {/* MASTER DAFTAR GURU SECTION */}
      {activeSubTab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Add Teacher Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 self-start">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-700" />
              Tambah Guru Baru
            </h3>
            
            {teacherError && (
              <div className="bg-rose-50 text-rose-700 border border-rose-100 p-3 rounded-lg text-xs flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{teacherError}</span>
              </div>
            )}

            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label htmlFor="new_nig" className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">NIG (Nomor Induk Guru)</label>
                <input
                  id="new_nig"
                  type="text"
                  required
                  placeholder="Contoh: 196100xxxx"
                  value={newNig}
                  onChange={(e) => setNewNig(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label htmlFor="new_name" className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Nama Lengkap Guru</label>
                <input
                  id="new_name"
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label htmlFor="new_code" className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Kode Inisial Unik (1 Huruf)</label>
                <input
                  id="new_code"
                  type="text"
                  required
                  maxLength={2} // Allows 1 or 2 characters max
                  placeholder="Contoh: A, B, C, Z"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 uppercase focus:outline-none focus:border-teal-600"
                />
              </div>

              <button
                id="btn_add_teacher_submit"
                type="submit"
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan Master Guru</span>
              </button>
            </form>
          </div>

          {/* Teacher List Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Master Database Guru Madrasah</h3>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">{teachers.length} Terdaftar</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-3 px-4 w-[60px] text-center">No</th>
                    <th className="py-3 px-4 w-[140px]">NIG</th>
                    <th className="py-3 px-4 w-[100px] text-center">Kode Inisial</th>
                    <th className="py-3 px-4">Nama Lengkap Guru</th>
                    <th className="py-3 px-4 text-right">Opsi Operasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {teachers.map((x, idx) => {
                    const isEditing = editingTeacherCode === x.kode;

                    return (
                      <tr key={x.kode} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editNig}
                              onChange={(e) => setEditNig(e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded text-xs w-full focus:outline-none"
                            />
                          ) : (
                            <span className="font-mono text-slate-500 font-bold">{x.nig}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 bg-teal-50 border border-teal-150 rounded text-[10px] font-black text-teal-800">
                            {x.kode}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 border border-slate-300 rounded text-xs w-full focus:outline-none"
                            />
                          ) : (
                            <span className="text-slate-900 font-bold">{x.nama}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEditTeacher(x.kode)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                  title="Simpan"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingTeacherCode(null)}
                                  className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Batal"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditTeacher(x)}
                                  className="p-1 text-slate-400 hover:text-teal-700 hover:bg-slate-50 rounded cursor-pointer"
                                  title="Ubah"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeacher(x.kode, x.nama)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* EDIT SCHEDULE MATRIX SECTION */}
      {activeSubTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Matrix Parameters Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 self-start">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-teal-700" />
              Pilih Target Jadwal
            </h3>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="master_day_select" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pilih Hari</label>
                <select
                  id="master_day_select"
                  value={selectedSchDay}
                  onChange={(e) => setSelectedSchDay(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  {DAYS_LIST.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="master_class_select" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pilih Kelas</label>
                <select
                  id="master_class_select"
                  value={selectedSchClass}
                  onChange={(e) => setSelectedSchClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-teal-600 cursor-pointer"
                >
                  {CLASSES_LIST.map(c => (
                    <option key={c} value={c}>Kelas {c}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Form to append new session slot */}
            <form onSubmit={handleAddScheduleSlot} className="space-y-4 pt-1">
              <h4 className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">Tambah/Ganti Slot Mengajar</h4>
              
              {scheduleError && (
                <div className="bg-rose-50 text-rose-700 border border-rose-100 p-2.5 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{scheduleError}</span>
                </div>
              )}

              <div>
                <label htmlFor="new_slot_session_select" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sesi Kegiatan</label>
                <select
                  id="new_slot_session_select"
                  value={newSlotSesi}
                  onChange={(e) => setNewSlotSesi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="1-2">Sesi 1-2 (13.00 - 14.00 WIB)</option>
                  <option value="3-4">Sesi 3-4 (14.00 - 15.00 WIB)</option>
                  <option value="5-6">Sesi 5-6 (15.00 - 16.00 WIB)</option>
                </select>
              </div>

              <div>
                <label htmlFor="new_slot_subject_input" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mata Pelajaran</label>
                <input
                  id="new_slot_subject_input"
                  type="text"
                  required
                  placeholder="Contoh: Fiqih, Tajwid, Nahwu"
                  value={newSlotMapel}
                  onChange={(e) => setNewSlotMapel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label htmlFor="new_slot_teacher_select" className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Guru Pengajar</label>
                <select
                  id="new_slot_teacher_select"
                  value={newSlotTeacherCode}
                  onChange={(e) => setNewSlotTeacherCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => (
                    <option key={t.kode} value={t.kode}>[{t.kode}] {t.nama}</option>
                  ))}
                </select>
              </div>

              <button
                id="btn_add_slot_submit"
                type="submit"
                className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Jadwal Slot</span>
              </button>
            </form>
          </div>

          {/* Active Slots list matrix table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                Daftar Slot Mengajar Hari {selectedSchDay} &bull; Kelas {selectedSchClass}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-3.5 px-4 w-[110px]">Sesi Sesi</th>
                    <th className="py-3.5 px-4">Jam Kegiatan</th>
                    <th className="py-3.5 px-4">Mata Pelajaran</th>
                    <th className="py-3.5 px-4">Guru Pengajar</th>
                    <th className="py-3.5 px-4 text-right">Opsi Operasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {currentSlots.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                        Tidak ada slot mengajar untuk Kelas {selectedSchClass} pada hari {selectedSchDay}.
                      </td>
                    </tr>
                  ) : (
                    currentSlots.map(([sesi, mapel, kodeGuru], i) => {
                      const teacherName = teachers.find(t => t.kode === kodeGuru)?.nama || `Kode: ${kodeGuru} (Tidak Terdaftar)`;

                      return (
                        <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-[10px] font-bold text-teal-700 rounded">
                              Sesi {sesi}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-400 font-medium">
                            {TIMES[sesi] || '-'}
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800">
                            {mapel}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                                {kodeGuru}
                              </span>
                              <span className="font-semibold text-slate-700">{teacherName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleDeleteScheduleSlot(sesi)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Hapus Sesi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      )}

    </div>
  );
}
