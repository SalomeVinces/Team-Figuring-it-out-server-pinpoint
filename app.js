//importing dependencies
import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"

//Initializing the use of dotenv for environmental variables
dotenv.config()

// creates instance of the express application
const app = express()

// Creating connection to MongoDB utilizing dotenv
const MONGODB = process.env.MONGO_DB_URI + "/" + process.env.MONGO_DB_NAME + process.env.MONGO_DB_PARAMS
mongoose.connect(MONGODB)
const db = mongoose.connection

//Middleware
app.use(express.json())

//! Apply CORS to speak with client
//app.use(cors())


//! Add Controllers here
//app.use("/...")

//Testing writing to the database
app.post('/test', (req, res) => {
    console.log('Data received:', req.body);
    res.status(201).json({
        message: 'Data received successfully',
        data: req.body
    });
})

//! Add where validation will be
// app.use(validateSession)


//? Confirming connection to the mongoose database
db.once("open", () => {
    console.log(`Connection was successful to Database: ${process.env.MONGO_DB_NAME}`)
})

//? Confirming connection to the server port
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`)
})