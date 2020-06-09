const {query} = require('../db/dbQuery');
const {errorMessage, successMessage, status} = require('../helpers/status');
const {validateAuthorization} = require('../helpers/validations');

/**
 * Get dashboard
 * @param req
 * @param res
 * @param next
 * @return {Promise<*|void|boolean>}
 */
exports.get = async (req, res, next) => {

  const getAllQuery = `SELECT auth.id, auth.requester, auth.age, auth.gender, auth.procedure, auth.created_on, ( SELECT COALESCE(JSON_AGG(src), '[]'::json) AS my_json_array FROM ( SELECT * FROM procedures_rules WHERE code = auth.procedure ) src) as rules FROM authorizations as auth`;

  try {
    const { rows } = await query(getAllQuery);

    let authorizations = rows || [];

    for (const authorization of authorizations) {
      authorization.status = await validateAuthorization(authorization);
    }

    const authorized = authorizations.filter(authorization => authorization.status.code === 'authorized');

    successMessage.data = {
      total: authorizations.length || 0,
      authorized: authorized.length || 0,
      refused: (authorizations.length - authorized.length) || 0
    };

    return res.status(status.created).send(successMessage);
  } catch (e) {
    console.log(e);
    errorMessage.error = 'Ocorreu um erro inesperado';
    return res.status(status.error).send(errorMessage);
  }

};
