const Strategy = require('passport-trusted-header').Strategy;

module.exports = (dependencies) => {
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
        if (!authData.username) { // user not found
          return done(null, false);
        }

        return provision.provisionUser(authData).then(user => done(null, user));
      })
      .catch(done);
  }
};
