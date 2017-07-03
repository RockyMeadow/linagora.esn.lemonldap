module.exports = (dependencies) => {
  const esnConfig = dependencies('esn-config');
  const CONFIG_METADATA = {
    rights: {
      padmin: 'rw'
    },
    configurations: {
      mapping: {},
      logoutUrl: {}
    }
  };

  return {
    init
  };

  function init() {
    esnConfig.registry.register('linagora.esn.lemonldap', CONFIG_METADATA);
  }
};
