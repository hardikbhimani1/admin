const express = require("express")
const ejs = require("ejs");
const path = require("path")
const connect = require("./db/conn")
const userModel = require("./model/model")
const productModel = require("./model/form_model")
const excelModel = require("./model/e_model")
const rout = require("./router/router")
var csv = require('csvtojson');
const { v4: uuidv4 } = require('uuid')
var XLSX = require('xlsx');
const bodyparser = require('body-parser')
const multer = require("multer")
let fs = require('fs');
let dir = './upload';
const session = require('express-session');
const Mongosession = require("connect-mongodb-session")(session)
const app = express()

//SESSION DATABASE STORE

const store = new Mongosession({
  url: connect,
  collection: "Session",
})

// SESSION FUNCTION

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  secret: "hellomynameishardikbhimani",
  saveUninitialized: true,
  cookie: { maxAge: oneDay },
  resave: false,
  store: store
}));

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'));
app.use(express.static('file'));
app.use(express.static('uploads'));
app.set('view engine', 'ejs')


//SESSION STORE

const isAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    req.session.error = "You have to Login first";

    res.redirect("/");
  }
}

// LOGIN MODULE

app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect('/add')
  }
  else {
    res.render('login');
  }
})

//REGISTER MODULE

app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect('/add')
  }
  else {
    res.render('register');
  }
})


//LOGOUT SESSION DELETE IN WEBSITE AND DATABASE

app.get("/Logout", (req, res) => {
  console.log("hello log out");
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
})

//ADD PRODUCT API

app.get("/add", isAuth, (req, res) => {
  res.render("form")
})



// EDIT ID 
app.get("/edit/:id", (req, res) => {
  var id = req.params.id
  productModel.findById({ _id: req.params.id }).then(data => {
    res.render('update', { product: data })
  })
})

//DELETE DATA

app.get("/delete/:id", (req, res) => {
  var id = req.params.id
  console.log("b", id);
  productModel.deleteOne({ _id: id }).then(data => {
    res.redirect("/view")
  })
})

//FIND DATA IN CONVERT DATA IN EXCEL

app.get('/export', (req, res) => {
  productModel.find((err, data) => {
    if (err) {
      console.log(err)
    } else {
      if (data != '') {
        res.render('export', { data: data });
      } else {
        res.render('export', { data: '' });
      }
    }
  })
});


//INPORT DATA IN DATABASE

app.get('/inport', (req, res) => {
  excelModel.find((err, data) => {
    if (err) {
      console.log(err)
    } else {
      if (data != '') {
        res.render('inport', { result: data });
      } else {
        res.render('inport', { result: {} });
      }
    }
  });
});

// UPLOAD FUNCTION IN UPDATE PRODUCT, ADD PRODUCT AND INPORT EXCEL

let upload = multer({
  storage: multer.diskStorage({

    destination: (req, file, callback) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, './upload');
    },
    filename: (req, file, callback) => { callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); }

  }),

  fileFilter: (req, file, callback) => {
    let ext = path.extname(file.originalname)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(null, false)
    }
    callback(null, true)
  }
});

// ADD PRODUCT API 

app.post('/add', upload.any(), (req, res) => {
  console.log("hello world");
  if (!req.body && !req.files) {
    res.json({ success: false });
  }
  else {
    var e = req.body
    console.log(e);
    var arr = []
    let a = req.files
    console.log("a:-", a)
    for (var i = 0; i < a.length; i++) {
      arr.push(req.files[i].filename)
    }
    let detail = productModel({
      product_name: req.body.product_name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      fileupload: arr

    });
    detail.save((err) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect("/view");
      }
    })

  }
});

// UPDATE PRODUCT 

app.post('/update/:id', upload.any(), (req, res) => {
  var id = req.params.id
  console.log("hello", id)
  var e = req.body
  var arr = []
  let a = req.files
  for (var i = 0; i < a.length; i++) {
    arr.push(req.files[i].filename)
    console.log(arr);
  }
  console.log("arr null")
  productModel.updateOne({ _id: id }, {
    $set: {
      product_name: req.body.product_name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      fileupload: arr
    }
  }, (err, result) => {
    if (err) throw err
    else {
      res.redirect("/view")
    }
  })

});

//DATABASE DATA CONVERT IN EXCEL

app.post('/data', (req, res) => {
  for (var i = 1; i <= 100; i++) {
    var data = new productModel({
      product_name: req.body.product_name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      fileupload: req.body.fileupload

    });
    data.save((err, data) => {
      if (err) {
        console.log(err)
      }
    })
  }
  res.redirect('/export')
});

//EXCEL EXPORT DATA API

app.post('/exportdata', (req, res) => {
  var wb = XLSX.utils.book_new();
  productModel.find((err, data) => {
    if (err) {
      console.log(err)
    } else {
      var temp = JSON.stringify(data);
      temp = JSON.parse(temp);
      var ws = XLSX.utils.json_to_sheet(temp);
      var down = __dirname + '/file/exportdata.xlsx'
      XLSX.utils.book_append_sheet(wb, ws, "sheet1");
      XLSX.writeFile(wb, down);
      res.download(down);
    }
  });
});

// INPORT DATA 

app.post('/inportdata', (req, res) => {
  var workbook = XLSX.readFile(req.file.path);

  var sheet_namelist = workbook.SheetNames;
  var x = 0;
  sheet_namelist.forEach(element => {
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
    excelModel.insertMany(xlData, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    })
    x++;
  });
  res.redirect('/view');
});

//VIEW ALL DATA

app.get("/view", isAuth, (req, res) => {
  if (req.session.userId) {
    productModel.find().then(data => {
      res.render('table', {
        user: data
      })
    })
  }
  else {
    res.redirect("/")
  }
})


// VIEW DATA BY ID

app.get("/view/:id", (req, res) => {
  var id = req.params.id
  console.log("b", id);
  productModel.findById({ _id: id }).then(data => {
    res.render('view_data', { user: data })
    console.log(data.fileupload[0])
  });

})




app.use("/", rout)


app.listen(1234, () => {
  console.log("server is on port number is 1234")
})