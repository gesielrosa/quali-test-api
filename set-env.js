const writeFile = require('fs').writeFile;

/**
 * Configure `env.js` file path
 * @type {string}
 */
const targetPath = './src/environments/env.js';

require('dotenv').config();

/**
 * `env.js` file structure
 * @type {string}
 */
const envConfigFile = `module.exports.env = {
   database_url: '${process.env.DATABASE_URL}',
   port: ${process.env.PORT}
};`;

console.log('The file `env.js` will be written with the following content: \n');
console.log(envConfigFile);

/**
 * Write 'env.js' file
 */
writeFile(targetPath, envConfigFile, (err) => {
  if (err) {
    throw console.error(err);
  } else {
    console.log(`env.js file generated correctly at ${targetPath} \n`);
  }
});
