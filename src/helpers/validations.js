const {query} = require('../db/dbQuery');

/**
 * Check if value is empty
 * @param value
 * @return {boolean}
 */
const isEmpty = (value) => {
  if (!value) {
    return true;
  }
  return !value.replace(/\s/g, '').length;
};

/**
 * Check if value is integer
 * @param value
 * @return {boolean}
 */
const isInteger = (value) => {
  const er = /^-?[0-9]+$/;
  return er.test(value);
};

/**
 * Validate whether an authorization was accepted or not
 * @param authorization
 * @return {Promise<{code: string, reasons: []}>}
 */
const validateAuthorization = async (authorization) => {

  const rules = authorization.rules || [];

  const status = {code: 'refused', reasons: []};

  if (!rules || rules.length === 0) {
    status.reasons.push('Procedimento não listado');
  }

  rules.forEach(rule => {

    if (rule.accept) {

      if (authorization.age === rule.age && authorization.gender === rule.gender) {
        status.code = 'authorized';
      }

      if (authorization.age !== rule.age) {
        status.reasons.push('Idade não corresponde aos requisitos do procedimento');
      }

      if (authorization.gender !== rule.gender) {
        status.reasons.push('Sexo não corresponde aos requisitos do procedimento');
      }

    } else {

      if (authorization.age === rule.age && authorization.gender === rule.gender) {
        status.reasons.push('Idade não corresponde aos requisitos do procedimento');
        status.reasons.push('Sexo não corresponde aos requisitos do procedimento');
      }

    }

  });

  if (status.code === 'authorized') {
    status.reasons = [];
  }

  status.reasons = status.reasons.filter((item, index) => status.reasons.indexOf(item) === index);

  return status;

};

module.exports = {
  isEmpty,
  isInteger,
  validateAuthorization
};
