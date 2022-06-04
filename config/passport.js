const LocalStrategy = require('passport-local').Strategy;
const Users = require('../models/users');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Users.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
        },
        function (req, username, password, done) {
            Users.findOne({'username': username}, function (err, user) {
                if (err)
                    return done(err);
                if (req.isAuthenticated())
                    return done(null, false, {message: 'Already logged in'});
                if (user) {
                    return done(null, false, {message: 'That username is already taken.'});
                } else {
                    const newUser = new Users();
                    newUser.username = username;
                    newUser.password = newUser.generateHash(password);
                    newUser.role = req.body.role
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true,
        },
        function (req, username, password, done) {
            Users.findOne({'username': username}, function (err, user) {
                if (err)
                    return done(err);
                if (req.isAuthenticated())
                    return done(null, false, {message: 'Already logged in'});
                if (!user)
                    return done(null, false, {message: 'No user found.'});
                if (!user.validPassword(password))
                    return done(null, false, {message: 'Wrong password.'});
                return done(null, user);
            });
        }));

};
