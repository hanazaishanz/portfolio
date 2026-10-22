# Acuan desain raff.co

Instruksi ini berasal dari pemilik desain dan berlaku untuk pengembangan website ini berikutnya.

## Revisi responsivitas dan animasi

Permintaan terbaru pemilik memperbarui ukuran tetap pada implementasi awal:

- Hero, Services, Recent Projects, Tools, dan Work Experience mengisi **satu tinggi viewport setelah navbar**. Kartu dihitung dari **lebar dan tinggi layar**; kanvas referensi 800 px tidak menjadi tinggi tetap. CTA juga mengisi satu layar; footer mempertahankan proporsi desainnya. Pada layar sangat pendek atau pembesaran teks, section boleh memanjang agar konten tetap terbaca tanpa dipotong.
- Grid Recent Projects: tiga kolom × dua baris di tablet/desktop, dua kolom × tiga baris di HP. Grid memenuhi lebar konten, tanpa batas lebar berdasarkan rasio portrait kartu. Tingginya dihitung dari tinggi viewport aktual dikurangi navbar, padding, heading, filter, dan gap; gambar di dalam bingkai tetap utuh. Tinggi dan lebar kartu mengikuti ruang yang tersedia; perubahan filter mempertahankan posisi heading dan ruang grid.
- Work Experience dipusatkan horizontal dan vertikal. Pada HP, heading di atas, lalu timeline dan foto berdampingan agar tetap muat dalam satu section.
- Hilangkan shadow bawah hero dan inset shadow Services yang membuat bidang merah di sudut terlihat dibatasi kotak. Warna body tetap merah utama.
- Tools bisa ditutup langsung dengan **klik ulang ikon yang sedang aktif**, atau kembali merah dan berjalan lagi **4000 ms setelah aktivasi**, termasuk ketika tombol asli masih fokus setelah klik, touch, atau Enter. Fokus keyboard ketika menjelajah tetap bisa menghentikan sementara; fokus yang tertinggal setelah aktivasi tidak mengunci autoplay.
- CTA berhenti **selama ditahan/digeser**, lalu langsung lanjut saat pointer dilepas, dibatalkan, atau capture berakhir. Hover dan fokus yang tertinggal tidak menghentikan autoplay. Panah keyboard berhenti selama ditekan dan lanjut saat dilepas; Space/tombol pause tetap memberikan jeda manual.
- CTA memakai 12 slot di desktop/tablet dan 6 di HP. Radius lengkung dihitung dari proyeksi seluruh busur depan agar kartu memenuhi lebar scene tanpa bingkai terpotong. Preview langsung tersedia; animasi default 18 derajat/detik. Slot didaur ulang saat di belakang agar semua proyek/sertifikasi kustom ikut tampil. Artwork sprite tetap persegi dan gambar kustom memakai `object-fit: contain` agar tampil utuh.
- Animasi body lebih playful: entrance bertahap, tilt kecil mengikuti pointer pada kartu, pop saat mengganti filter, dan bounce ikon services/tools. Hormati reduced motion; tidak ada gerakan pointer pada perangkat touch.
- **Revisi terbaru pemilik mengganti parallax dengan opening cinematic berdasarkan idenya:** judul “BETTER CALL Rafi” tampil di tengah viewport, bertahan singkat, lalu berpindah ke posisi asli (1500 ms). Foto muncul mulai 1350 ms; lingkaran merah 1650 ms, dekorasi abu-abu 1750 ms, kotak 1950 ms, paragraf 2050 ms, dan tombol 2250 ms. Semua selesai sekitar 2630 ms, tanpa mengubah layout akhir. Scroll/klik/fokus/Escape atau perubahan ukuran layar menyelesaikan intro langsung. Event resize awal HP yang tidak mengubah dimensi diabaikan. Reduced motion dan tanpa JavaScript menampilkan hero statis. `preview/hero.html` memutar kode produksi yang sama dan menyediakan tombol replay; halaman ditandai `noindex`.
- Scrollbar kanan disembunyikan secara visual; wheel, touch, keyboard, anchor, dan footer tetap dapat dijangkau. Scroll snap `proximity` membantu section berhenti sejajar navbar tanpa mengunci section yang lebih panjang saat teks diperbesar.
- CSS memakai **Tailwind CSS hasil build lokal**. Edit `style/input.css` untuk token desain dan komponen; `npm run build` menghasilkan `style/syling.css`. Jangan memakai Tailwind CDN/runtime. Struktur tiga berkas utama tetap sama.

## Palet wajib

| Peran | Warna |
| --- | --- |
| Merah utama dan background `body` | `#8F0000` |
| Hitam navbar, teks gelap, tombol awal, dan bayangan | `#181515` |
| Terang untuk panel hero dan teks di bidang gelap | `#F6F1F8` |
| Abu-abu dekorasi | `#AAA095` |

Kode warna terbaru di atas mengalahkan perkiraan warna dari screenshot. Khususnya, gunakan `#F6F1F8`, bukan `#F6F1E8`. Opacity boleh digunakan untuk glassmorphism dan bayangan; jangan memperkenalkan warna dasar lain.

## Tipografi

- Teks biasa dan navigasi: **Plus Jakarta Sans**. Analisis screenshot menunjukkan Regular **400**, bukan bold. Font variable 200–800 sudah tersedia secara lokal; jangan membuat ketebalan sintetis.
- Paragraf hero pada kanvas desktop 1440 px: perkiraan ukuran **20 px**, line-height **30 px / 1.5**, dan letter-spacing **2 px / 0.1em**. Tombol: 20 px, line-height 28 px, letter-spacing 2 px. Sesuaikan secara responsif tanpa menghilangkan ritme tipografi.
- `BETTER CALL`: pemilik desain mengonfirmasi **SCRIPT1 Script Casual**. File font belum disediakan. Font ini berbeda dari Plus Jakarta Sans. Jangan menyatakan judul sudah sama persis sebelum file aslinya dimuat dan dibandingkan. Style font aslinya belum dapat diverifikasi; fallback sementara yang terlihat tebal/miring bukan kesimpulan tentang weight font asli.
- `Rafi`: pemilik desain mengonfirmasi **Dancing Script OT**. Implementasi lokal menggunakan Dancing Script Regular **400**, dengan bayangan `#181515`; nama keluarga/versi persis `OT` belum tersedia sebagai file dari pengguna. Cocokkan lagi bila file font asli diberikan. Pada desktop, `R` sekitar 244 px dan huruf lainnya sekitar 260 px, dengan posisi vertikal/spasi masing-masing mengikuti komposisi lettering. Judul berskala proporsional pada layar kecil.
- Jangan mengganti lettering dengan heading Plus Jakarta Sans sebagai desain final.

## Layout dan perilaku

- Terjemahkan desain tanpa redesign. Susunan, crop foto, ukuran relatif, dan bentuk dekorasi harus mengikuti screenshot. Responsif pada HP, tablet, desktop, dan layar besar.
- Navbar sticky: About, Services, Portfolio, Contact merupakan bagian **satu halaman**. Indikator glassmorphic mengikuti klik dan posisi scroll. Teks `porfolio` tetap mengikuti referensi navbar.
- Mobile/tablet: hamburger tiga garis, daftar vertikal, dapat ditutup lewat pilihan navigasi, Escape, dan klik di luar.
- Hero adalah bagian `#about`. Gunakan foto asli `assets/portrait.svg`, bukan foto pengganti. Pertahankan transparansi dan proporsinya.
- **See my artwork** adalah link ke **`#recent-projects`**, yang berada di bagian `#portfolio`. Pertahankan ID ini saat desain body Recent Project diterima. Tombol awal `#181515`, hover/fokus diisi animasi merah `#8F0000`.
- Navbar, hero, Services, Recent Projects, Tools, Work Experience, Contact, dan footer digabung dalam satu halaman mengikuti desain yang diberikan; keterbatasan aset asli dicatat di atas.
- Hormati preferensi reduced motion, fokus keyboard, dan navigasi tanpa JavaScript.

## Berkas dan publikasi

- Struktur utama wajib: `index.html`, `style/syling.css`, `script/script.js`. Ejaan `syling.css` mengikuti permintaan pengguna.
- Aset serta font lokal boleh ditaruh dalam `assets/` dan `style/fonts/`.
- Logo saat ini masih SVG sementara dari tahap navbar; file logo asli belum terakses sebagai berkas lokal.
- Kerjakan per bagian. **Jangan push/deploy ke GitHub sebelum semua bagian selesai dan disatukan.**
- Permintaan terbaru pemilik pada tahap footer mengizinkan **push dan deployment ke repo `hanazaishanz/portfolio` setelah semua bagian disatukan dan diuji**. Placeholder kontak/aset yang sudah diizinkan tetap dapat dikustomisasi setelah publikasi.

## Analisis body dan acuan interaksi

Ukuran berikut adalah perkiraan proporsi screenshot desktop, disetarakan dengan kanvas 1440 px milik navbar/hero. Ini bukan pengukuran dari file Figma asli; jangan menyatakan perbandingan pixel-perfect dari gambar body yang resolusinya kecil.

| Bagian | Acuan desktop |
| --- | --- |
| Gutter / lebar konten | 86 px / 1268 px, mengikuti navbar |
| Services | 3 kartu sekitar 368 × 242 px, jarak sekitar 80 px; kartu tengah terangkat sekitar 184 px |
| Recent projects | 3 kolom × 2 baris, bingkai sekitar 375 × 414 px; gap kolom 72 px dan baris 132 px |
| Tools | Kartu sekitar 200 × 200 px, hanya radius kiri atas; jarak dasar 64 px |
| Work experience | Timeline kiri, judul dan foto kanan; sekitar rasio 3:2 dengan gap 80 px |

- Judul section: Plus Jakarta Sans **600**, line-height **1.18**. Ukuran desktop sekitar **60 px**; judul Work Experience mengikuti ukuran ini dengan line-height **1.2**. Teks penjelasan dan filter **400**, sekitar **20 px**; keterangan timeline lebih kecil, **16 px / 24 px**, sesuai hierarki referensi. Angka ini hasil analisis visual, bukan metadata font dari gambar.
- Semua permukaan mengikuti empat warna dasar. Foto dan ikon aplikasi mempertahankan warna aslinya.
- Services: satu deskripsi aktif pada satu waktu; website development terbuka di awal sesuai referensi. Klik kartu mengangkatnya dan menampilkan deskripsi di bawah; klik lagi menutup. Di mobile cards ditumpuk agar penjelasan tidak bertabrakan.
- Recent Projects: semua bingkai melengkung, `#F6F1F8` dengan inner shadow. All aktif di awal; tombol aktif merah dengan inner shadow, tombol lain terang dengan drop shadow. Filter UI, website, photography benar-benar menyaring kartu, bukan sekadar mengganti warna tombol.
- Tools: bergerak kontinu dari kanan ke kiri. Klik kartu membuatnya putih dengan inner shadow, menampilkan nama di samping, dan menghentikan loop **4000 ms**. Klik ikon aktif sekali lagi langsung menutup nama dan melanjutkan loop; tanpa klik ulang, timer mengembalikannya otomatis. Setelah itu kartu kembali merah, nama disembunyikan, dan loop dilanjutkan. Seleksi tool baru memulai ulang timer. Fokus keyboard menghentikan saat menjelajah; aktivasi dan reset selection tidak meninggalkan pause yang terkunci. Reduced motion menampilkan daftar statis.
- Work Experience: animasi reveal sekali saat terlihat, disertai garis merah yang tumbuh. Teks karier memakai jawaban asli pemilik desain. Foto kanan sementara memakai foto SVG pemilik yang sudah tersedia; versi foto memegang kamera pada referensi belum tersedia sebagai file.

### Mengganti isi showcase

1. Di `index.html`, cari `.project-card`. Ubah `data-category` menjadi `ui`, `web`, atau `photo`; bisa beberapa kategori dipisah spasi.
2. Ganti `src`, `alt`, dan figcaption untuk proyek asli. **Hapus class bernomor `project-image-1` sampai `project-image-6`** saat mengganti sprite sementara dengan foto tunggal. Sisakan `class="project-image"`; gambar akan memakai `object-fit: contain` agar tampil utuh.
3. Enam preview sementara memakai satu gambar buatan `assets/projects/project-previews.png`, diposisikan dengan CSS. Gambar ini bukan klaim karya asli pemilik.
4. Tools dikustomisasi di `.tool-group` pada `index.html`: tambah/hapus `.tool-item`, lalu ubah `data-tool` yang unik, `src` ikon, `aria-label` tombol, dan teks `.tool-name`. Salinan loop dibuat otomatis; tidak perlu diedit.
5. Durasi jeda tools diatur melalui `data-pause-duration="4000"`; kecepatan opsional melalui `data-speed="36"` (px per detik) pada `[data-tools]`.

## Contact / CTA

- Background tetap `#8F0000`. Heading “let’s work together!” dan subheading “start your business here!” mengikuti desain, dengan Plus Jakarta Sans **600**. Teks kontak **400**.
- Acuan screenshot CTA 779 × 587 px: kartu tengah sekitar **172 × 123 px**, gap dasar sekitar **20 px**, pusat kartu sekitar x=395/y=237. Pada kanvas 1440 px kartu menjadi sekitar **318 × 227 px**. Tepi luar kartu samping lebih dekat ke kamera: gunakan **concave cylindrical 3D carousel**, lengkung menghadap ke dalam.
- Radius dicari dari proyeksi tepi kartu pada busur depan hingga ±105°, dengan perspective **4 × radius** dan ruang aman minimal 14 px. Lebar kartu dibatasi lebar dan tinggi scene yang tersedia. Desktop memakai 12 slot, HP 6 slot; sumber diulang jika belum cukup dan diganti pada sisi belakang jika jumlahnya lebih banyak. Kartu bergerak dari **kiri ke kanan**, kembali melalui sisi belakang yang disembunyikan.
- Preview diambil otomatis dari semua `.project-card`, termasuk gambar, crop sprite sementara, dan caption. Filter Recent Projects tidak menghapus item carousel.
- Untuk sertifikasi, tambah `<figure><img src="..." alt="..."><figcaption>...</figcaption></figure>` ke `<template id="contact-custom-previews">`. Gunakan `data-preview-source="custom"` pada `[data-contact-orbit]` untuk sertifikasi saja, atau `mixed` untuk gabungan proyek + sertifikasi. `projects` adalah default. Kecepatan putaran diatur melalui `data-orbit-speed="18"` dalam derajat/detik.
- Tahan dan geser horizontal, atau tahan panah keyboard, untuk menjelajah; lepaskan untuk melanjutkan putaran. Space dan tombol pause yang terlihat saat fokus keyboard mengontrol jeda manual. Reduced motion menampilkan preview statis dengan navigasi manual.
- Kartu CTA memakai glassmorphism; tombol Instagram, Gmail, LinkedIn memakai merah yang sama dengan background, drop shadow timbul, dan ikon terang.
- Pemilik mengizinkan **link sementara yang akan diisi sendiri nanti**. Instagram, WhatsApp, dan LinkedIn menuju homepage layanan masing-masing; email memakai alamat pada referensi melalui `mailto:`. Jangan menganggap placeholder homepage sebagai profil yang sudah diverifikasi.
- Tidak ada pesan yang dikirim otomatis; link Gmail hanya membuka aplikasi email.

## Footer dan kustomisasi kontak bersama

- Acuan footer 1440 × 116 px: background `#181515`, gutter 90 px, teks “copyright 2026 All rights reserved” di kiri, empat ikon Instagram / WhatsApp / Gmail / LinkedIn di kanan. Teks Plus Jakarta Sans **400**, **12 px / 18 px**. Glyph sekitar **22–24 px**; area klik tetap **44 × 44 px**. Pusat ikon desktop sekitar x=955, 1083, 1211, 1339 px.
- Di layar kecil, copyright dan ikon ditumpuk dengan jarak yang cukup; warna, urutan, dan proporsi ikon dipertahankan. Footer tidak menambahkan kotak timbul yang tidak ada di referensi.
- **Ubah satu konfigurasi** `const contacts` di awal `script/script.js`: `href` untuk URL tujuan, `label` untuk nama/alamat yang tampil, `name` untuk nama layanan, dan `icon` untuk lokasi file ikon. Konfigurasi ini memperbarui CTA dan footer sekaligus, termasuk label aksesibilitas. WhatsApp hanya tampil di footer sesuai desain.
- Ikon bawaan ada di `assets/social/instagram.svg`, `whatsapp.svg`, `gmail.svg`, dan `linkedin.svg`. Ganti file tersebut langsung, atau arahkan `icon` ke SVG/PNG/WebP transparan milik sendiri. Gambar memakai `object-fit: contain` supaya tidak terdistorsi dan ukuran tombol tetap sama. Gunakan ikon terang agar terbaca di atas merah CTA dan hitam footer.
- HTML menyimpan URL/ikon bawaan sebagai fallback ketika JavaScript mati. Bila URL fallback juga ingin diubah, samakan `href` pada CTA dan footer di `index.html`.
- Navbar tidak menganimasikan perpindahan ukuran indikator selama resize/breakpoint agar transisi mobile ke desktop tidak menimbulkan overflow sementara; animasi klik dan scroll tetap dipertahankan.

Referensi teknik yang telah dibaca: [3D Carousel — David DeSandro](https://3dtransforms.desandro.com/carousel) ([sumber](https://github.com/desandro/3dtransforms/blob/master/carousel.md)), [MDN perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/perspective), dan [MDN transform-style](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style). Artikel diakses melalui sumber publik GitHub; lengkungan dibalik untuk menyesuaikan bentuk desain pengguna.
