let express = require("express")
let mongoose = require("mongoose")
let bodyParser = require("body-parser")
let axios = require("axios")
let cors = require("cors")
let multer = require("multer")
let registeredUsers = require("./models/registeredUsers")
let modelEmployeeRegister = require("./models/modelEmployeeRegister")

let app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// mongo connection
mongoose.connect("mongodb://127.0.0.1:27017/loginCredentials")
mongoose.connection
    .once("open", () => { console.log("Connected to DB....."); })
    .on("error", () => { console.log("problem to connect to DB ..!!!!!"); })

//multer storage configuration
let storage = multer.diskStorage({
    destination: function (req, image, cb) {
        return cb(null, "./Images")
    },
    filename: function (req, image, cb) {
        return cb(null, `${image.originalname}`)
    }
});
let upload = multer({ storage });

// registration form data handle
app.post("/register", (req, res) => {
    registeredUsers.findOne({ email: req.body.email })
        .then((user) => {
            if (user !== null) {
                res.json("email already registered..")
            }
            else {
                let dataForDB = new registeredUsers(req.body)
                dataForDB.save()
                    .then((data) => { res.json("input stored in DB successfully..."); })
                    .catch((error) => (res.json("data can not be saved , problem at saving time....")))
            }
        })
        .catch(() => {
            res.json("registration problem...")
        })


})


//   handling Login Action
app.post("/login", (req, res) => {
    registeredUsers.findOne({ email: req.body.email})
        .then((user) => {
            if (user.cnfPassword == req.body.password) {
                res.json({ "status": "success", "id": user._id});
            }
            else {
                res.json({ "status": "fail"})
            }
        })
        .catch(() => { res.json({ "status": "noUser"}) })

})

// respond data to the Dashbord component
app.get("/user/:ID", (req, res) => {
    let ID = req.params.ID
    registeredUsers.findOne({ _id: ID })
        .then((e) => { res.json(e.name) })
        .catch(() => { console.log("problem at param get users Express.."); })
})


// storing create employee form data

app.post("/employees", upload.single("image"), (req, res) => {
    console.log(req.body);
    modelEmployeeRegister.findOne({ email: req.body.email })
        .then((user) => {
            if (user !== null) {
                res.json("email already registered..")
            }
            else {
                let dataForDB = new modelEmployeeRegister({
                    name: req.body.name,
                    email: req.body.email,
                    phone: req.body.phone,
                    designation: req.body.designation,
                    gender: req.body.gender,
                    course: req.body.course,
                    image: req.file.filename
                })
                dataForDB.save()
                    .then((data) => { res.json("input stored in DB successfully..."); })
                    .catch((error) => (res.json("data can not be saved , problem at saving time....")))
            }
        })
        .catch(() => {
            res.json("registration problem...")
        })
})

// respnding employee-list

app.get("/employee-list", (req, res) => {
    modelEmployeeRegister.find()
        .then((e) => {
            res.send(e)
        })
})

// edit-employee send data
app.get("/employee-list/:ID", (req, res) => {
    let ID = req.params.ID
    modelEmployeeRegister.findOne({ _id: ID })
        .then((e) => {
            res.send(e)
        })
        .catch(() => {
            res.send("employee not find")
        })
})

// edit-employee update values
app.put("/employee-list/:ID",upload.single('image'), (req, res) => {
    let ID = req.params.ID
    modelEmployeeRegister.updateOne({ _id: ID }, req.body)
        .then((e) => { res.send("successfully updated data") })
        .catch(() => { res.send("error at Delete API"); })
})


// delete employee
app.delete("/employee-list/:ID", (req, res) => {
    let ID = req.params.ID
    modelEmployeeRegister.deleteOne({ _id: ID }, req.body)
        .then(() => { res.send("user deleted.."); })
        .catch(() => { res.send("problem at deletion.."); })
})


app.listen(4001, () => {
    console.log("server listnign at 4001....");
})