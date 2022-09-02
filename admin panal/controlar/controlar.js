const express = require("express")
const userModel = require("../model/model")
const productModel = require("../model/form_model")
const multer = require("multer")
const path = require("path")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs');
const session  = require('express-session');
const {v4 : uuidv4} = require('uuid')
const app = express();  
app.use(session({ secret: "skillqode@123", resave: true, saveUninitialized: true, cookie: { maxAge: 15 * 1000 } }))

exports.insert=(async(req, res) => {

        var firstname = req.body.firstname
        var fn = /^[a-zA-Z()]+$/
        var lastname = req.body.lastname 
        var email = req.body.email
        var ema = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/
        var password = req.body.password
        var pass = /^(?=.{6,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/
    
        if(!(firstname)){
            res.send({data: "pls enter First Name",status: false,responsecode: 0})
            return;
         }
        if( firstname == ' ' ||  !firstname.match(fn)  ){
            res.send({data: "pls enter valid First Name",status: false,responsecode: 0})
            return;
        }
        if(!(lastname)){
            res.send({data: "pls enter Last Name",status: false,responsecode: 0})
            return;
         }
        if( lastname == ' ' ||  !lastname.match(fn)  ){
            res.send({data: "pls enter valid  Last Name",status: false,responsecode: 0})
            return;
        }
        if(!(email)){
            res.send(JSON.stringify({data: "pls enter email ",status: false,responsecode: 0}))
            return
         }
        if( email == ' ' ||  !email.match(ema))
        {
            res.send({data: "pls enter valid email ",status: false,responsecode: 0})
            return;
        }
        if(!(password)){
            res.send({data: "pls enter password ",status: false,responsecode: 0})
            return
        }
        if(  password == ' ' ||  !password.match(pass))
        {
            res.send({data: "pls enter capital char,small char, special char and number totel char 6,",status: false,responsecode: 0})
            return;
        }

  
        var passwords = await bcrypt.hash(password, 10)
        console.log("password:",passwords)

        userModel.findOne({ email: req.body.email }).then((data) => {
            if (data != null) {
                res.send({ data: "email alredy inserted", status: false, responsecode: 0 });
                return;
            }
            else {
                data = {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    gender: req.body.gender,
                    password: passwords,
                    conformpassword: passwords
                }
               
                //  const token = userModel.generateAuthToken()
                //  console.log("token:-",token)
                userModel.create(data).then(data => res.render("login")).catch(e => res.send(e))
                // console.log("data insert errr: ",e)

                }
            })
    
    }) 

exports.login = (async (req, res) => {
    var email = req.body.email
   const user = await userModel.findOne({ email: email });
   // console.log("user = ",user)
   if (user) {
          var v_Password = await bcrypt.compare(req.body.password, user.password)
           if (v_Password) {
                   const userId = uuidv4()
                   console.log("userID:-",userId)
                   req.session.userId = true
                           res.redirect('/add');
                 } else {
                    res.redirect("/")
                 }
   }
   else {
            res.redirect("/")
         
         }
   })
   

exports.id = ((req, res) => {
    productModel.findById(req.params._id,(err,data)=>{
        if(!err){
          res.json({data})
          console.log(data)
            return res.render("update",{
                user:data
            });
        }
        else{
            res.render("table")
        }
    })
  })






 
  






