const express = require('express');
const cors = require('cors');
const { env } = require('../src/environments/env');
const app = express();
const bodyParser = require('body-parser');

const index = require('./routes/index');
const authorizationsRoute = require('./routes/authorizationsRoute');
const seedRoute = require('./routes/seedRoute');
const dashboardRoute = require('./routes/dashboardRoute');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Routes
 */
app.use('/', index);
app.use('/authorizations', authorizationsRoute);
app.use('/seed', seedRoute);
app.use('/dashboard', dashboardRoute);

app.listen(env.port);
