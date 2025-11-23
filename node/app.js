const express = require('express');
const { Pool } = require('pg');
const app = express();
app.use(express.json());


// Use env vars to configure DB connection
const pool = new Pool({
connectionString: process.env.DATABASE_URL // used if private IP or proxy path
});


app.get('/items', async (req, res) => {
const r = await pool.query('SELECT id, name FROM items');
res.json(r.rows);
});


app.post('/items', async (req, res) => {
const { name } = req.body;
const r = await pool.query('INSERT INTO items(name) VALUES($1) RETURNING id, name', [name]);
res.status(201).json(r.rows[0]);
});


app.get('/items/:id', async (req, res) => {
const r = await pool.query('SELECT id, name FROM items WHERE id=$1', [req.params.id]);
if (r.rowCount === 0) return res.status(404).end();
res.json(r.rows[0]);
});


app.put('/items/:id', async (req, res) => {
const { name } = req.body;
const r = await pool.query('UPDATE items SET name=$1 WHERE id=$2 RETURNING id, name', [name, req.params.id]);
if (r.rowCount === 0) return res.status(404).end();
res.json(r.rows[0]);
});


app.delete('/items/:id', async (req, res) => {
await pool.query('DELETE FROM items WHERE id=$1', [req.params.id]);
res.status(204).end();
});


const port = process.env.PORT || 8080;
app.listen(port, () => console.log('listening on', port));
