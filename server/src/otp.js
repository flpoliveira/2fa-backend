const otplib = require("otplib");
const database = require("../database.json");
const fs = require("fs");

const stepsForSms = 300;

module.exports = {
    
    setTwoFactor(name, email, password) {
        const index = database.findIndex((element, index, array) => {
            if (
                element.email === email
                // && x.name === name
                // && x.password === password
            ) {
                return true;
            }
            return false;
        });

        if (index === -1) {
            return null;
        }

        if (database[index].secret) {
            return null;
        } else {
            const encodedSecret = otplib.authenticator.generateSecret();
            database[index].totp_secret = encodedSecret;
        }

        fs.writeFileSync(
            "./database.json",
            JSON.stringify(database)
        );
        const user = email;
        const service = "TagoIO2FA"
        return otplib.authenticator.keyuri(user, service, database[index].totp_secret);
    },
    getToken(name, email, password, type) {
        const index = database.findIndex((element, index, array) => {
            if (
                element.email === email
                // && element.password === password
            ) {
                return true;
            }
            return false;
        });
        if (index === -1) {
            return null;
        }

        switch (type) {
            case "app":
                otplib.authenticator.resetOptions();
                const token = otplib.authenticator.generate(database[index].totp_secret);
                return token;

            default:
                otplib.authenticator.options = {
                    step: stepsForSms,
                }
                const encodedSecret = otplib.authenticator.generateSecret();
                database[index].hotp_secret = encodedSecret;
                fs.writeFileSync(
                    "./database.json",
                    JSON.stringify(database)
                );
                return otplib.authenticator.generate(database[index].hotp_secret);
        }
    },
    verifyToken(name, email, password, type, token) {
        const index = database.findIndex((element, index, array) => {
            if (
                element.email === email
                // && element.password === password
            ) {
                return true;
            }
            return false;
        });
        if (index === -1) {
            return null;
        }
        let isValid = false;
        switch(type) {
            case "app":
                try {
                    otplib.authenticator.resetOptions();
                    isValid = otplib.authenticator.verify({
                        token,
                        secret: database[index].totp_secret
                    });
                } catch(err) {
                    console.log(err);
                }
                break;
            default:
                otplib.authenticator.options = {
                    step: stepsForSms,
                }
                try {
                    
                    isValid = otplib.authenticator.verify({
                        token,
                        secret: database[index].hotp_secret
                    });
                    if(isValid) {
                        const encodedSecret = otplib.authenticator.generateSecret();
                        database[index].hotp_secret = encodedSecret;

                        fs.writeFileSync(
                            "./database.json",
                            JSON.stringify(database)
                        );
                    }
                    console.log(otplib.authenticator.generate(database[index].hotp_secret));
                } catch(err) {
                    console.log(err);
                }
                break;
        }
       
        
        return isValid;

    }
    
};