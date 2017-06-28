const { STRATEGY_NAME } = require('../constants');

module.exports = (dependencies) => {
  const logger = dependencies('logger');
  const coreAuth = dependencies('auth');
  const passport = dependencies('passport').get();

  const strategy = require('./strategy')(dependencies);
  const postLogout = require('./post-logout')(dependencies);

  return {
    init
  };

  function init() {
    logger.info('Initializing LemonLDAP SSO authentication');

    coreAuth.handlers.addLoginHandler(loginHandler);
    coreAuth.handlers.addLogoutHandler(logoutHandler);

    passport.use(STRATEGY_NAME, strategy);
  }

  function loginHandler(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    passport.authenticate(STRATEGY_NAME, { failureRedirect: '/login' })(req, res, next);
  }

  // do not remove next parameter otherwise composable-middleware won't call it
  function logoutHandler(req, res, next) { // eslint-disable-line no-unused-vars
    req.logout();

    return postLogout(req, res);
  }
};
