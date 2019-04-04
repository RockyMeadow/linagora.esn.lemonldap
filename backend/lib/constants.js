module.exports = {
  MODULE_NAME: 'linagora.esn.lemonldap',
  STRATEGY_NAME: 'lemon-ldap',
  SPECIAL_AUTH_FIELDS: {
    username: 'll-auth-user'
  },
  CONFIG_DEFAULT: {
    mapping: {
      'll-auth-user': 'auth-user'
    },
    logoutUrl: '/logout_sso'
  }
};
