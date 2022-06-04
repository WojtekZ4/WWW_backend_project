const util = require("util");
const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
const dbConfig = require("./database");

const storage = new GridFsStorage({
    url: dbConfig.url + dbConfig.database,
    options: {useNewUrlParser: true, useUnifiedTopology: true},
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];
        if (match.indexOf(file.mimetype) === -1) {
            return `${Date.now()}-WWW-${file.originalname}`;
        }
        return {
            bucketName: dbConfig.imgBucket,
            filename: `${Date.now()}-WWW-${file.originalname}`
        };
    }
});
const uploadFiles = multer({storage: storage}).single("file");
const uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
