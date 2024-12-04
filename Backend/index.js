import express from 'express'
import cors from 'cors'
import mysql from 'mysql2'

const app = express()
app.use(cors())
app.use(express.json());

const db = mysql.createConnection({host: 'localhost', user: 'root', password: '', database: 'student_data_management'})

db.connect(err=> {
    if(err){
    console.log(err)
}else{
    console.log("database connected")
}}
)

app.get('/student/', (req,res)=>{
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
    db.query("INSERT INTO student (name, `class`, roll_number) VALUES (?, ?, ?)",[name,classData,roll_number], (err, result)=>{
        if(err) return res.status(500).send("err")
        res.status(201).send("Data added successfully ")
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

app.put('/student/:id', (req,res)=>{
    const {id} = req.params
    const {name,class: classData, roll_number} = req.body
    if(!name || !classData || !roll_number){
        return res.status(400).send("error")
    }
    db.query("UPDATE student SET name = ?, class = ?, roll_number = ? WHERE id = ?",[name,classData,roll_number,id],(err,result)=>{
        if(err) return res.status(500).send(err)
        res.status("Record Updated")
    })
})

const port = process.env.PORT || 5000
app.listen(port, ()=>{
    console.log("running port is",port)
})