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
    if (user == "") {
        res.send("Username cannot be empty!");
        return;
    }
    if (pass == "") {
        res.send("Password cannot be empty!");
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
                    res.send("User " + user + " already exists!");
                    db.close();
                } else {
                    bcrypt.hash(pass, BCRIPT_COST, function(err, hash) {
                        if (err) {
                            throw err;
                        }
                        var userObject = {username: user, password: hash};
                        collection.insert(userObject, function(err, data){
                            if (err) {
                                res.send("Error! " + err);
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
        res.send(req.user.username);
    } else {
        res.send(false);
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
