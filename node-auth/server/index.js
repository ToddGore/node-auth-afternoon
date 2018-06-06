require('dotenv').config();
const express = require('express')
    , session = require('express-session')
    , passport = require('passport')
    , Auth0Strategy = require('passport-auth0')
    , students = require('./students.json');

const app = express();
const {
    SERVER_PORT,
    SESSION_SECRET,
    DOMAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    CALLBACK_URL
} = process.env;

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Order matters for the next three items.
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Auth0Strategy({
    domain: DOMAIN,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: 'openid email profile'
}, (accessToken, refreshToken, extraParams, profile, done) => {
    done(null, profile);
}));

// serialize write data to our session
passport.serializeUser((user, done) => {
    done(null, { clientID: user.id, email: user._json.email, name: user._json.name });
});

// The entire profile is being written written out on REQ.
// You can access it by req.user
// whatever is passed out of done, is on req.session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// This is the function that users go to when clicking login
// app.get('/login', passport.authenticate('auth0'))

// This is the function the user is returned to after authentication
app.get('/login', passport.authenticate('auth0', {
    successRedirect: '/students', failureRedirect: '/login', connection: 'github'
}
));

function authenticated(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.sendStatus(401);
    }
}

app.get('/students', authenticated, (req, res, next) => {
    res.status(200).send(students)
});

app.listen(SERVER_PORT, () => {
    console.log(`Listening on port: ${SERVER_PORT}`)
})


var str = "Hello world, welcome to the universe.";
var n = str.includes("world");