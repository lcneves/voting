var PORT = 8080,
    URL = 'mongodb://localhost:27017/voting',
    SESSION_KEY = 'ThisIsN0tAKeyStup0d',
    BCRIPT_COST = 8,
    mongo = require('mongodb').MongoClient,
    objectID=require('mongodb').ObjectID,
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyparser = require('body-parser'),
    session = require('express-session'),
    express = require('express'),
    app = express();

// Testing requirements
var util = require('util');

app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
    },
    secret: SESSION_KEY
}));
app.use(passport.initialize());
app.use(passport.session());

app.post('/register', function (req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    var passRepeat = req.body.passwordRepeat;
    var name = req.body.realname;
    if (user == "") {
        res.send("Username cannot be empty");
        return;
    }
    if (pass == "") {
        res.send("Password cannot be empty");
        return;
    }
    if (passRepeat == "") {
        res.send("Please repeat the password");
        return;
    }
    if (name == "") {
        res.send("Please enter your name");
        return;
    }
    if (pass != passRepeat) {
        res.send("Passwords do not match");
        return;
    }
    mongo.connect(URL, function(err, db) {
        if (err) { throw err; }
        var collection = db.collection('users');
        collection.findOne(
            {username: user},
            function(err, document) {
                if (err) { throw err; }
                if (document) {
                    res.send("User " + user + " already exists");
                    db.close();
                } else {
                    bcrypt.hash(pass, BCRIPT_COST, function(err, hash) {
                        if (err) {
                            throw err;
                        }
                        var userObject = {username: user, password: hash, realname: name};
                        collection.insert(userObject, function(err, data){
                            if (err) {
                                res.send("Server error!");
                                db.close();
                                throw err;
                            }
                            res.send(true);
                            db.close();
                        });
                    });
                }
            }
        );
    });
});

app.post('/login', function (req, res) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            res.status(500).send(err);
            return err;
        }
        if (user) {
            req.logIn(user, function() {
                res.status(200).send(user);
            });
        }
        else if (info) {
            res.send(info);
        }
    })(req, res);
});

app.post('/check', function (req, res) {
    if (req.user) {
        res.send(req.user.realname);
    } else {
        res.send(false);
    }
});

app.post('/new-poll', function (req, res) {
    console.log(util.inspect(req));
    console.log(util.inspect(req.body));
    var questionString = req.body.question;
    if (questionString == ''){
        res.send({
            error: true,
            message: "Your poll needs a question"
        });
        return;
    }
    var userID;
    if (req.user) { userID = objectID(req.user._id); }
    else {
        res.send({
            error: true,
            message: "User is not authenticated. Please log in!"
        });
        return;
    }
    var optionsArray = [];
    var formOptionsArray = JSON.parse(req.body.options);
    formOptionsArray.forEach(function(element, index, array) {
        if (element.name != '') {
            optionsArray.push({
                option: element.name,
                voters: []
            });
        }
    });
    console.log(JSON.stringify(optionsArray));
    if (optionsArray.length < 2) {
        res.send({
            error: true,
            message: "Please fill in at least two options"
        });
        return;
    } else {
        mongo.connect(URL, function(err, db) {
            if (err) { throw err; }
            var collection = db.collection('polls');
            var pollObject = {question: questionString, options: optionsArray, userID: userID };
            collection.insert(pollObject, function(err, data){
                if (err) {
                    res.send({
                        error: true,
                        message: "Server error. Sorry!"
                    });
                    db.close();
                    throw err;
                }
                res.send({
                    error: false,
                    message: "Poll " + questionString + " successfully submitted!"
                });
                console.log("Poll inserted! Data is: " + JSON.stringify(data));
                db.close();
            });
        });
    }
});

app.post('/logout', function (req, res) {
    req.logout();
    res.send('Logout');
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        mongo.connect(URL, function(err, db) {
            if (err) { throw err; }
            var collection = db.collection('users');
            collection.findOne({ username: username }, function(err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                } else {
                    bcrypt.compare(password, user.password, function(err, res) {
                        if (err) { throw err; }
                        if (res) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect password.' });
                        }
                    });
                }
            });
        });
    }
));

passport.serializeUser(function(user, done) {
    console.log('Called serialize!');
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    console.log('Called deserialize!');
    mongo.connect(URL, function(err, db) {
        if (err) { throw err; }
        var collection = db.collection('users');
        collection.findOne({_id: objectID(id)}, function(err, user) {
            if (err) { throw err; }
            if (user) {
                console.log('User found! _id: ' + id);
                done(err, user);
                db.close();
            } else {
                console.log('User not found! _id: ' + id);
                db.close();
            }
        });
    });
});

app.listen(PORT);
