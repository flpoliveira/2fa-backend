const express = require('express');
const { setTwoFactor, getToken, verifyToken, hasToken, checkToken, confirmTwoFactor, generateToken, checkHasToken } = require('./otp');

const app = express();
const cors = require('cors');
const otp = require('./otp');

app.use(cors());
app.use(express.json());

app.post("/settwofactor", (request, response) => {
    const {email, password} = request.body;

    const res = setTwoFactor(email, password);

    if (res) {
        response.status(200).send({status: true, result: {...res}});
    } else {
        response.status(400).send({error: "didnt worked!"});
    }
});

app.post("/confirmtwofactor", (request, response) => {
    const {email, password, type, token} = request.body;

    const isValid = confirmTwoFactor(email, password, type, token);

    if (isValid) {
        response.status(200).send({status: true, result: null});
    } else {
        response.status(400).send({status: false, message: "Code cant be confirmed"});
    }
});

app.post("/generatetoken", (request, response) => {
    const {email, password, type} = request.body;

    const token = generateToken(email, password, type);

    if (token) {
        response.status(200).send({status: true,result: {token}});
    } else {
        response.status(400).send({error: "didnt worked!"});
    }
});

app.post("/verifytoken", (request, response) => {
    const {email, password, type, token} = request.body;
    console.log(request.body);
    const isValid = verifyToken(email, password, type, token);
    

    if (isValid) {
        response.status(200).send({ status: true, result: null });
    } else {
        response.status(400).send({status: false, message: "Code cant be verified"});
    }
});

app.post("/checkhastoken", (request, response) => {
    const {email, password} = request.body;

    const object = checkHasToken(email, password);
    
    if (typeof object !== "undefined") {
        response.status(200).send({status: true, result: {...object}});
    } else {
        response.status(400).send({status: false, message: "user doesn't have two factor authentication."});
    }
});



app.listen(3333);