# Wedding Invitation — Royal Edition

Undangan pernikahan sederhana bergaya barat dengan animasi dramatis ala kerajaan (inspired by Indosiar).

## Cara Pakai

```bash
npx serve .
```

- Undangan: `http://localhost:3456/?t=John`
- Scanner check-in: `http://localhost:3456/scanner.html`

## Check-in QR + Google Sheet

Kolom sheet: `unique_key` | `nama` | `status` | `jumlah_orang`

Spreadsheet: https://docs.google.com/spreadsheets/d/1n7Af8gCfndB_BT8HET4ofM4uN8eaTj4PWU6LiHX4N5M/edit

### Setup Google Apps Script (wajib)

1. Buka spreadsheet di atas
2. **Extensions → Apps Script**
3. Paste isi file `google-apps-script/Code.gs`, Save
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy URL Web App
6. Paste ke `config.js` → `appsScriptUrl`

### Alur

1. Tamu buka `/?t=NamaTamu` → muncul QR unik
2. Petugas buka `/scanner.html` → scan QR
3. Isi **jumlah orang** → Simpan Hadir
4. Sheet terupdate: `status=1`, `jumlah_orang=N`

### File terkait

| File | Fungsi |
|------|--------|
| `config.js` | URL Apps Script |
| `guest-utils.js` | unique_key + encode/decode QR |
| `scanner.html` | Halaman scanner |
| `google-apps-script/Code.gs` | Backend Sheet |

## Kustomisasi undangan

Edit `index.html` untuk nama pasangan, tanggal, dan tempat.
Warna tema di `styles.css` (`:root`).
