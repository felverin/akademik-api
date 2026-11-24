const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'akademik',
  dateStrings: true,
});

const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Duplicate data (kode/nim already exists)' });
    if (err.code === 'ER_NO_REFERENCED_ROW_2')
      return res.status(404).json({ message: 'Mahasiswa or mata kuliah not found' });
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

app.post('/mahasiswa', wrap(async (req, res) => {
  const { nama, nim } = req.body;
  if (!nama || !nim) return res.status(400).json({ message: 'nama and nim are required' });
  const [r] = await db.query('INSERT INTO mahasiswa (nama, nim) VALUES (?, ?)', [nama, nim]);
  res.status(201).json({ id: r.insertId, nama, nim });
}));

app.get('/mahasiswa', wrap(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM mahasiswa');
  res.json(rows);
}));

app.put('/mahasiswa/:id', wrap(async (req, res) => {
  const { nama, nim } = req.body;
  const [r] = await db.query('UPDATE mahasiswa SET nama = ?, nim = ? WHERE id = ?',
    [nama, nim, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Mahasiswa not found' });
  res.json({ id: Number(req.params.id), nama, nim });
}));

app.delete('/mahasiswa/:id', wrap(async (req, res) => {
  const [r] = await db.query('DELETE FROM mahasiswa WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Mahasiswa not found' });
  res.json({ message: 'Mahasiswa deleted' });
}));

app.post('/mahasiswa/:id/matakuliah', wrap(async (req, res) => {
  const { matakuliah_id, tanggalKelas, jamKelas } = req.body;
  if (!matakuliah_id || !tanggalKelas || !jamKelas)
    return res.status(400).json({ message: 'matakuliah_id, tanggalKelas, jamKelas are required' });
  const [r] = await db.query(
    'INSERT INTO kelas (matakuliah_id, mahasiswa_id, tanggal_kelas, jam_kelas) VALUES (?, ?, ?, ?)',
    [matakuliah_id, req.params.id, tanggalKelas, jamKelas]);
  res.status(201).json({ id: r.insertId, mahasiswa_id: Number(req.params.id),
    matakuliah_id, tanggalKelas, jamKelas });
}));

app.post('/matakuliah', wrap(async (req, res) => {
  const { nama, kode, dosen, image_url } = req.body;
  if (!nama || !kode || !dosen)
    return res.status(400).json({ message: 'nama, kode, dosen are required' });
  const [r] = await db.query(
    'INSERT INTO matakuliah (nama, kode, dosen, image_url) VALUES (?, ?, ?, ?)',
    [nama, kode, dosen, image_url || null]);
  res.status(201).json({ id: r.insertId, nama, kode, dosen, image_url });
}));

app.get('/matakuliah', wrap(async (req, res) => {
  const [courses] = await db.query('SELECT * FROM matakuliah');
  const [students] = await db.query(
    `SELECT DISTINCT k.matakuliah_id, m.id, m.nama, m.nim
     FROM kelas k JOIN mahasiswa m ON m.id = k.mahasiswa_id`);
  const result = courses.map((c) => ({
    ...c,
    mahasiswa: students
      .filter((s) => s.matakuliah_id === c.id)
      .map(({ id, nama, nim }) => ({ id, nama, nim })),
  }));
  res.json(result);
}));

app.get('/matakuliah/:id/jadwal', wrap(async (req, res) => {
  const [rows] = await db.query(
    `SELECT DISTINCT tanggal_kelas AS tanggalKelas, jam_kelas AS jamKelas
     FROM kelas WHERE matakuliah_id = ?
     ORDER BY tanggal_kelas, jam_kelas`, [req.params.id]);
  res.json(rows);
}));

app.put('/matakuliah/:id', wrap(async (req, res) => {
  const { nama, kode, dosen, image_url } = req.body;
  const [r] = await db.query(
    'UPDATE matakuliah SET nama = ?, kode = ?, dosen = ?, image_url = ? WHERE id = ?',
    [nama, kode, dosen, image_url || null, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Mata kuliah not found' });
  res.json({ id: Number(req.params.id), nama, kode, dosen, image_url });
}));

app.delete('/matakuliah/:id', wrap(async (req, res) => {
  const [r] = await db.query('DELETE FROM matakuliah WHERE id = ?', [req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Mata kuliah not found' });
  res.json({ message: 'Mata kuliah deleted' });
}));

app.listen(3000, () => console.log('API running on http://localhost:3000'));