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

        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {
            expiresIn: 60*60*24, //! Using for testing purposes, will switch when app is live
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

export default router