const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
    firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String
    },
    yearOfBirth: {
        required: false,
        type: Number
    }
})

module.exports = mongoose.model('Coach', coachSchema)