const moment = require('moment');
const {query} = require('../db/dbQuery');
const {errorMessage, successMessage, status} = require('../helpers/status');
const {isEmpty, isInteger, validateAuthorization} = require('../helpers/validations');

/**
 * Get all authorizations
 * @param req
 * @param res
 * @param next
 * @return {Promise<*|void|boolean>}
 */
exports.get = async (req, res, next) => {

  const params = req.body;

  let getAllQuery = `SELECT auth.id, auth.requester, auth.age, auth.gender, auth.procedure, auth.created_on, ( SELECT COALESCE(JSON_AGG(src), '[]'::json) AS my_json_array FROM ( SELECT * FROM procedures_rules WHERE code = auth.procedure ) src) as rules, (SELECT COUNT(*) FROM authorizations ) AS total_rows FROM authorizations as auth`;
  let where = `WHERE`;
  const orderBy = 'ORDER BY id ASC';
  const pagination = ` LIMIT ${params.rpp} OFFSET ${(params.rpp * params.page) - params.rpp}`;

  let values = [];

  if (params) {

    if (params.id) {
      values.push(params.id);
      where = where !== 'WHERE' ? `${where} AND id = $${values.length}` : `WHERE id = $${values.length}`;
    }

    if (params.requester) {
      values.push(`%${params.requester}%`);
      where = where !== 'WHERE' ? `${where} AND requester ILIKE  $${values.length}` : `WHERE requester ILIKE $${values.length}`;
    }

    if (params.age) {
      values.push(params.age);
      where = where !== 'WHERE' ? `${where} AND age = $${values.length}` : `WHERE age = $${values.length}`;
    }

    if (params.gender) {
      values.push(params.gender);
      where = where !== 'WHERE' ? `${where} AND gender = $${values.length}` : `WHERE gender = $${values.length}`;
    }

    if (params.procedure) {
      values.push(params.procedure);
      where = where !== 'WHERE' ? `${where} AND procedure = $${values.length}` : `WHERE procedure = $${values.length}`;
    }

    if (where !== 'WHERE') {
      getAllQuery = `${getAllQuery} ${where}`;
    } else {
      values = null;
    }

  }

  try {

    const {rows} = await query(`${getAllQuery} ${orderBy} ${pagination}`, values);

    let authorizations = rows || [];

    for (const authorization of authorizations) {
      authorization.status = await validateAuthorization(authorization);
    }

    if (params.status) {
      authorizations = authorizations.filter(authorization => authorization.status.code === params.status);
    }

    successMessage.data = authorizations;
    const total_authorizations = authorizations[0] ? authorizations[0].total_rows : 0;
    successMessage.pagination = {page: params.page, rpp: params.rpp, total: total_authorizations};
    return res.status(status.success).send(successMessage);

  } catch (e) {
    console.log(e);
    errorMessage.error = 'Ocorreu um erro inesperado';
    return res.status(status.error).send(errorMessage);
  }

};

/**
 * Get authorizations by ID
 * @param req
 * @param res
 * @param next
 * @return {Promise<*|void|boolean>}
 */
exports.getById = async (req, res, next) => {

  const id = req.params.id;
  const getByIdQuery = ` SELECT auth.id, auth.requester, auth.age, auth.gender, auth.procedure, auth.created_on, ( SELECT COALESCE(JSON_AGG(src), '[]'::json) AS my_json_array FROM ( SELECT * FROM procedures_rules WHERE code = auth.procedure ) src) as rules FROM authorizations as auth WHERE id = $1`;
  try {

    const {rows} = await query(getByIdQuery, [id]);

    const authorization = rows[0];

    if (!authorization) {
      errorMessage.error = 'Autorização não encontrada';
      return res.status(status.notfound).send(errorMessage);
    }

    authorization.status = await validateAuthorization(authorization);

    successMessage.data = authorization;
    return res.status(status.success).send(successMessage);

  } catch (e) {
    console.log(e);
    errorMessage.error = 'Ocorreu um erro inesperado';
    return res.status(status.error).send(errorMessage);
  }

};

/**
 * Create authorization
 * @param req
 * @param res
 * @param next
 * @return {Promise<*|void|boolean>}
 */
exports.post = async (req, res, next) => {

  const {requester, age, gender, procedure} = req.body;
  const created_on = moment(new Date());

  if (isEmpty(requester)) {
    errorMessage.error = 'Campo solicitante é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (isEmpty(`${age}`)) {
    errorMessage.error = 'Campo idade é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (!isInteger(age)) {
    errorMessage.error = 'Campo idade inválido';
    return res.status(status.bad).send(errorMessage);
  }

  if (isEmpty(gender)) {
    errorMessage.error = 'Campo sexo é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (gender !== 'm' && gender !== 'f') {
    errorMessage.error = 'Campo sexo inválido';
    return res.status(status.bad).send(errorMessage);
  }

  if (isEmpty(`${procedure}`)) {
    errorMessage.error = 'Campo procedimento é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (!isInteger(procedure)) {
    errorMessage.error = 'Campo procedimento inválido';
    return res.status(status.bad).send(errorMessage);
  }

  const createAuthorizationQuery = `INSERT INTO
      authorizations(requester, age, gender, procedure, created_on)
      VALUES($1, $2, $3, $4, $5)
      returning *`;

  const values = [
    requester,
    age,
    gender,
    procedure,
    created_on,
  ];

  try {
    const {rows} = await query(createAuthorizationQuery, values);
    successMessage.data = rows[0];
    return res.status(status.created).send(successMessage);
  } catch (e) {
    console.log(e);
    errorMessage.error = 'Ocorreu um erro inesperado';
    return res.status(status.error).send(errorMessage);
  }

};

/**
 * Update authorization
 * @param req
 * @param res
 * @param next
 * @return {Promise<*|void|boolean>}
 */
exports.put = async (req, res, next) => {

  const id = req.params.id;
  const {requester, age, gender, procedure} = req.body;

  if (isEmpty(requester)) {
    errorMessage.error = 'Campo solicitante é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (isEmpty(`${age}`)) {
    errorMessage.error = 'Campo idade é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (!isInteger(age)) {
    errorMessage.error = 'Campo idade inválido';
    return res.status(status.bad).send(errorMessage);
  }

  if (isEmpty(gender)) {
    errorMessage.error = 'Campo sexo é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (gender !== 'm' && gender !== 'f') {
    errorMessage.error = 'Campo sexo inválido';
    return res.status(status.bad).send(errorMessage);
  }

  if (isEmpty(`${procedure}`)) {
    errorMessage.error = 'Campo procedimento é obrigatório';
    return res.status(status.bad).send(errorMessage);
  }

  if (!isInteger(procedure)) {
    errorMessage.error = 'Campo procedimento inválido';
    return res.status(status.bad).send(errorMessage);
  }

  const findAuthorizationQuery = 'SELECT * FROM authorizations WHERE id=$1';
  const updateAuthorization = `UPDATE authorizations
        SET requester=$1, age=$2, gender=$3, procedure=$4 WHERE id=$5 returning *`;

  const values = [
    requester,
    age,
    gender,
    procedure,
    id
  ];

  try {
    const {rows} = await query(findAuthorizationQuery, [id]);

    if (!rows[0]) {
      errorMessage.error = 'Autorização não encontrada';
      return res.status(status.notfound).send(errorMessage);
    }

    const response = await query(updateAuthorization, values);
    successMessage.data = response.rows[0];
    return res.status(status.created).send(successMessage);

  } catch (e) {
    console.log(e);
    errorMessage.error = 'Ocorreu um erro inesperado';
    return res.status(status.error).send(errorMessage);
  }

};

/**
 * Remove authorization
 * @param req
 * @param res
 * @param next
 * @return {Promise<*|void|boolean>}
 */
exports.delete = async (req, res, next) => {

  const id = req.params.id;
  const deleteQuery = 'DELETE FROM authorizations WHERE id=$1 returning *';

  try {
    const {rows} = await query(deleteQuery, [id]);

    if (!rows[0]) {
      errorMessage.error = 'Autorização não encontrada';
      return res.status(status.notfound).send(errorMessage);
    }

    successMessage.data = {};
    successMessage.data.message = 'Autorização removida com sucesso!';
    return res.status(status.success).send(successMessage);

  } catch (e) {
    console.log(e);
    errorMessage.error = 'Ocorreu um erro inesperado';
    return res.status(status.error).send(errorMessage);
  }

};

