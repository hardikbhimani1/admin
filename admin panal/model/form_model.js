const mongoose = require("mongoose")


const productSchema = new mongoose.Schema({
    product_name:{
        type:String,
        required:true
    },
  
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },

    fileupload:{
        type:Array  
    }   
})

const productModel = new mongoose.model("product", productSchema);

module.exports = productModel


