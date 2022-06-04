const express = require('express');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const app = express();
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const dbConfig = require("./config/database");
const mongoString = dbConfig.url + dbConfig.database

app.use(session({secret: "titanic"}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);
require('dotenv').config();

mongoose.connect(mongoString);
const database = mongoose.connection

app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

const coaches = require('./routes/coaches');
const clubs = require('./routes/clubs');
const events = require('./routes/events');

const {users} = require("./routes/users");
const auth = require("./routes/auth");
const files = require("./routes/files");

app.use('/api/coaches', coaches);
app.use('/api/clubs', clubs);
app.use('/api/events', events);

app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/files', files);

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`));

