import { Teacher, ScheduleItem } from './types';

export const INITIAL_TEACHERS: Teacher[] = [
  { nig: '1961003197', nama: 'Abdul Rozak', kode: 'C' },
  { nig: '1961003174', nama: 'Amin Saputra', kode: 'D' },
  { nig: '1961009421', nama: 'Muhammad Lukito Bawawi', kode: 'E' },
  { nig: '1961005371', nama: 'Muhammad Shohib', kode: 'F' },
  { nig: '1961003182', nama: 'Roni Sianturi', kode: 'G' },
  { nig: '1961009422', nama: 'Sohebi Maulana Rijal', kode: 'H' },
  { nig: '1961009523', nama: 'Afdila Nurus Sobah', kode: 'I' },
  { nig: '1961009522', nama: 'Anisatul Awaliya', kode: 'J' },
  { nig: '001496', nama: 'Ahmad Shofyan Yahya', kode: 'K' },
  { nig: '001497', nama: 'Mahrus Sholeh', kode: 'L' },
  { nig: '001498', nama: 'Alfatoni Al Farisi', kode: 'M' },
  { nig: '1961004570', nama: 'M Riski Hidayat', kode: 'N' },
  { nig: '1961003187', nama: 'Ahmad Hamdani', kode: 'O' },
  { nig: '1961008364', nama: 'Ahmad Yasir', kode: 'P' },
  { nig: '1961006779', nama: 'Muhyidin', kode: 'Q' },
  { nig: '1961004567', nama: 'Nur M Abd Hamid', kode: 'R' },
  { nig: '1961007101', nama: 'Wildatus Sholihah', kode: 'S' },
  { nig: '1961009524', nama: 'Ita Purnama Sari', kode: 'T' },
  { nig: '1961009525', nama: 'Kamila Regina Putri', kode: 'U' }
];

export const TIMES: Record<string, string> = {
  '1-2': '13.00 - 14.00 WIB',
  '3-4': '14.00 - 15.00 WIB',
  '5-6': '15.00 - 16.00 WIB',
  'PIKET': 'Guru Bantu'
};

export const INITIAL_SCHEDULE: Record<string, Record<string, [string, string, string][]>> = {
  'SABTU': {
    'II': [['1-2','Fiqih','S'],['3-4','Fiqih','S'],['5-6','MQS','O']],
    'III': [['1-2','Tajwid','F'],['3-4','Tahsin','U'],['5-6','Shorrof','L']],
    'IV': [['1-2','Fiqih','J'],['3-4','Nahwu','I'],['5-6','Imlak','T']],
    'V': [['1-2','Tauhid','D'],['3-4','Shorrof','E'],['5-6','Tarikh','R']],
    'VI': [['1-2','Balagoh','E'],['3-4','Faroid','K'],['5-6','Baca Kitab','C']]
  },
  'AHAD': {
    'II': [['1-2','Fiqih','S'],['3-4','Fiqih','S'],['5-6','MQS','O']],
    'III': [['1-2','Fiqih','U'],['3-4','MQS','O'],['5-6','Baca Kitab','U']],
    'IV': [['1-2','Al-Miftah','G'],['3-4','Tajwid','F'],['5-6','Al-Miftah','G']],
    'V': [['1-2','Fiqih','J'],['3-4','Akhlaq','H'],['5-6','Imlak','T']],
    'VI': [['1-2','Akhlaq','L'],['3-4','Imlak','T'],['5-6','Nadzom','H']]
  },
  'SENIN': {
    'II': [['1-2','Tauhid','S'],['3-4','Tauhid','S'],['5-6','Tajwid','U']],
    'III': [['1-2','Tarikh','M'],['3-4','Shorrof','L'],['5-6','Akhlaq','M']],
    'IV': [['1-2','Fiqih','J'],['3-4','Nahwu','I'],['5-6','Tarikh','R']],
    'V': [['1-2','Nahwu','I'],['3-4','Tarikh','R'],['5-6','Fiqih','J']],
    'VI': [['1-2','Nahwu','E'],['3-4','Tarikh','K'],['5-6','Akhlaq','L']]
  },
  'SELASA': {
    'II': [['1-2','Tarikh','J'],['3-4','Tarikh','J'],['5-6','Bhs Arab','T']],
    'III': [['1-2','I’lal','G'],['3-4','Imlak','S'],['5-6','Shorrof','L']],
    'IV': [['1-2','Tamrin Fiqih','J'],['3-4','Nahwu','I'],['5-6','Akhlaq','H']],
    'V': [['1-2','Tauhid','D'],['3-4','Tafsir','L'],['5-6','Al-Quran','N']],
    'VI': [['1-2','Tauhid','K'],['3-4','Al-Quran','N'],['5-6','Hadits','P']]
  },
  'RABU': {
    'II': [['1-2','Tauhid','S'],['3-4','Tauhid','S'],['5-6','Imlak','T']],
    'III': [['1-2','Fiqih','U'],['3-4','I’lal','G'],['5-6','MQS','O']],
    'IV': [['1-2','Al-Miftah','G'],['3-4','Al-Quran','N'],['5-6','Nadzom','G']],
    'V': [['1-2','Baca Kitab','R'],['3-4','Tafsir','L'],['5-6','Nahwu','I']],
    'VI': [['1-2','Tafsir','L'],['3-4','Nahwu','E'],['5-6','Tafsir','L']]
  },
  'KAMIS': {
    'II': [['1-2','Akhlaq','J'],['3-4','Akhlaq','J'],['5-6','Tahsin','U']],
    'III': [['1-2','Tauhid','Q'],['3-4','M. Shorrof','T'],['5-6','Tauhid','Q']],
    'IV': [['1-2','Akhlaq','H'],['3-4','Tauhid','Q'],['5-6','Baca Kitab','J']],
    'V': [['1-2','Fiqih','J'],['3-4','Akhlaq','H'],['5-6','Nadzom','E']],
    'VI': [['1-2','Fiqih','C'],['3-4','Tauhid','K'],['5-6','Fiqih','C']]
  }
};

export const DAYS_LIST = ['SABTU', 'AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS'];
export const CLASSES_LIST = ['II', 'III', 'IV', 'V', 'VI'];
