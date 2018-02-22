# spfio-songdatabase
## This app will help you prepare worship during sunday service. No more copy and paste. Just click and it will get the slides ready for you.
## Website link: https://glorify.cc/

# dev setup
To run this on your local machine:

1. Download and install Node.js and MongoDB
2. Run `npm install --save` to install all the node packages you're using. You'll need to repeat this every time you pull others' changes that require new packages.
3. Add the file `config/default.json` in your project directory which looks like the following only with your SendGrid credentials filled in:

    ```json
    {
      "emailVerification": {
        "user": "",
        "pass": "",
        "verificationURL": "http://localhost:8000/user/signup/email-verification/${URL}"
      },
      "Session": {
        "key": ""
      },
      "ourEmail": "glorify@theotech.org"
    }
    ```

4. Start `mongod` which must run separately
5. From the glorifycc directory, run `gulp` to start up the server.  (If for some reason step 2 didn't properly install gulp, run `npm install -g gulp` to install gulp.)
6. Run `node bin/dev-setup` to populate your local database (Note: If you already ran this once, running this again could create duplicate songs in your database)
7. Go to http://localhost:8000 to test the webapp
