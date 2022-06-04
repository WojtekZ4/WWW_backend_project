const express = require("express");
const router = express.Router();
const ROLES = require("../config/roles");
const {verifyRole} = require("./users");
const upload = require("../config/file_upload");
const dbConfig = require("../config/database");
// const {port} = require("../index");
const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const url = dbConfig.url;
const mongoClient = new MongoClient(url);
const port = process.env.PORT || 3000
const filesBaseUrl = `http://localhost:${port}/api/files/`;
router.post("/upload", async (req, res) => {
    try {
        await upload(req, res);
        if (req.file === undefined) {
            return res.send({
                message: "You must select a file.",
            });
        }
        return res.send({
            message: "File has been uploaded.",
        });
    } catch (error) {
        return res.send({
            message: "Error when trying upload image: ${error}",
        });
    }
});

router.get("/", verifyRole(ROLES.OWNER, ROLES.ADMIN), async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const images = database.collection(dbConfig.imgBucket + ".files");

        const cursor = images.find({});
        if ((await cursor.count()) === 0) {
            return res.status(500).send({
                message: "No files found!",
            });
        }

        let fileInfos = [];
        await cursor.forEach((doc) => {
            fileInfos.push({
                name: doc.filename,
                url: filesBaseUrl + doc.filename,
            });
        });
        return res.status(200).send(fileInfos);
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
});

router.get("/:name", verifyRole(ROLES.OWNER, ROLES.ADMIN, ROLES.USER), async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const bucket = new GridFSBucket(database, {
            bucketName: dbConfig.imgBucket,
        });
        let downloadStream = bucket.openDownloadStreamByName(req.params.name);
        downloadStream.on("data", function (data) {
            return res.status(200).write(data);
        });
        downloadStream.on("error", function (err) {
            return res.status(404).send({message: "Cannot download the Image!"});
        });
        downloadStream.on("end", () => {
            return res.end();
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
});

router.delete("/:name", verifyRole(ROLES.OWNER), async (req, res) => {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbConfig.database);
        const bucket = new GridFSBucket(database, {
            bucketName: dbConfig.imgBucket,
        });

        const documents = await bucket.find({
            filename: req.params.name
        }).toArray();

        if (documents.length === 0) {
            throw new Error('FileNotFound');
        }

        documents.map(doc => {
            return bucket.delete(doc._id);
        })

        res.status(200).send();
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
});

module.exports = router;
