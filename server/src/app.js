const express = require('express');
const { setTwoFactor, getToken, verifyToken } = require('./otp');

const app = express();

app.use(express.json());

app.post("/settwofactor", (request, response) => {
    const {name, email, password} = request.body;

    const otpauth = setTwoFactor(name, email, password);

    if (otpauth) {
        response.status(200).send({success: otpauth});
    } else {
        response.status(400).send({error: "didnt worked!"});
    }
});

app.post("/gettoken", (request, response) => {
    const {name, email, password, type} = request.body;

    const token = getToken(name, email, password, type);

    if (token) {
        response.status(200).send({ token });
    } else {
        response.status(400).send({error: "didnt worked!"});
    }
});

app.post("/verifytoken", (request, response) => {
    const {name, email, password, type, token} = request.body;

    const isValid = verifyToken(name, email, password, type, token);

    if (isValid) {
        response.status(200).send({ success: "it worked!" });
    } else {
        response.status(400).send({error: "didnt worked!"});
    }
});


app.listen(3333);