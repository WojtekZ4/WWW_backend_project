const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    time: {
        required: false,
        type: Date
    },
    clubId: {
        required: true,
        type: String
    },
    coachId: {
        required: true,
        type: String
    }
})

module.exports = mongoose.model('Event', eventSchema)