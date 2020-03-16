const Strategy = require('passport-trusted-header').Strategy;
const { promisify } = require('util');

module.exports = (dependencies) => {
  const logger = dependencies('logger');
  const findLDAPForUser = promisify(dependencies('ldap').findLDAPForUser);
  const {
    getAuthDataFromRequest,
    provisionUser,
    saveUserProvisionedFields
  } = require('./provision')(dependencies);

  const options = {
    headers: [],
    passReqToCallback: true
  };

  return new Strategy(options, verify);

  function verify(req, headers, done) {
    // instead of relying on headers returned from Strategy
    // we get headers directly from request
    // because the trusted fields are configurable by esnConfig
    getAuthDataFromRequest(req)
      .then((authData) => {
        logger.debug('Parsed auth payload from trusted headers:', JSON.stringify(authData));

        if (!authData.username) { // user not found
          return done(null, false);
        }

        return findLDAPForUser(authData.username)
          .then((ldaps) => {
            if (!ldaps.length) {
              logger.debug(`Username ${authData.username} is not found any LDAP connector`);

              return done(`Username ${authData.username} can not be found in any of the OpenPaaS configured authenticators.`);
            }

            if (ldaps.length > 1) {
              logger.debug(`Username ${authData.username} is found in more than 1 LDAP connector`);

              return done(`Username ${authData.username} is invalid. Please contact OpenPaaS administrator for more detail.`);
            }

            authData.domainId = ldaps[0].domainId;

            return provisionUser(authData)
              .then(saveUserProvisionedFields)
              .then(user => done(null, user));
          });
      })
      .catch((err) => {
        logger.error('Error while authenticating user from LemonLDAP trusted headers', err);
        try {
          logger.debug('Detailled error', JSON.stringify(err));
        } catch (e) {
          logger.error('unable to convert error to JSON');
        }
        // to not send back error object to frontend
        done(null, false);
      });
  }
};
