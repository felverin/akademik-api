# Akademik API

A simple REST API built with Express.js and MySQL to manage **Mata Kuliah** (courses) and **Mahasiswa** (students). The two have a many-to-many relationship through the pivot table `kelas`.

**Name:** Felicia Angeline Tanujaya
**NIM:** 1076012510027
**Course:** Visual Programming

## Tech Stack

- Node.js
- Express.js
- MySQL (via `mysql2`)
- Postman (API testing)

## Database Design

Database name: `akademik`

| Table | Columns |
|---|---|
| `matakuliah` | id, nama, kode (unique), dosen, image_url |
| `mahasiswa` | id, nama, nim (unique) |
| `kelas` (pivot) | id, matakuliah_id (FK), mahasiswa_id (FK), tanggal_kelas, jam_kelas |

`kelas` holds foreign keys to both `matakuliah` and `mahasiswa`, which creates the many-to-many relation. Deleting a course or student also deletes its `kelas` rows (`ON DELETE CASCADE`).

## Prerequisites

- Node.js v18 or newer
- MySQL (for example via XAMPP)
- Postman

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/felverin/akademik-api.git
   cd akademik-api
   ```
2. Start MySQL in XAMPP.
3. Open `http://localhost/phpmyadmin`, go to the **Import** tab, and import `akademik.sql`. This creates the database, the tables, and the dummy data.
4. Install dependencies: