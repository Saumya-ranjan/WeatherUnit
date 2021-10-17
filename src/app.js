require('dotenv').config()
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 8000;
const requestPromise = require('request-promise')
const bodyParser = require('body-parser')
const mongodb = process.env.MONGODB

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate')

// const requests = require('requests');
//using body parser in the app
app.use(bodyParser.urlencoded({
    extended: true
}));



//***********************************Public static path*******************************************
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partials_path);

app.use(express.static(static_path));



//*****************************Using Session *************************************************************
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,

}))

app.use(passport.initialize());
app.use(passport.session());

//*******************************mongoose (database)***********************************************
mongoose.connect(mongodb)

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    facebookId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)


const User = new mongoose.model("User", userSchema); //user as a collection name

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

//********************************Google Authentication******************************************************* */
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:8000/auth/google/weatherUnit",
        // This option tells the strategy to use the userinfo endpoint instead
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({
            username: profile.displayName,
            googleId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));

//****************************facebook Authentication***********************************************************/
passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "https://localhost:3000/auth/facebook/weatherUnit"
    },
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({
            facebookId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));

//*********************************Routing**********************************************************
app.get("/auth/google",
    passport.authenticate('google', {
        scope: ['profile']
    }) //google strategy
)
app.get('/auth/google/weatherUnit',
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/home');
    });

app.get('/auth/facebook',
    passport.authenticate('facebook'));

app.get('/auth/facebook/weatherUnit',
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/home');
    });

app.get("", (req, res) => {
    res.render("index1");
})
app.get("/home", (req, res) => {
    res.render("index");
})
app.get("/login", (req, res) => {
    res.render("login")
})
app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/about", (req, res) => {
    res.render("about");
})

app.get("/contacts", (req, res) => {
    res.render("contacts");
})

app.get("/weather", (req, res) => {
    res.render("weather");
})

app.get("/map", (req, res) => {
    res.render("map");
})


app.get("/functions", (req, res) => {
    res.render("functions")
})

app.get("/report", (req, res) => {
    res.render("report")
})
//joining with flask server

app.get('/prediction', function (req, res) {
    res.redirect('http://127.0.0.1:5000/')
    // requestPromise('http://127.0.0.1:8000/', function (error, response, body) {
    //     console.error('error:', error); // Print the error
    //     console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //     console.log('body:', body); // Print the data received
    //     res.send(body); //Display the response on the website
    // });
});

app.get("/home", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("index")
    } else {
        res.redirect("/login")
    }
})
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/")
})


app.get("*", (req, res) => {
    res.render("404error", {
        errorMsg: 'Opps! Page Not Found'
    });
})





//***********post section from register and login***********************************

app.post("/report", function (req, res) {

    date = new Date(req.body.date)
    month = ("0" + (date.getMonth() + 1)).slice(-2)
    year = date.getFullYear()
    day = ("0" + date.getDate()).slice(-2)
    console.log(day, month)


    res.redirect('http://cwc.gov.in/sites/default/files/dfsitrepca-' + day + month + year + '.pdf')
})


app.post("/register", function (req, res) {

    User.register({
            username: req.body.username
        }, req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.redirect('/register')
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/home")
                })
            }
        })

})

app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function (err) {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/home")
            })
        }
    })
})

// listening to port
app.listen(port, () => {
    console.log(`listening to port at ${port}`)
})