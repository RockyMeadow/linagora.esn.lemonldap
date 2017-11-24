const _ = require('lodash');
const q = require('q');

const { SPECIAL_AUTH_FIELDS, CONFIG_DEFAULT, MODULE_NAME } = require('../constants');

module.exports = (dependencies) => {
  const coreUser = dependencies('user');
  const coreDomain = dependencies('domain');
  const esnConfig = dependencies('esn-config');
  const logger = dependencies('logger');

  return {
    getAuthDataFromRequest,
    provisionUser
  };

  function getAuthDataFromRequest(req) {
    return getHeaderMapping()
      .then((mapping) => {
        const trustedHeadders = getTrustedHeaders(req, mapping);

        logger.debug('Got LemonLDAP trusted headers:', JSON.stringify(trustedHeadders));

        const username = trustedHeadders[mapping[SPECIAL_AUTH_FIELDS.username]];
        const domainName = trustedHeadders[mapping[SPECIAL_AUTH_FIELDS.domain]];

        // remove special mappings to prevent them from being added to translated user
        delete mapping[SPECIAL_AUTH_FIELDS.username];
        delete mapping[SPECIAL_AUTH_FIELDS.domain];

        return getDomainIdFromName(domainName)
          .then(domainId => ({
            user: trustedHeadders,
            username,
            domainId,
            mapping
          }));
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
    const trustedHeadders = {};

    _.values(mapping).forEach((headerName) => {
      trustedHeadders[headerName] = req.get(headerName);
    });

    return trustedHeadders;
  }

  function getDomainIdFromName(domainName) {
    if (domainName) {
      return coreDomain.getByName(domainName).then(domain => (domain && domain.id));
    }

    return q();
  }

  function getHeaderMapping() {
    return esnConfig('mapping')
      .inModule(MODULE_NAME)
      .get()
      .then(mapping => mapping || CONFIG_DEFAULT.mapping);
  }
};
