const {query} = require('../db/dbQuery');
const {status} = require('../helpers/status');

/**
 * Populate the procedure rules table
 * @param req
 * @param res
 * @param next
 * @return {Promise<*|void|boolean>}
 */
exports.seedProceduresRules = async (req, res, next) => {

  const seedQuery = `INSERT INTO
  procedures_rules VALUES 
  ( default, 1234, 10, 'm', true),
  ( default, 4567, 20, 'm', true),
  ( default, 6789, 10, 'f', false),
  ( default, 6789, 10, 'm', true),
  ( default, 1234, 20, 'm', true),
  ( default, 4567, 30, 'f', true)`;

  try {
    const { rows } = await query(seedQuery);
    if (!rows) {
      return res.status(status.bad).send('Seed não teve êxito');
    }
    return res.status(status.created).send('Seed completo!');
  } catch (e) {
    console.log(e);
    return res.status(status.error).send('Ocorreu um erro inesperado');
  }

};
