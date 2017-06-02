const { STRATEGY_NAME } = require('../constants');

module.exports = (dependencies) => {
  const logger = dependencies('logger');
  const corePassport = dependencies('passport');

  const strategy = require('./strategy')(dependencies);

  function init() {
    logger.info('Initializing LemonLDAP authentication strategy');

    corePassport.get().use(STRATEGY_NAME, strategy);
    corePassport.ssoStrategies.register(STRATEGY_NAME);
  }

  return {
    init
  };
};
