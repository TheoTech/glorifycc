# spfio-songdatabase
## This app will help you prepare worship during sunday service. No more copy and paste. Just click and it will get the slides ready for you.
## Website link: https://glorify.cc/

# dev setup
To run this on your local machine, you need to have mongodb running separately, and the file `config/default.json` in your project directory which looks like the following only with your SendGrid credentials filled in:
```json
{
  "emailVerification": {
    "user": "",
    "pass": "",
    "verificationURL": "http://localhost:8000/user/signup/email-verification/${URL}"
  },
  "Session": {
    "key": ""
  }
}
```
