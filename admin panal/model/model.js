const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const employeeSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },  
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    conformpassword:{
        type:String,
        required:true
    },
})

const userModel = new mongoose.model("userdata", employeeSchema);

module.exports = userModel


