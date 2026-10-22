# raff.co — Naufal Rafi

Portfolio statis satu halaman. CSS produksi dibangun dengan Tailwind CSS; browser tidak memuat Tailwind CDN atau framework JavaScript. Desain dan catatan ukuran ada di [DESIGN.md](DESIGN.md).

## Preview lokal

Jalankan dari direktori proyek:

```sh
python3 -m http.server 8000
```

Buka <http://localhost:8000>. Struktur utama: `index.html`, `style/syling.css`, `script/script.js`.

## Mengembangkan CSS dan menjalankan pemeriksaan

CSS hasil build sudah disimpan sehingga preview statis langsung berjalan. Untuk mengubahnya, gunakan Node.js 24:

```sh
npm ci
npm run dev
```

Edit **`style/input.css`**, yang berisi token empat warna, font lokal, komponen, dan utility Tailwind. Jangan mengedit `style/syling.css` secara langsung karena akan ditimpa saat build. Gunakan `npm run build` untuk CSS produksi minified dan `npm run check` untuk pemeriksaan sintaks JavaScript. Build juga memperbarui versi URL stylesheet di `index.html` berdasarkan hash CSS agar update tidak tertahan cache browser; commit HTML dan CSS hasil build bersama.

Tes regresi interaksi dan responsivitas menggunakan Playwright:

```sh
npx playwright install chromium
npm test
```

Jika Chromium sudah terpasang di `/usr/bin/chromium`, tes langsung memakainya. Lokasi browser lain dapat diberikan lewat `CHROMIUM_PATH`. Tes mencakup toggle ulang ikon dan resume tools setelah Enter/touch, hold/drag/release CTA, bingkai utuh, satu viewport per section, filter, layout dengan teks 200%, opening cinematic hero beserta reduced motion, dan preview hero. Server tes dijalankan otomatis dengan Python 3.

## Preview animasi hero

Buka [preview hero](preview/hero.html) melalui server lokal, atau <https://hanazaishanz.github.io/portfolio/preview/hero.html>. Opening mengikuti ide pemilik: judul tampil di tengah, berpindah ke posisi desain, lalu foto dan elemen pendukung muncul berurutan. Durasi sekitar 2,6 detik; tombol putar ulang menjalankan kembali animasi produksi yang sama. Scroll, interaksi, dan perubahan ukuran layar menyelesaikan intro langsung. Reduced motion menampilkan hero statis.

Semua section utama mengisi ruang layar di bawah navbar. Grid proyek memenuhi lebar konten dan tinggi sisa setelah heading/filter; viewport pendek atau teks diperbesar boleh memanjangkan section agar tetap terbaca. Scrollbar disembunyikan tanpa menonaktifkan scrolling. CTA tetap bergerak setelah hold/drag dilepas; ikon tools aktif bisa ditutup dengan klik ulang atau otomatis setelah empat detik.

## Mengganti konten

- **Kontak dan ikon CTA/footer:** edit objek `contacts` di awal `script/script.js`. Ubah `href`, `label`, `name`, atau `icon`. Ikon sendiri bisa menggantikan file di `assets/social/` secara langsung. HTML menyediakan fallback tanpa JavaScript; samakan URL di HTML bila fallback juga ingin diubah.
- **Logo navbar:** ganti `assets/logo.svg` dengan logo sendiri; pertahankan proporsinya.
- **Recent Projects:** ganti gambar, `alt`, caption, dan kategori pada `.project-card` di HTML. Hapus class `project-image-1` sampai `project-image-6` jika menggunakan gambar tunggal; pertahankan `project-image`.
- **Preview CTA:** otomatis memakai proyek. Untuk sertifikasi, isi template `contact-custom-previews` di HTML dan pilih `data-preview-source="custom"` atau `"mixed"`.
- **Tools:** edit daftar `.tool-group` di HTML. Salinan animasinya dibuat otomatis.

Preview proyek dan sebagian logo merupakan aset sementara yang dapat diganti pemilik. Foto kamera untuk Work Experience serta file font asli SCRIPT1 Script Casual belum tersedia; lettering tersebut masih menggunakan fallback. Ketentuan lengkap ada di DESIGN.md.

## GitHub Pages

Workflow `.github/workflows/pages.yml` memasang dependency terkunci dengan `npm ci`, memeriksa sintaks, membangun CSS Tailwind, lalu memublikasikan situs dan preview hero dari `main` menggunakan Actions resmi GitHub. Dependency Node, tes, dokumentasi, dan file Git tidak ikut diunggah sebagai artefak situs.

Jika Pages belum aktif, buka **Settings → Pages → Build and deployment → Source → GitHub Actions**, lalu jalankan **Actions → Deploy portfolio to GitHub Pages → Run workflow**. Push perubahan situs ke `main` akan memicu deployment berikutnya.

URL standar setelah deployment berhasil: <https://hanazaishanz.github.io/portfolio/>. Status deployment bisa dilihat di tab Actions; keberadaan workflow tidak berarti deployment sudah berhasil.
