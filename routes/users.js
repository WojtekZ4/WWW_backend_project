const express = require('express');
const User = require('../models/users');
const router = express.Router();
const ROLES = require('../config/roles');

const verifyRole = (...roles) => (req, res, next) => {
    console.log('???')
    if (!req.isAuthenticated()) {
        res.send('Not logged in.');
        return;
    }

    const hasRole = roles.find(role => req.user.role === role)

    if (hasRole) return next();
    else res.send('Not authorized.');
}

router.get('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) res.status(404).send("No user found");
        else res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const users = await User.find({});

        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/', verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        const user = new User(req.body);
        user.password = user.generateHash(user.password);
        await user.save();

        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/:id', verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});

        if (!user) res.status(404).send("No user found");
        else {
            if (req.body.password) user.password = user.generateHash(user.password);

            await user.save();
            res.send(user);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/:id', verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) res.status(404).send("No user found");
        else res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/', verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        await User.deleteMany({})

        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = {users: router, verifyRole};







