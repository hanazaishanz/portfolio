# raff.co — Naufal Rafi

Portfolio statis satu halaman, tanpa dependency atau proses build. Desain dan catatan ukuran ada di [DESIGN.md](DESIGN.md).

## Preview lokal

Jalankan dari direktori proyek:

```sh
python3 -m http.server 8000
```

Buka <http://localhost:8000>. Struktur utama: `index.html`, `style/syling.css`, `script/script.js`.

## Mengganti konten

- **Kontak dan ikon CTA/footer:** edit objek `contacts` di awal `script/script.js`. Ubah `href`, `label`, `name`, atau `icon`. Ikon sendiri bisa menggantikan file di `assets/social/` secara langsung. HTML menyediakan fallback tanpa JavaScript; samakan URL di HTML bila fallback juga ingin diubah.
- **Logo navbar:** ganti `assets/logo.svg` dengan logo sendiri; pertahankan proporsinya.
- **Recent Projects:** ganti gambar, `alt`, caption, dan kategori pada `.project-card` di HTML. Hapus class `project-image-1` sampai `project-image-6` jika menggunakan gambar tunggal; pertahankan `project-image`.
- **Preview CTA:** otomatis memakai proyek. Untuk sertifikasi, isi template `contact-custom-previews` di HTML dan pilih `data-preview-source="custom"` atau `"mixed"`.
- **Tools:** edit daftar `.tool-group` di HTML. Salinan animasinya dibuat otomatis.

Preview proyek dan sebagian logo merupakan aset sementara yang dapat diganti pemilik. Foto kamera untuk Work Experience serta file font asli SCRIPT1 Script Casual belum tersedia; lettering tersebut masih menggunakan fallback. Ketentuan lengkap ada di DESIGN.md.

## GitHub Pages

Workflow `.github/workflows/pages.yml` memublikasikan file situs dari `main` menggunakan Actions resmi GitHub; dokumentasi dan file Git tidak ikut diunggah sebagai artefak situs.

Jika Pages belum aktif, buka **Settings → Pages → Build and deployment → Source → GitHub Actions**, lalu jalankan **Actions → Deploy portfolio to GitHub Pages → Run workflow**. Push perubahan situs ke `main` akan memicu deployment berikutnya.

URL standar setelah deployment berhasil: <https://hanazaishanz.github.io/portfolio/>. Status deployment bisa dilihat di tab Actions; keberadaan workflow tidak berarti deployment sudah berhasil.
