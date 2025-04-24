import express from "express"
import User from "../models/users.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const router = express.Router()

router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, email, password, zipCode } = req.body

        const passwordHashed = bcrypt.hashSync(password, +process.env.SALT)

        const user = new User({
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: email,
            password: passwordHashed,
            zipCode: zipCode
        })

        const newUser = await user.save()

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24, //! Using for testing purposes, will switch when app is live
            // expiresIn: 60m 
        })

        res.status(200).json({
            Msg: "Success! User was created",
            User: newUser,
            Token: token
        })


    } catch (error) {
        res.status(500).json({
            Error:
                error.code === 11000
                    ? "Error signing up, please try again"
                    : error.message
        })
    }
})


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        //find the user supplied from user input email in MongoDB
        const foundUser = await User.findOne({ email: email })

        //if user is not found in the MongoDB, then display error message
        if (!foundUser) throw new Error("Error logging in")

        //verify that the supplied password matches the encrypted password in MongoDB
        const verifiedPassword = await bcrypt.compare(password, foundUser.password)

        // Test check in console for verifying that passwords match from MongoDB
        console.log("Do passwords match:", verifiedPassword)

        //if user supplies an invalid password or if passwords do not match, then display error message
        if (!verifiedPassword) throw new Error("Error logging in")

        const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
            expiresIn: "1 day"
        })

        //return the following response when a user is able to successfully log in
        res.status(200).json({
            Msg: "Success! You are logged in.",
            User: foundUser,
            Token: token
        })


    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
})

router.patch("/update/:userId", async (req, res) => {
    try {
        let newInfo = req.body

        let results = await User.findByIdAndUpdate(req.params.userId, newInfo, { new: true })

        res.status(200).json({
            Result: results
        })
    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
})

router.get("/all", async (req, res) => {
    try {
        const users = await User.find().sort("lastName").select({ lastName: 1, firstName: 1, email: 1 })

        console.log(users)

        res.status(200).json({
            "All Users": users
        })

    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
})

export default router