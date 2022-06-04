const express = require('express');
const router = express.Router();
const Event = require('../models/events');
const Club = require('../models/clubs');
const Coach = require('../models/coaches');
const ROLES = require("../config/roles");
const {verifyRole} = require("./users");

router.get('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN, ROLES.USER), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) res.status(404).send("No event found");
        else res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/', verifyRole(ROLES.OWNER, ROLES.ADMIN, ROLES.USER), async (req, res) => {
    try {
        const events = await Event.find({});

        res.send(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const event = new Event(req.body);

        const connectedClub = await Club.findById(event.clubId)
        const connectedCoach = await Coach.findById(event.coachId)

        if (!connectedClub) {
            res.status(405).send("No connected Club detected.");
            return;
        }
        if (!connectedCoach) {
            res.status(405).send("No connected Coach detected.");
            return;
        }

        await event.save();

        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const oldEvent = await Event.findById(req.params.id);

        if (!oldEvent) res.status(404).send("No event found");
        else {
            const newEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {new: true});

            const connectedClub = await Club.findById(newEvent.clubId)
            const connectedCoach = await Coach.findById(newEvent.coachId)

            if (!connectedClub) {
                res.status(405).send("No connected Club detected.");
                return;
            }
            if (!connectedCoach) {
                res.status(405).send("No connected Coach detected.");
                return;
            }

            res.send(newEvent);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) res.status(404).send("No event found");
        else res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/', verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        await Event.deleteMany({})

        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;








