const {pool} = require('./pool');

/**
 * Responsible for all queries in the database
 * @param quertText
 * @param params
 * @return {Promise<unknown>}
 */
const query = (quertText, params) => {
  return new Promise((resolve, reject) => {
    pool.query(quertText, params)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.query = query;

