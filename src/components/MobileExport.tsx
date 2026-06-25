import React, { useState } from 'react';
import { 
  Smartphone, 
  Apple, 
  ChevronRight, 
  Check, 
  Download, 
  Terminal, 
  Sparkles, 
  Layers, 
  Info, 
  Code2, 
  ArrowRight,
  Monitor
} from 'lucide-react';

export default function MobileExport() {
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>('android');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const codeCapacitorInit = `{
  "appId": "com.mudm.presensiguru",
  "appName": "Presensi MUDM",
  "webDir": "dist"
}`;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 opacity-10">
          <Smartphone className="w-80 h-80 rotate-12" />
        </div>
        
        <div className="max-w-2xl relative z-10 space-y-2">
          <span className="px-2.5 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-[10px] font-black uppercase tracking-wider text-teal-300">
            Multiplatform Build Ready
          </span>
          <h2 className="text-xl md:text-2xl font-black font-sans tracking-tight">
            Ubah Presensi MUDM Menjadi Aplikasi Android & iOS!
          </h2>
          <p className="text-xs text-teal-150/80 leading-relaxed">
            Aplikasi presensi ini dirancang dengan standar modern agar dapat dibungkus secara instan menjadi aplikasi native Android (.APK) dan iOS (.IPA) menggunakan <strong>CapacitorJS</strong> atau diinstal langsung sebagai <strong>PWA (Progressive Web App)</strong>.
          </p>
        </div>
      </div>

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step-by-Step Wrapper Guide */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Option Selector: PWA vs Capacitor */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                <Layers className="w-5 h-5" />
              </span>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Metode 1: Bungkus Native App (CapacitorJS)
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Capacitor</strong> adalah runtime resmi dari Ionic yang dapat mengemas aplikasi React/Vite ini ke dalam wadah native webview berkinerja tinggi, memberikan akses penuh ke kamera, sidik jari, dan siap dipublikasikan ke Google Play Store & Apple App Store.
            </p>

            {/* Platform Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActivePlatform('android')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activePlatform === 'android' 
                    ? 'bg-teal-700 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Panduan Android (.APK)</span>
              </button>
              
              <button
                onClick={() => setActivePlatform('ios')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activePlatform === 'ios' 
                    ? 'bg-teal-700 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>Panduan Apple iOS (.IPA)</span>
              </button>
            </div>

            {/* Terminal Commands Guide */}
            <div className="space-y-4 pt-1">
              
              {/* Step 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">1</span>
                  <h4 className="text-xs font-bold text-slate-700">Install Capacitor di Proyek Anda</h4>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Jalankan perintah ini di terminal komputer lokal Anda di dalam folder proyek presensi ini:
                </p>
                <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                  <code>npm install @capacitor/core @capacitor/cli</code>
                  <button
                    onClick={() => copyToClipboard('npm install @capacitor/core @capacitor/cli', 'cmd1')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                  >
                    {copiedCmd === 'cmd1' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">2</span>
                  <h4 className="text-xs font-bold text-slate-700">Inisialisasi Konfigurasi</h4>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Jalankan perintah inisialisasi untuk mendefinisikan ID Aplikasi dan nama:
                </p>
                <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                  <code>npx cap init "Presensi MUDM" "com.mudm.presensiguru" --web-dir=dist</code>
                  <button
                    onClick={() => copyToClipboard('npx cap init "Presensi MUDM" "com.mudm.presensiguru" --web-dir=dist', 'cmd2')}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                  >
                    {copiedCmd === 'cmd2' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                  </button>
                </div>
                <p className="text-[10px] text-amber-600 pl-7 font-medium">
                  *Catatan: Pastikan <code>capacitor.config.json</code> mengarah ke folder build target yaitu <code>dist</code>.
                </p>
              </div>

              {/* Step 3 (Platform Specific) */}
              {activePlatform === 'android' ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">3</span>
                      <h4 className="text-xs font-bold text-slate-700">Tambahkan Platform Android & Build</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7">
                      Instal paket Android dan buat folder kode native Android:
                    </p>
                    <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                      <code>npm install @capacitor/android && npx cap add android</code>
                      <button
                        onClick={() => copyToClipboard('npm install @capacitor/android && npx cap add android', 'cmd3a')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        {copiedCmd === 'cmd3a' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">4</span>
                      <h4 className="text-xs font-bold text-slate-700">Sinkronkan Kode Web ke Android Studio</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7">
                      Setiap kali Anda mengubah kode React, jalankan build dan sinkronkan ke proyek Android:
                    </p>
                    <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                      <code>npm run build && npx cap sync android</code>
                      <button
                        onClick={() => copyToClipboard('npm run build && npx cap sync android', 'cmd4a')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        {copiedCmd === 'cmd4a' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">5</span>
                      <h4 className="text-xs font-bold text-slate-700">Kompilasi Menjadi File APK asli</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7 text-justify">
                      Buka proyek Android di aplikasi <strong>Android Studio</strong> menggunakan perintah di bawah. Di Android Studio, klik menu <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK</strong>. File <code>app-debug.apk</code> siap diinstal langsung ke HP guru-guru Anda!
                    </p>
                    <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                      <code>npx cap open android</code>
                      <button
                        onClick={() => copyToClipboard('npx cap open android', 'cmd5a')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        {copiedCmd === 'cmd5a' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">3</span>
                      <h4 className="text-xs font-bold text-slate-700">Tambahkan Platform Apple iOS</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7">
                      Instal paket iOS dan buat folder kode native Xcode (memerlukan laptop macOS):
                    </p>
                    <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                      <code>npm install @capacitor/ios && npx cap add ios</code>
                      <button
                        onClick={() => copyToClipboard('npm install @capacitor/ios && npx cap add ios', 'cmd3i')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        {copiedCmd === 'cmd3i' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">4</span>
                      <h4 className="text-xs font-bold text-slate-700">Sinkronkan & Compile Xcode</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7">
                      Jalankan kompilasi aset web dan transfer ke folder Xcode:
                    </p>
                    <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                      <code>npm run build && npx cap sync ios</code>
                      <button
                        onClick={() => copyToClipboard('npm run build && npx cap sync ios', 'cmd4i')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        {copiedCmd === 'cmd4i' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black flex items-center justify-center border border-teal-100">5</span>
                      <h4 className="text-xs font-bold text-slate-700">Jalankan Simulator iOS / Daftarkan ke HP</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7 text-justify">
                      Buka Xcode untuk menguji pada simulator iPhone asli atau mendaftarkan sertifikat developer Apple Anda untuk diinstal ke HP iPhone target:
                    </p>
                    <div className="ml-7 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] relative flex justify-between items-center group">
                      <code>npx cap open ios</code>
                      <button
                        onClick={() => copyToClipboard('npx cap open ios', 'cmd5i')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        {copiedCmd === 'cmd5i' ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tersalin</span> : 'Salin'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Option 2: Install as PWA Directly */}
        <div className="space-y-6">
          
          {/* GitHub Actions Auto Build (NEWLY ADDED) */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl border border-indigo-700/30 p-5 shadow-sm text-white space-y-4">
            <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-3">
              <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg animate-pulse">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-200">
                Otomatisasi GitHub Actions (APK)
              </h3>
            </div>

            <p className="text-xs text-indigo-100/90 leading-relaxed text-justify">
              <strong>Kabar Gembira!</strong> Kami telah mengonfigurasi formula build otomatis Android langsung di dalam proyek ini menggunakan <strong>GitHub Actions</strong> (<code>.github/workflows/android.yml</code>) dan <strong>CapacitorJS</strong>.
            </p>

            <div className="bg-indigo-950/50 p-3 rounded-xl border border-indigo-500/20 space-y-2">
              <div className="text-[11px] font-black text-indigo-300 flex items-center gap-1.5">
                <span>⚠️ Mengapa Sebelumnya Gagal / "Tidak Ada File"?</span>
              </div>
              <p className="text-[10px] text-indigo-200/80 leading-relaxed">
                Sebelumnya, repositori GitHub Anda belum memiliki file codingan lengkap dan belum terpasang konfigurasi build Android (Capacitor). Sekarang semua file sudah lengkap dan siap!
              </p>
            </div>

            <div className="space-y-2.5 pt-1 text-[11px]">
              <div className="flex gap-2">
                <span className="text-indigo-300 font-bold">1.</span>
                <p className="text-indigo-100/80">Cukup <strong>Export ke GitHub</strong> melalui menu pengaturan AI Studio Anda.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-300 font-bold">2.</span>
                <p className="text-indigo-100/80">GitHub akan mendeteksi file workflow otomatis kita dan mulai merakit APK.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-300 font-bold">3.</span>
                <p className="text-indigo-100/80">Masuk ke tab <strong>"Actions"</strong> di GitHub Anda, klik build yang berjalan, dan unduh file <strong>Presensi-MUDM-Android-APK</strong> setelah selesai!</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Metode 2: Instalasi PWA (Tanpa Playstore)
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed text-justify">
              Anda tidak perlu mendaftar akun Developer berbayar di Google atau Apple! Aplikasi ini telah dilengkapi dengan <strong>Web App Manifest</strong> resmi. 
            </p>

            <div className="space-y-4 pt-1">
              {/* Android PWA */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Cara Pasang di Android</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-500 space-y-1 leading-relaxed pl-0.5">
                  <li>Buka link aplikasi ini di <strong>Google Chrome</strong> HP Android Anda.</li>
                  <li>Ketuk tombol menu <strong>tiga titik (⋮)</strong> di kanan atas Chrome.</li>
                  <li>Pilih opsi <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong>.</li>
                  <li>Aplikasi akan muncul di laci aplikasi HP Anda!</li>
                </ol>
              </div>

              {/* iOS PWA */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                  <Apple className="w-4 h-4 text-slate-800" />
                  <span>Cara Pasang di iPhone/iPad</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-500 space-y-1 leading-relaxed pl-0.5">
                  <li>Buka link aplikasi ini di browser <strong>Safari</strong> iPhone Anda.</li>
                  <li>Ketuk tombol <strong>Share / Bagikan (kotak dengan anak panah ke atas)</strong> di bawah layar Safari.</li>
                  <li>Gulir ke bawah dan ketuk opsi <strong>"Add to Home Screen / Tambah ke Layar Utama"</strong>.</li>
                  <li>Buka langsung tanpa border bar browser!</li>
                </ol>
              </div>
            </div>

          </div>

          {/* Core Configuration Specs */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Code2 className="w-4.5 h-4.5 text-teal-700" />
              File Manifest Terpasang
            </h4>
            <p className="text-[11px] text-slate-400">
              Sistem telah mendistribusikan konfigurasi <code>manifest.json</code> dengan properti <code>standalone</code> untuk menghilangkan alamat bar browser sehingga terasa 100% seperti aplikasi native asli.
            </p>
            <div className="bg-slate-900 text-slate-300 p-3.5 rounded-xl font-mono text-[10px] overflow-x-auto leading-relaxed">
              <pre>{JSON.stringify({
                short_name: "Presensi MUDM",
                display: "standalone",
                orientation: "portrait",
                theme_color: "#0d9488",
                background_color: "#0f172a"
              }, null, 2)}</pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
