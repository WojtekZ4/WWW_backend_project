const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    address: {
        required: true,
        type: String
    },
    imageLink: {
        required: false,
        type: String
    }
})

module.exports = mongoose.model('Club', clubSchema)