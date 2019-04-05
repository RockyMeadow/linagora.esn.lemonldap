const _ = require('lodash');
const q = require('q');

const { SPECIAL_AUTH_FIELDS, CONFIG_DEFAULT, MODULE_NAME } = require('../constants');

module.exports = (dependencies) => {
  const coreUser = dependencies('user');
  const esnConfig = dependencies('esn-config');
  const logger = dependencies('logger');

  return {
    getAuthDataFromRequest,
    provisionUser,
    getTrustedHeaders
  };

  function getAuthDataFromRequest(req) {
    return getHeaderMapping()
      .then((mapping) => {
        const trustedHeaders = getTrustedHeaders(req, mapping);

        logger.debug('Got LemonLDAP trusted headers:', JSON.stringify(trustedHeaders));

        const username = trustedHeaders[mapping[SPECIAL_AUTH_FIELDS.username]];

        // remove special mappings to prevent them from being added to translated user
        Object.values(SPECIAL_AUTH_FIELDS).forEach(value => delete mapping[value]);

        return {
          user: trustedHeaders,
          username,
          mapping
        };
      });
  }

  function provisionUser(payload) {
    return q.nfcall(coreUser.findByEmail, payload.username)
      .then((user) => {
        const method = user ? 'update' : 'provisionUser';
        const provisionUser = coreUser.translate(user, payload);

        if (method === 'provisionUser') {
          logger.debug('Provisioning new user:', JSON.stringify(provisionUser));
        }

        return q.ninvoke(coreUser, method, provisionUser);
      });
  }

  function getTrustedHeaders(req, mapping) {
    const trustedHeaders = {};

    _.values(mapping).forEach((headerName) => {
      trustedHeaders[headerName] = Buffer(req.get(headerName), 'ascii').toString();
    });

    return trustedHeaders;
  }

  function getHeaderMapping() {
    return esnConfig('mapping')
      .inModule(MODULE_NAME)
      .get()
      .then(mapping => mapping || CONFIG_DEFAULT.mapping);
  }
};
