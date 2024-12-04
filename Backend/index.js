import express from 'express'
import cors from 'cors'
import mysql from 'mysql2'
import dotenv from 'dotenv';


const app = express()
dotenv.config();
app.use(cors(
    {
        origin: 'https://student-management-system-frontend-ten.vercel.app',
        methods: ["post", "get"],
        credentials: true
    }
))
app.use(express.json());

const db = mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE})

db.connect(err=> {
    if(err){
    console.log(err)
}else{
    console.log("database connected")
}}
)

app.get('/student', (req,res)=>{
    db.query("SELECT * FROM student", (err, result)=> {
        if(err) return res.status(500).send(err)
        res.send(result)
    })
})

app.post('/student', (req,res)=>{
    const {name, class: classData, roll_number} = req.body;
    if (!name || !classData || !roll_number) {
        return res.status(400).send('All fields are required');
    }

    // checking duplicate record with class and roll number

    db.query("SELECT * FROM student WHERE roll_number = ? AND class = ?",[roll_number,classData], (err, result)=>{
        if(err){
            console.log(err);
            return res.status(500).send("Database Error")
        }

        if(result.length > 0){
            return res.status(409).send("Record is already exist with same class and roll number")
        }

    db.query("INSERT INTO student (name, `class`, roll_number) VALUES (?, ?, ?)",[name,classData,roll_number], (err, result)=>{
        if (err) {
            console.error(err);
            return res.status(500).send('Error inserting data');
        }
        res.status(201).send('Data added successfully');
    })
})
})

app.delete('/student/:id',(req,res)=>{
    const {id} = req.params
    if(!id){
        return res.status(400).send("err in id")
    }
    db.query("DELETE FROM student WHERE id = ?",[id],
        (err, result)=>{
            if(err) return res.status(500).send(err)
            res.send('Student Record Deleted')
    })
})

app.put('/student/:id', (req, res) => {
    const { id } = req.params;
    const { name, class: classData, roll_number } = req.body;

    if (!name || !classData || !roll_number) {
        return res.status(400).send('All fields are required');
    }

    // Fetch the existing student record
    db.query("SELECT * FROM student WHERE id = ?", [id], (err, existingRecords) => {
        if (err) return res.status(500).send('Error fetching record');

        if (existingRecords.length === 0) {
            return res.status(404).send('Record not found');
        }

        const existingRecord = existingRecords[0];

        // Check for duplicates only if class or roll number is being changed
        if (existingRecord.class !== classData || existingRecord.roll_number !== roll_number) {
            db.query(
                "SELECT * FROM student WHERE roll_number = ? AND class = ? AND id != ?",
                [roll_number, classData, id],
                (err, result) => {
                    if (err) return res.status(500).send('Database error');
                    if (result.length > 0) {
                        return res
                            .status(409)
                            .send('Another record exists with the same class and roll number');
                    }

                    // No duplicates, proceed with update
                    updateRecord();
                }
            );
        } else {
            // No changes to class or roll number, proceed with update
            updateRecord();
        }
    });

    function updateRecord() {
        db.query(
            "UPDATE student SET name = ?, class = ?, roll_number = ? WHERE id = ?",
            [name, classData, roll_number, id],
            (err) => {
                if (err) return res.status(500).send('Error updating record');
                res.status(200).send('Record updated successfully');
            }
        );
    }
});


const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log("running port is",port)
})
