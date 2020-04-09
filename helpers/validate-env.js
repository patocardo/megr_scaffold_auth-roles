const envalid = require('envalid');

module.exports = function validateEnv() {
  envalid.cleanEnv(process.env, {
    MONGO_PASSWORD: envalid.str(),
    MONGO_DB: envalid.str(),
    MONGO_USER: envalid.str(),
    PORT: envalid.port(),
  });
}