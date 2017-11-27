const Strategy = require('passport-trusted-header').Strategy;

module.exports = (dependencies) => {
  const logger = dependencies('logger');
  const provision = require('./provision')(dependencies);
  const options = {
    headers: [],
    passReqToCallback: true
  };

  return new Strategy(options, verify);

  function verify(req, headers, done) {
    // instead of relying on headers returned from Strategy
    // we get headers directly from request
    // because the trusted fields are configurable by esnConfig
    provision
      .getAuthDataFromRequest(req)
      .then((authData) => {
        logger.debug('Parsed auth payload from trusted headers:', JSON.stringify(authData));

        if (!authData.username) { // user not found
          return done(null, false);
        }

        if (!authData.domainId) {
          return done(null, false);
        }

        return provision.provisionUser(authData).then(user => done(null, user));
      })
      .catch((err) => {
        logger.error('Error while authenticating user from LemonLDAP trusted headers', err);
        // to not send back error object to frontend
        done(null, false);
      });
  }
};
