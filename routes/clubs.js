const express = require('express');
const router = express.Router();
const Club = require('../models/clubs');
const Event = require('../models/events');
const ROLES = require("../config/roles");
const {verifyRole} = require("./users");
const upload = require("../config/file_upload");
const port = process.env.PORT || 3000
const filesBaseUrl = `http://localhost:${port}/api/files/`;
const uploadFiles = async (req, res, next) => {
    try {
        await upload(req, res);

        // if (req.file === undefined) {
        //     return res.send({
        //         message: "You must select a file.",
        //     });
        // }
        return next()
    } catch (error) {
        console.log(error);
        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
};

router.get('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN, ROLES.USER), async (req, res) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) res.status(404).send("No club found");
        else res.send(club);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/', verifyRole(ROLES.OWNER, ROLES.ADMIN, ROLES.USER), async (req, res) => {
    try {
        const clubs = await Club.find({});

        res.send(clubs);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/', verifyRole(ROLES.OWNER, ROLES.ADMIN), uploadFiles, async (req, res) => {
    try {
        const club = new Club(req.body);
        if (req.file) club.imageLink = filesBaseUrl + req.file.filename

        await club.save();

        res.send(club);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN), uploadFiles, async (req, res) => {
    try {
        console.log(req)
        const club = await Club.findByIdAndUpdate(req.params.id, req.body, {new: true});

        if (!club) res.status(404).send("No club found");
        else {
            if (req.file) club.imageLink = filesBaseUrl + req.file.filename

            await club.save();
            res.send(club);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/:id', verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        const oldClub = await Club.findById(req.params.id);
        if (!oldClub) {
            res.status(404).send("No club found");
            return;
        }
        const connectedEvents = await Event.count({clubId: oldClub._id})

        if (connectedEvents >= 1) {
            res.status(405).send("Club is connected to some Event!");
            return;
        }

        const deletedClub = await oldClub.remove()

        res.send(deletedClub);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/', verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        await Club.deleteMany({})

        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;








