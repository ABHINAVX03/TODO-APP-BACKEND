const connectToMongo=require('./db.js')
const express=require('express')
var cors=require('cors')

connectToMongo()

const app=express()
const port=5000
app.use(cors())
app.use(express.json())

app.use('/api/auth',require('./routes/auth.js'))
app.use('/api/todo',require('./routes/todo.js'))

app.listen(port,()=>{
    console.log(`Exaple app listing at http://localhost:${port}`);
})