const otplib = require("otplib");
const database = require("../database.json");
const fs = require("fs");

const stepsForSms = 300;

/**
 * Database functions
 */

function find(email) {
    const index = database.findIndex((element, index, array) => {
        if (
            element.email === email
            // && x.password === password
        ) {
            return true;
        }
        return false;
    });

    if (index === -1) {
        return null;
    }
    return database[index];
}

function update(data){
    const index = database.findIndex((element, index, array) => {
        if (
            element.email === data.email
            // && x.password === password
        ) {
            return true;
        }
        return false;
    });

    if (index === -1) {
        database.push(data);
    } else {
        database[index] = data;
    }

    fs.writeFileSync(
        "./database.json",
        JSON.stringify(database)
    );
}

function insert(data){
    database.push(data);

    fs.writeFileSync(
        "./database.json",
        JSON.stringify(database)
    );
}
module.exports = {
    
    setTwoFactor(email, password) {
        const object = find(email);

        let data = object;
        if (data === null) {
            data = {
                email,
                password,
                hotp_secret: "",
                totp_secret: "",
                totp_secret_temporary: "",
                hasToken: {
                    app: null,
                    email: null,
                    sms: null,
                }
            }
        }

        const encodedSecret = otplib.authenticator.generateSecret();
        data.totp_secret_temporary = encodedSecret;

        /*
         * Info for creating the QRCode, if the QRCode cant be readed 
         * the secret is sent to insert it manually on app
         */
        const user = email;
        const service = "TagoIO2FA"

        update(data);

        return {
            path: otplib.authenticator.keyuri(user, service, encodedSecret),
            secret: encodedSecret,
        };
    },

    confirmTwoFactor(email, password, type, token) {
       
        const user = find(email);

        if (user === null) {
            return false;
        }

        switch(type) {
            case "app":
                try {
                    otplib.authenticator.resetOptions();
                    isValid = otplib.authenticator.verify({
                        token,
                        secret: user.totp_secret_temporary,
                    });
                    if (isValid) {
                        user.totp_secret = user.totp_secret_temporary;
                        user.hasToken[type] = true;
                        update(user);
                    }
                } catch(err) {
                    console.log(err, "error on checking app", token, user.totp_secret_temporary);
                }
                break;
            default:
                otplib.authenticator.options = {
                    step: stepsForSms,
                }
                try {
                    isValid = otplib.authenticator.verify({
                        token,
                        secret: user.hotp_secret,
                    });
                    if(isValid) {
                        const encodedSecret = otplib.authenticator.generateSecret();
                        user.hotp_secret = encodedSecret;
                        user.hasToken[type] = true;
                        update(user);
                    }
                } catch(err) {
                    console.log(err);
                }
                break;
        }

        return isValid;
    },

    generateToken( email, password, type) {
        
        const user = find(email);

        if (user === null) {
            return null;
        }

        switch (type) {
            case "app":
                otplib.authenticator.resetOptions();
                if (user.totp_secret !== "") {
                    const token = otplib.authenticator.generate(user.totp_secret);
                    return token;
                }
                return null;

            default:
                otplib.authenticator.options = {
                    step: stepsForSms,
                }
                const encodedSecret = otplib.authenticator.generateSecret();
                user.hotp_secret = encodedSecret;
                
                update(user);

                return otplib.authenticator.generate(user.hotp_secret);
        }
    },

    checkHasToken(email, password) {
        const user = find(email);

        if (user !== null && user.hasToken ) {
            const object = {
                sms: user.hasToken.sms || null,
                email: user.hasToken.email || null,
                app: user.hasToken.app || null,
            };
            return object;
        }
        return null;
    },

    verifyToken( email, password, type, token) {
        
        const user = find(email);

        let isValid = false;

        switch(type) {
            case "app":
                try {
                    otplib.authenticator.resetOptions();
                    isValid = otplib.authenticator.verify({
                        token,
                        secret: user.totp_secret
                    });
                } catch(err) {
                    console.log(err, "error on validating app", token, user.totp_secret);
                }
                break;
            default:
                otplib.authenticator.options = {
                    step: stepsForSms,
                }
                try {
                    
                    isValid = otplib.authenticator.verify({
                        token,
                        secret: user.hotp_secret
                    });
                    if(isValid) {
                        const encodedSecret = otplib.authenticator.generateSecret();
                        user.hotp_secret = encodedSecret;

                        update(user);
                    }
                } catch(err) {
                    console.log(err);
                }
                break;
        }
       
        return isValid;
    }
    
};