module.exports = (dependencies) => {
  const esnConfig = dependencies('esn-config');
  const metadata = require('./metadata')(dependencies);

  return {
    init
  };

  function init() {
    esnConfig.registry.register('linagora.esn.lemonldap', metadata);
  }
};
