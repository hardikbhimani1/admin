var mongoose = require('mongoose');

var dataSchema = new mongoose.Schema({
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
 
});

const excelModel = new mongoose.model("excel", dataSchema);
module.exports = excelModel


