const express = require('express');
// cors use 
const cors = require("cors");
// const mongoose = require('mongoose');

require('./db/config');


const User = require("./db/Users");
const Product = require("./db/Product");
const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm'
const app = express();

app.use(express.json());
app.use(cors());



app.post("/register", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send({ result: "something went wrong .Please try after sometime" })
        }
        resp.send({ result, auth: token })
    })
})

// const app = express();
// const connectDB = async ()=>{
//     mongoose.connect('mongodb://0.0.0.0:27017/e-com');
//     const productSchema= new mongoose.Schema({});
//     const product = mongoose.model('product',productSchema);
//     const data = await product.find();
//     console.log(data);
// }
// connectDB();

// app.get('/',(req,resp)=>{

//     resp.send("App is working");

// })


app.post('/login', async (req, resp) => {
    console.log(req.body)
    if (req.body.password && req.body.email) {

        let user = await User.findOne(req.body).select("-password");
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    resp.send({ result: "something went wrong Please try after sometime" })
                }
                resp.send({ user, auth: token })
            })

        } else {
            resp.send({ result: 'No User Found' })
        }


    }
    else {
        resp.send({ result: 'No User Found' })
    }

    // resp.send(user);
})


app.post("/add-product", async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result);
})

app.get('/products', async (req, resp) => {
    let products = await Product.find();
    if (products.length > 0) {
        resp.send(products)
    } else {
        resp.send({ result: 'No Products Found' })
    }
})


app.delete("/product/:id", async (req, resp) => {
    // resp.send(req.params.id)
    const result = await Product.deleteOne({ _id: req.params.id })
    resp.send(result);
})


app.get("/product/:id", async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        resp.send(result)
    } else {
        resp.send({ result: "No record Found" })
    }
})




app.put('/product/:id', async (req, resp) => {
    let result = await Product.updateOne(
        { id: req.params.id },
        { $set: req.body }
    )
    resp.send(result)

})


app.get('/search/:key',  async (req, resp) => {
    let result = await Product.find({
        "$or": [

            { name: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
            { company: { $regex: req.params.key } }

        ]
    });
    resp.send(result)
})


// function verifyToken(req, resp, next) {
//     console.log("middleware call")
//     let token = req.headers['Authorization'];
//     if (token) {
//         token = token.split('')[1];

//         Jwt.verify(token, jwtKey, (err, valid) => {
//             if (err) {
//                 resp.status(401).send({ result: "Please provide valid token" })
//             } else {
//                 next();
//             }
//         })
//     } else {
//         resp.status(403).send({ result: "Please add token with header" })

//     }

//     next();

// }


// 2



// function verifyToken(req, resp, next) {
//     let token = req.headers['authorization'];
//     if (token) {
//         token = token.split(' ')[1];
//         // console.log("middleware called if ", token);
//         Jwt.verify(token,jwtKey, (err, valid) => {
//             if (err) {
//                 resp.status(401).send({ result: "Please provide valid token " })
//             } else {
//                 next();
//             }

//         })
//     } else {
//         resp.status(403).send({ result: "Please add token with header" })
//     }
//     // console.log("middleware called",token);
//     // next();
// }

app.listen(5000);