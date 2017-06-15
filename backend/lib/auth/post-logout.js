const { MODULE_NAME, CONFIG_DEFAULT } = require('../constants');

module.exports = (dependencies) => {
  const logger = dependencies('logger');
  const esnConfig = dependencies('esn-config');

  return (req, res) => {
    getLogoutUrl()
      .then(logoutUrl => res.redirect(logoutUrl))
      .catch((err) => {
        const details = 'Error while getting LemonLDAP logoutUrl config';

        logger.error(details, err);

        res.status(500).json({
          error: {
            code: 500,
            message: 'Server Error',
            details
          }
        });
      });
  };

  function getLogoutUrl() {
    return esnConfig('logoutUrl')
      .inModule(MODULE_NAME)
      .get()
      .then(logoutUrl => logoutUrl || CONFIG_DEFAULT.logoutUrl);
  }
};
