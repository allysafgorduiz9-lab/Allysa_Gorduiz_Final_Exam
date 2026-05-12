const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Aiven MySQL Connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: { rejectUnauthorized: false }
});

// Create Table if it doesn't exist
const tableQuery = `
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level VARCHAR(50) NOT NULL,
    email_address VARCHAR(100) NOT NULL
);`;

db.query(tableQuery, (err) => {
    if (err) console.error("Database initialization error:", err);
    else console.log("Database table 'students' is ready.");
});

// READ: View all students
app.get('/', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) return res.status(500).send("Database Error");
        res.render('index', { students: results, editStudent: null });
    });
});

// CREATE: Add Student
app.post('/add', (req, res) => {
    const { student_id, full_name, course, year_level, email_address } = req.body;
    const sql = 'INSERT INTO students (student_id, full_name, course, year_level, email_address) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [student_id, full_name, course, year_level, email_address], () => res.redirect('/'));
});

// DELETE: Delete Student
app.get('/delete/:id', (req, res) => {
    db.query('DELETE FROM students WHERE id = ?', [req.params.id], () => res.redirect('/'));
});

// UPDATE: Fetch student for edit
app.get('/edit/:id', (req, res) => {
    db.query('SELECT * FROM students', (err, allStudents) => {
        db.query('SELECT * FROM students WHERE id = ?', [req.params.id], (err, record) => {
            res.render('index', { students: allStudents, editStudent: record[0] });
        });
    });
});

// UPDATE: Post changes
app.post('/update/:id', (req, res) => {
    const { student_id, full_name, course, year_level, email_address } = req.body;
    const sql = 'UPDATE students SET student_id=?, full_name=?, course=?, year_level=?, email_address=? WHERE id=?';
    db.query(sql, [student_id, full_name, course, year_level, email_address, req.params.id], () => res.redirect('/'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));