const {Pool} = require('pg');
const {env} = require('../environments/env');

const databaseConfig = {connectionString: env.database_url};
const pool = new Pool(databaseConfig);

module.exports.pool = pool;
