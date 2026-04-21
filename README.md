# RevoBank API (RaafiBank)


## Tech Stack yang digunakan

* **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
* **Database:** PostgreSQL (Di-*host* menggunakan [Supabase](https://supabase.com/))
* **ORM:** [Prisma](https://www.prisma.io/)
* **Autentikasi:** JWT (JSON Web Tokens) & Passport.js
* **Keamanan:** Bcrypt (Hashing Password)
* **Dokumentasi API:** Swagger / OpenAPI
* **Deployment:** [Railway](https://railway.app/)

##  Fitur Utama

1. **🔐 Autentikasi & Otorisasi**
   - Registrasi pengguna dengan *hashing password* yang aman.
   - Login untuk mendapatkan token JWT.
   - Proteksi *endpoint* menggunakan `JwtAuthGuard`.
2. **💳 Manajemen Rekening**
   - Mengambil data profil pengguna yang sedang login.
   - Pembuatan rekening bank yang terhubung langsung dengan ID pengguna.
3. **💸 Transaksi Keuangan**
   - **Setor Tunai (Deposit):** Menambah saldo ke dalam rekening dengan aman.
   - **Tarik Tunai (Withdraw):** Menarik saldo (dilengkapi dengan validasi jika saldo tidak mencukupi).
   - **Transfer:** Mengirim saldo antar rekening RevoBank yang berbeda.
   - **Riwayat (History):** Melihat catatan lengkap riwayat transaksi dari sebuah rekening.

## 📚 Dokumentasi API (Swagger)

Proyek ini menggunakan Swagger untuk dokumentasi API yang interaktif. 
Kamu bisa melihat detail data yang dikirim dan mengetes *endpoint* secara langsung di sini:

👉 **Live API Docs:** [https://revobank-api-raafi-production.up.railway.app/api](https://revobank-api-raafi-production.up.railway.app/api)



## 🛠️ Panduan Instalasi Lokal

### Prasyarat
* Node.js (versi 16 atau lebih baru)
* npm atau yarn
* Link koneksi database PostgreSQL

### 1. Clone Repositori
```bash
git clone <https://github.com/Revou-FSSE-Oct25/milestone-2-RaafiTeam2Madrid>
cd revobank-api