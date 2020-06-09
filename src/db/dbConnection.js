const {pool} = require('./pool');

pool.on('connect', () => {
  console.log('connected to the db');
});

/**
 * Create Authorization Table
 */
const createAuthorizationTable = () => {
  const authorizationCreateQuery = `CREATE TABLE IF NOT EXISTS authorizations
  (id SERIAL PRIMARY KEY, 
  requester TEXT NOT NULL, 
  age INTEGER NOT NULL, 
  gender VARCHAR(1) NOT NULL, 
  procedure INTEGER NOT NULL,
  created_on DATE NOT NULL)`;

  pool.query(authorizationCreateQuery)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
};

/**
 * Create Procedure Rules Table
 */
const createProcedureTable = () => {
  const procedureCreateQuery = `CREATE TABLE IF NOT EXISTS procedures_rules
  (id SERIAL PRIMARY KEY, 
  code INTEGER NOT NULL,
  age INTEGER NOT NULL, 
  gender VARCHAR(1) NOT NULL,
  accept BOOL NOT NULL)`;

  pool.query(procedureCreateQuery)
    .then((res) => {
      console.log(res);
      pool.end();
    })
    .catch((err) => {
      console.log(err);
      pool.end();
    });
};

/**
 * Create All Tables
 */
const createAllTables = () => {
  createAuthorizationTable();
  createProcedureTable();
};


pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});

exports.createAllTables = createAllTables;

require('make-runnable');
