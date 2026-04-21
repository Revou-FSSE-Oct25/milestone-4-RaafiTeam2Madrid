# 🏦 RevoBank API (RaafiBank)

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

RevoBank API adalah sebuah RESTful API *backend* yang mensimulasikan sistem perbankan digital. Dibangun menggunakan **NestJS** dan **Prisma ORM**, aplikasi ini dirancang dengan arsitektur yang *scalable*, validasi data yang ketat, serta sistem keamanan autentikasi berbasis JWT.

---

## 🚀 Fitur Utama

1. **🔐 Autentikasi & Keamanan (JWT)**
   - Registrasi dan Login pengguna dengan enkripsi *password* menggunakan **Bcrypt**.
   - Proteksi *endpoint* menggunakan `JwtAuthGuard`.
   - Validasi ketat (Ownership Check) untuk memastikan pengguna hanya dapat mengakses dan bertransaksi menggunakan rekening miliknya sendiri.

2. **👤 Manajemen Profil & Rekening (CRUD)**
   - Mendapatkan detail profil dan memperbarui data pengguna (`PATCH`).
   - Pembuatan rekening bank *auto-generated* (10 digit angka).
   - Melihat daftar rekening dan memperbarui label/status rekening.
   - Menghapus rekening (dengan validasi saldo harus 0).

3. **💸 Transaksi Keuangan (ACID Compliant)**
   - Menggunakan `Prisma.$transaction` untuk menjamin konsistensi data.
   - **Setor Tunai (Deposit):** Menambah saldo (dilengkapi validasi kepemilikan rekening).
   - **Tarik Tunai (Withdraw):** Menarik saldo (dilengkapi validasi limit saldo).
   - **Transfer:** Mengirim dana antar rekening RevoBank secara aman.
   - **Riwayat & Detail Transaksi:** Melacak seluruh riwayat pergerakan dana (*in/out*) dan melihat detail satu transaksi spesifik.

---

## 📚 Dokumentasi API (Swagger / OpenAPI)

Proyek ini dilengkapi dengan dokumentasi interaktif menggunakan Swagger UI. Anda dapat melihat *schema* data, format *request/response*, dan melakukan pengujian *endpoint* secara langsung.

👉 **Live API Docs:** [RevoBank Swagger UI](https://revobank-api-raafi-production.up.railway.app/api)

---

## 🛠️ Tech Stack

* **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
* **Database:** PostgreSQL (Di-*host* menggunakan [Supabase](https://supabase.com/))
* **ORM:** [Prisma](https://www.prisma.io/)
* **Autentikasi:** JWT (JSON Web Tokens) & Passport.js
* **Validasi:** class-validator & class-transformer
* **Deployment:** [Railway](https://railway.app/)

---

## 💻 Panduan Instalasi Lokal

### Prasyarat
Pastikan mesin Anda sudah terinstal:
* [Node.js](https://nodejs.org/) (v16 atau lebih baru)
* npm atau yarn
* PostgreSQL Server (Lokal atau Cloud seperti Supabase/Neon)

### 1. Clone Repositori
```bash
git clone [https://github.com/Revou-FSSE-Oct25/milestone-4-RaafiTeam2Madrid.git](https://github.com/Revou-FSSE-Oct25/milestone-4-RaafiTeam2Madrid.git)
cd milestone-4-RaafiTeam2Madrid/revobank-api