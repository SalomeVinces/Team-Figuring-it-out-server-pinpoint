import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    dateOfBirth: { //!Look up how to incorporate date/DoB
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    zipCode: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    }
})

export default mongoose.model("user", UserSchema)