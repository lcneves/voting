var PORT = 8080,
    URL = 'mongodb://localhost:27017/voting',
    SESSION_KEY = 'ThisIsN0tAKeyStup0d',
    mongo = require('mongodb').MongoClient,
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyparser = require('body-parser'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    express = require('express'),
    app = express();

app.set('views', 'views');
app.set('view engine', 'jade');
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use(cookieParser(SESSION_KEY));
app.use(session({
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 60000
    },
    secret: SESSION_KEY
}));
app.use(flash());
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

app.post('/login',
  passport.authenticate('local', { successRedirect: '/login',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

app.get('/login', function(req, res){
    res.send('login', { message: req.flash('error') });
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

app.listen(PORT);
