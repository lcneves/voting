var PORT = 8080,
    URL = 'mongodb://localhost:27017/voting',
    SESSION_KEY = 'ThisIsN0tAKeyStup0d',
    mongo = require('mongodb').MongoClient,
    objectID=require('mongodb').ObjectID,
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
    console.log(req.body);
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
    var userObject = {username: user, password: pass};
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
                    collection.insert(userObject, function(err, data){
                    if (err) {
                        res.send("Error! " + err);
                        db.close();
                        throw err;
                    }
                    console.log("User added as " + JSON.stringify(data));
                    res.send("User added as " + JSON.stringify(data));
                    db.close();
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
                console.log('req.logIn: err = ' + err + '. user = ' + JSON.stringify(user));
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
        res.send(null);
    }
});

app.post('/logout', function (req, res) {
    console.log('Got logout!');
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
                }
                if (user.password != password) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
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

app.get('/users', function(req, res) {
//    res.send('Welcome, ' + req.user.username);
    res.send('Welcome!');
});

app.listen(PORT);
