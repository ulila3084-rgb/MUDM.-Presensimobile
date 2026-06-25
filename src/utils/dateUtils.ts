export const getIndonesianDayName = (dayIndex: number): string => {
  const days = ['AHAD', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
  return days[dayIndex];
};

export const getWeekNumber = (d: Date): number => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and calculate number of weeks from there.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export const getTodayInfo = (dateStr?: string) => {
  // Use Asia/Jakarta time or local browser time (which is aligned in Indonesian schools)
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date();
  
  const formatterTanggal = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
  
  // Try to use Asia/Jakarta timezone, fallback if not supported
  let formattedDate = '';
  try {
    formattedDate = formatterTanggal.format(d);
  } catch (e) {
    // Fallback
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    formattedDate = `${y}-${m}-${day}`;
  }

  const dayIndex = d.getDay();
  const hariIndo = getIndonesianDayName(dayIndex);
  
  return {
    tanggal: formattedDate,
    hari: hariIndo,
    pekan: getWeekNumber(d),
    bulan: d.getMonth() + 1,
    tahun: d.getFullYear()
  };
};

export const formatMasehi = (dateStr: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T12:00:00');
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(d);
};

export const formatHijri = (dateStr: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T12:00:00');
  try {
    return new Intl.DateTimeFormat('id-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch (e) {
    try {
      return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    } catch (err) {
      // Manual rough estimation or basic fallback
      return '1 Muharram 1448 H (Simulasi)';
    }
  }
};
