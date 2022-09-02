const mongoose = require("mongoose")
const express = require("express")


const connect = express.Router()

mongoose.connect("mongodb://localhost:27017/admin_panel",{
    useNewUrlParser:true,
    useUnifiedTopology:true
},(err,connect)=>{
    if(err)throw err

    else{
        console.log("DB Is Coneection Done")
    }
})

module.exports = connect