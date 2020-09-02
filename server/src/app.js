const express = require('express');
const { setTwoFactor, getToken, verifyToken, hasToken } = require('./otp');

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.post("/settwofactor", (request, response) => {
    const {email, password} = request.body;

    const otpauth = setTwoFactor(email, password);

    if (otpauth) {
        response.status(200).send({success: otpauth});
    } else {
        response.status(400).send({error: "didnt worked!"});
    }
});

app.post("/gettoken", (request, response) => {
    const {email, password, type} = request.body;

    const token = getToken(email, password, type);

    if (token) {
        response.status(200).send({ token });
    } else {
        response.status(400).send({error: "didnt worked!"});
    }
});

app.post("/verifytoken", (request, response) => {
    const {email, password, type, token} = request.body;

    console.log(request.body);
    const isValid = verifyToken(email, password, type, token);

    if (isValid) {
        response.status(200).send({ success: "it worked!" });
    } else {
        console.log("error");
        response.status(400).send({ error: "it didnt work!"});
    }
});

app.post("/hastoken", (request, response) => {
    const {email, password} = request.body;
    console.log(request.body);

    if (hasToken(email, password)) {
        response.status(200).send({success: "This user has a token"});
    } else {
        response.status(400).send({error: "This user dont have a token"});
    }
});


app.listen(3333);