import jwt from "jsonwebtoken"
import User from "../models/users.js"

const validateSession = async (req, res, next) => {
    try {
        // take the token provided by the request object/user
        const auth = req.headers.authorization

        // if no auth throw error
        if (!auth) throw new Error("Unauthorized")

        // get the second word from the string "Bearer TOKEN_HERE"
        const token = auth.split(" ")[1]
        // console.log("Auth split?:", auth.split(" ")[1])

        if (!token) throw new Error("Invalid token")
        
        // allow the jwt library to drcrypt token, using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //! Remove this line below when completed
        console.log("Decoded:", decoded)

        // querying our user table to find the user with the matching id
        const user = await User.findById(decoded.id)
        //! Remove this line below when completed
        console.log("User?:", user)

        if (!user) throw new Error("User not found")

        req.user = user

        next()
    } catch (err) {
        console.log(err)
        res.status(401).json({
            ValidateError: err.message.includes("expired") ? "Token expired, please signup or login again" : err.message
        })
    }
}

export default validateSession