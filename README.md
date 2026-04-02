# Web3 Voting Backend

Sistem voting terdesentralisasi yang menggabungkan backend **Node.js** dengan **Smart Contract** di blockchain Ethereum. Aplikasi ini menyimpan data pemilihan di database MySQL (via Prisma) sekaligus mencatat suara secara transparan di blockchain (via Ethers.js + Hardhat).

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL + Prisma ORM |
| Blockchain | Solidity + Hardhat + Ethers.js |
| Realtime | Socket.io |
| Validasi | Zod |

## Arsitektur (Clean Architecture)

```
d:\Coding\web3\voting
├── contracts/          # Smart Contract Solidity
│   └── Voting.sol
├── scripts/            # Script deploy contract
│   └── deploy.js
├── test/               # Unit test untuk smart contract
│   └── Voting.test.js
├── prisma/             # Prisma schema & migrasi database
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/    # HTTP request handler
│   ├── usecases/       # Business logic
│   ├── repositories/   # Data access (Prisma queries)
│   ├── validations/    # Zod validation schemas
│   ├── infrastructure/ # Prisma client & Ethers.js provider
│   ├── routes/         # Express route definitions
│   └── domain/         # Domain entities / DTOs
├── server.js           # Entry point aplikasi
├── hardhat.config.js   # Konfigurasi Hardhat
└── .env                # Environment variables
```

## Prasyarat

- **Node.js** v18+ (disarankan LTS)
- **MySQL** server (sudah berjalan)
- **Ganache** (untuk local blockchain) — bisa pakai Ganache UI atau CLI

## Cara Menjalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database MySQL

Buat database bernama `voting_web3` di MySQL Anda:

```sql
CREATE DATABASE voting_web3;
```

Pastikan file `.env` sudah berisi koneksi yang benar:

```env
DATABASE_URL="mysql://root:@localhost:3306/voting_web3"
PORT=4000
```

Lalu jalankan migrasi Prisma:

```bash
npx prisma migrate dev
```

### 3. Setup Blockchain (Ganache)

1. **Jalankan Ganache** (buka aplikasi Ganache UI atau jalankan `ganache-cli`).
2. **Compile smart contract:**
   ```bash
   npx hardhat compile
   ```
3. **Deploy smart contract ke Ganache:**
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```
4. **Catat output** — akan muncul _Contract Address_ seperti:
   ```
   Voting contract deployed to: 0x1234abcd...
   ```
5. **Update `.env`** dengan data dari Ganache:
   ```env
   # Web3 Configuration
   RPC_URL=http://127.0.0.1:7545
   PRIVATE_KEY=<private_key_dari_ganache>
   CONTRACT_ADDRESS=<contract_address_hasil_deploy>
   ```
   > **Private Key**: Klik ikon 🔑 pada salah satu akun di Ganache UI untuk meng-copy private key-nya.

### 4. Jalankan Server

**Development mode** (auto-restart saat ada perubahan file):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Jika berhasil, Anda akan melihat output seperti:
```
Web3: Connected to Voting Contract at 0x1234abcd...
Server started on port 4000
```

### 5. Test Smart Contract

```bash
npx hardhat test
```

Output yang diharapkan:
```
  Voting Contract
    Deployment
      ✓ Should set the right owner
    Voting Process
      ✓ Should allow a user to cast a vote
      ✓ Should prevent dual voting in the same election
      ✓ Should allow the same user to vote in different elections

  4 passing
```

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/elections` | Daftar semua pemilihan |
| `GET` | `/api/elections/:id` | Detail pemilihan berdasarkan ID |
| `POST` | `/api/elections` | Buat pemilihan baru |

### Contoh Request: Buat Pemilihan Baru

```bash
curl -X POST http://localhost:4000/api/elections \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pemilihan Ketua RT",
    "description": "Pemilihan ketua RT periode 2026-2029",
    "startDate": "2026-04-10T00:00:00.000Z",
    "endDate": "2026-04-17T00:00:00.000Z"
  }'
```

## Database Schema

Terdapat 4 model utama:

- **Voter** — Data pemilih (nama, wallet address, status verifikasi)
- **Election** — Data pemilihan (judul, deskripsi, tanggal mulai/selesai)
- **Candidate** — Kandidat per pemilihan (nama, visi, misi)
- **Vote** — Rekam suara (relasi voter ↔ candidate ↔ election + txHash dari blockchain)

> Setiap voter hanya bisa memberikan **satu suara per pemilihan** (constraint `@@unique([voterId, electionId])`).

## Smart Contract

File `contracts/Voting.sol` menyediakan:

- `castVote(electionId, candidateId)` — Mencatat suara on-chain. Mencegah double voting.
- `hasVoted(electionId, voter)` — Mengecek apakah address sudah memilih.
- Event `VoteCast` — Di-emit setiap ada suara masuk, di-listen oleh backend untuk sinkronisasi data.
