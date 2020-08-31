const otplib = require("otplib");
const database = require("../database.json");
const fs = require("fs");
const { encode } = require("punycode");

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
            database[index].secret = encodedSecret;
            database[index].counter_hotp = 0;
        }

        fs.writeFileSync(
            "./database.json",
            JSON.stringify(database)
        );
        const user = email;
        const service = "TagoIO2FA"
        return otplib.authenticator.keyuri(user, service, database[index].secret);
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
                const token = otplib.totp.generate(database[index].secret);
                console.log("app", database[index].secret, token);
                return token;

            default:
                database[index].counter_hotp++;
                fs.writeFileSync(
                    "./database.json",
                    JSON.stringify(database)
                );
                return otplib.hotp.generate(database[index].secret, database[index].counter_hotp);
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
        switch (type) {
            case "app":
                const secret = otplib.authenticator.decode(database[index].secret);
                try {
                    isValid = otplib.authenticator.check(database[index].secret, token);
                    console.log(otplib.authenticator.generate(secret));
                    console.log(secret, token);
                } catch(err) {
                    console.log(err);
                }
                
                return isValid;

            default:
                isValid = otplib.hotp.check(
                    token, 
                    database[index].secret, 
                    database[index].counter_hotp
                );

                if (isValid) {
                    database[index].counter_hotp++;

                    fs.writeFileSync(
                        "./database.json",
                        JSON.stringify(database)
                    );
                }
                return isValid;
        }

    }
    
};