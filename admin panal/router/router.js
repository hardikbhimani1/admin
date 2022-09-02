const express = require("express")
const mongoose = require("mongoose")
const controlar = require("../controlar/controlar")
const userModel = require("../model/model")
const productModel = require("../model/form_model")

const rout = express.Router();

rout.post("/register",controlar.insert)
rout.post("/",controlar.login)
rout.get("/view/:id",controlar.id)
// rout.put("/update/:id",controlar.update)
// rout.delete("/delete/:id",controlar.delete)


module.exports = rout