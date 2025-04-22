import mongoose from "mongoose";

const UserSchema = new mongoose.Schema( {
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dateOfBirth: { //!Look up how to incorporate date/DoB
        type: Number,
        required: true
    },
    email: { 
        type: String,
        required: true
    },
    password: { 
        type: String,
        required: true
    },
    zipCode: { 
        type: Number,
        required: false
    },
} )

export default mongoose.model("user", UserSchema)