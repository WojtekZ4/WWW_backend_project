const express = require('express');
const passport = require('passport');
const router = express.Router();
const ROLES = require('../config/roles');

const changeUserRole = (role) => (req, res, next) => {
    req.body.role = role
    next();
}

const handleLogin = (res, req, next) => (err, user, info) => {
    if (err) return next(err);
    if (!user) {
        res.status(401);
        res.end(info.message);
        return;
    }
    req.logIn(user, function (err) {
        if (err) return next(err);
        res.send('Successfully signed in.');
    })
}

router.post('/sign_in_Owner', changeUserRole(ROLES.OWNER), function (req, res, next) {
    passport.authenticate('local-signup', handleLogin(res, req, next))(req, res, next);
});

router.post('/sign_in_Admin', changeUserRole(ROLES.ADMIN), function (req, res, next) {
    passport.authenticate('local-signup', handleLogin(res, req, next))(req, res, next);
});

router.post('/sign_in', changeUserRole(ROLES.USER), function (req, res, next) {
    passport.authenticate('local-signup', handleLogin(res, req, next))(req, res, next);
});

router.post('/log_in', function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        if (err) return next(err);
        if (!user) {
            res.status(401);
            res.end(info.message);
            return;
        }
        req.logIn(user, function (err) {
            if (err) return next(err);
            res.send('Successfully logged in.');
        })
    })(req, res, next);
});

router.get('/log_out', async (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.send('Not logged in.');
        return;
    }
    req.logout(function (err) {
        if (err) return next(err);
        res.send('Successfully logged out.');
    });
});

router.get('/login_status', async (req, res, next) => {
    if (req.isAuthenticated()) res.send(`You are logged in as: ${req.user.username} with role: ${req.user.role}`);
    else res.send('You are not logged in');
});

module.exports = router;







