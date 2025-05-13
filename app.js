//importing dependencies
import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import cors from "cors"

import userController from "./controllers/user_controller.js"
import mapController from "./controllers/map_controller.js"
import billController from "./controllers/bill_controller.js"
import landingController from "./controllers/landing_controller.js"
import officialController from "./controllers/official_controller.js"
import validateSession from "./middleware/validateSession.js"

//Initializing the use of dotenv for environmental variables
dotenv.config()

// creates instance of the express application
const app = express()

// Creating connection to MongoDB utilizing dotenv
const MONGODB = process.env.MONGO_DB_URI + "/" + process.env.MONGO_DB_NAME
mongoose.connect(MONGODB)
const db = mongoose.connection

//? Middleware to parse JSON
app.use(express.json())

//? Apply CORS to speak with client
app.use(cors())

//These are routes users can access without logging in, used for the landing page, will be more detailed in the specific controllers for interacting beyond these two routes
app.use("/users", userController)
app.use("/map", mapController)
app.use("/landing", landingController)
app.use("/bills", billController)
app.use("/officials", officialController)

// All routes after this will require user signup and login
app.use(validateSession)

//? Confirming connection to the mongoose database
db.once("open", () => {
    console.log(`Connection was successful to Database: ${process.env.MONGO_DB_NAME}`)
})

//? Confirming connection to the server port
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`)
})