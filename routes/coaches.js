const express = require('express');
const router = express.Router();
const Coach = require('../models/coaches');
const ROLES = require("../config/roles");
const {verifyRole} = require("./users");
const Event = require("../models/events");

router.get('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN, ROLES.USER), async (req, res) => {
    try {
        const coach = await Coach.findById(req.params.id);

        if (!coach) res.status(404).send("No coach found");
        else res.send(coach);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/', verifyRole(ROLES.OWNER, ROLES.ADMIN, ROLES.USER), async (req, res) => {
    try {
        const coaches = await Coach.find({});

        res.send(coaches);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const coach = new Coach(req.body);
        await coach.save();

        res.send(coach);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const coach = await Coach.findByIdAndUpdate(req.params.id, req.body, {new: true});

        if (!coach) res.status(404).send("No coach found");
        else {
            res.send(coach);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const oldCoach = await Coach.findById(req.params.id);
        if (!oldCoach) {
            res.status(404).send("No coach found");
            return;
        }
        const connectedEvents = await Event.count({coachId: oldCoach._id})

        if (connectedEvents >= 1) {
            res.status(405).send("Coach is connected to some Event!");
            return;
        }

        const deletedCoach = await oldCoach.remove()

        res.send(deletedCoach);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/', verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        await Coach.deleteMany({})

        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;








