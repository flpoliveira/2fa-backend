#### 2FA Backend on NodeJS

Implementing a sample NodeJS Backend for 2FA authentication.

#### [HTOP - RFC 4226 - HMAC-Based One-Time Password Algorithm](https://tools.ietf.org/html/rfc4226 "RFC 4226")


<img src="/img/OneTimePassword.png">

* How the Algorithm works? 
    * We encrypt a secret and a counter.
        * Secret will be Base 32 Encoded
            * Will be encoded to a QR code
            * Authenticator will take that secret 
    * The encryption will generate a Hash with 160bits.
    * We truncate that Hash to 31 bits
        * Where do we take this bits from?
            * We take the last 4 bits, these will point wich place we are going to take 31 bits.
            * For example:
            * `1f`, `86`, `98`, `69`, `0e`, `02`, `ca`, `16`, `61`, `85`, `50`, `ef`, `7f`, `19`, `da`, `8e`, `94`, `5b`, `55`, `5a`
                * The last 4 bits is `a` and it is equal to 10. So we are going to take the 31 bits starting from the byte 10, and it will be `50`,`ef`,`7f`,`19` this 4 bytes will be shifted to a 32 bit Integer, and that will be our *OTP*.

    * Read this 31 bit as Integer
    * In this Integer we get only the last six or eight digits using mod 10^6 | mod 10^8
    * That's it, the basic functionality of *HTOP*.
* How sincronize the counter on the Authenticator and the Server ?
    * We could use Time for it, sincronizing Time on server and client side we are going to have the same one time password and this is how *TOTP* (Time Based One-Time Password Algorithm) works.
        * If clocks are not sincronized we will have a bad user experience.



#### [TOTP - RFC 6238 - Time Based One-Time Password Algorithm](https://tools.ietf.org/html/rfc6238 "RFC 6238")



#### References

- [How does the Google Authenticator Work? HOTP TOTP Difference | 2FA Authentication](https://www.youtube.com/watch?v=XYVrnZK5MAU "Gabriel Zimmermann's video explain how it basic work")
- [HOTP vs TOTP: What's the Difference](https://www.microcosm.com/blog/hotp-totp-what-is-the-difference)
- [Issue at otplib that i need to checkout](https://github.com/yeojz/otplib/issues/362)

#### Google input for 2FA code

```html
<input type="text" pattern="[0-9]{6}" class="whsOnd zHQkBf" jsname="YPqjbf" autocomplete="off" tabindex="0" aria-label="Digite o código" maxlength="6" autofocus="" data-initial-value="020090" badinput="false" dir="ltr">
```

#### Otpauth QRCode Google
<code>
otpauth://totp/Google%3Aemail%40gmail.com?secret=NotBase32Secret&issuer=Google
</code>