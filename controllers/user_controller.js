import express from "express"
import User from "../models/users.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import fs from 'fs';
import centroid from '@turf/centroid';

// importing data from zip code json file
const rawJson = fs.readFileSync('./data/usa_zip_codes.json', 'utf8')
const zipGeoData = JSON.parse(rawJson)

import validateSession from "../middleware/validateSession.js"

const router = express.Router()

router.post("/signup", async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, email, password, zipCode, latitude, longitude } = req.body

        let resolvedLat = latitude
        let resolvedLng = longitude

        //if  user does not accept to give lat/lng data from frontend, lookup in usa_zip_code.json data file
        if (latitude && longitude) {
            console.log("Using geolocation from frontend");
        } else {
            console.log("Using ZIP centroid as fallback");

            const feature = zipGeoData.features.find(f => f.properties.ZCTA5CE10 === zipCode.toString());
            if (!feature) throw new Error("Invalid ZIP code");

            const center = centroid(feature);
            [resolvedLng, resolvedLat] = center.geometry.coordinates;
        }

        const passwordHashed = bcrypt.hashSync(password, +process.env.SALT)

        const user = new User({
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: email,
            password: passwordHashed,
            zipCode: zipCode,
            latitude: resolvedLat,
            longitude: resolvedLng
        })

        const newUser = await user.save()

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '3h', //! Using for testing purposes, will switch when app is live
            // expiresIn: '60m' 
        })

        res.status(200).json({
            Msg: "Success! User was created",
            User: newUser,
            Token: token
        })


    } catch (error) {
        console.log(error)

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
        if (!foundUser) throw new Error("Error logging in user")

        //verify that the supplied password matches the encrypted password in MongoDB
        const verifiedPassword = await bcrypt.compare(password, foundUser.password)

        // Test check in console for verifying that passwords match from MongoDB
        console.log("Do passwords match:", verifiedPassword)

        //if user supplies an invalid password or if passwords do not match, then display error message
        if (!verifiedPassword) throw new Error("Error logging in password")

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
        console.log(error);
        res.status(500).json({
            Error: error.message
        })
    }
})

router.patch("/update/:userId", validateSession, async (req, res) => {
    try {
        // list of fields users will be allowed to update
        const allowedUpdates = ['firstName', 'lastName', 'email', 'zipCode', 'dateOfBirth']
        const updates = Object.keys(req.body)
        const isValidOperation = updates.every(update => allowedUpdates.includes(update))

        if (!isValidOperation) {
            return res.status(400).json({
                Error: "Invalid update fields"
            })
        }

        let newInfo = req.body

        let results = await User.findByIdAndUpdate(req.params.userId, newInfo, { new: true, runValidators: true }).select({ firstName: 1, lastName: 1, email: 1, dateOfBirth: 1, zipCode: 1 })

        if (!results) {
            return res.status(404).json({ Error: "User not found" });
        }

        res.status(200).json({
            Result: results
        })
    } catch (error) {
        res.status(500).json({
            Error: error.message
        })
    }
})

router.get("/one/:userId", validateSession, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select({ firstName: 1, lastName: 1, email: 1, dateOfBirth: 1, zipCode: 1 })

        res.status(200).json({
            User: user
        })
    } catch (err) {
        res.status(500).json({
            Error: err.message
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