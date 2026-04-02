# Pull Request: Production-Ready Auth & Voting Lock

Draf ini berisi ringkasan perubahan untuk menyelesaikan Issue #8.

## Title
`feat: implementation of real auth, voting lock, and premium UI polish`

## Description

Menyelesaikan peningkatan platform voting Web3 ke standar produksi dengan pembaruan sebagai berikut:

### 1. Autentikasi Nyata (Web2)
- Implementasi sistem pendaftaran dan login menggunakan Email/Password.
- Penyimpanan data pengguna yang aman dengan enkripsi `bcrypt` di database MySQL.
- Manajemen sesi menggunakan JWT Token.

### 2. Mekanisme Kunci Suara (Voting Lock)
- Penambahan pengecekan `hasVoted` baik di tingkat Smart Contract (Web3) maupun Database (Web2).
- Tombol voting akan otomatis terkunci (*disabled*) dengan label "Already Voted" jika pengguna terdeteksi sudah memberikan suara.
- Perbaikan alur reaktif di frontend agar status voting diperbarui secara instan saat ganti akun MetaMask.

### 3. Peningkatan UI/UX & Transparansi
- Navbar premium dengan gaya *glassmorphism* dan indikator status sinkronisasi blockchain.
- Log Transparansi yang mendetail, menampilkan nama pemilih, nama kandidat yang dipilih, dan link ke transaksi blockchain.
- Penanganan error yang lebih informatif (khususnya untuk `CALL_EXCEPTION` dari blockchain).
