module.exports = {
  MODULE_NAME: 'linagora.esn.lemonldap',
  STRATEGY_NAME: 'lemon-ldap',
  SPECIAL_AUTH_FIELDS: {
    username: 'll-auth-user',
    domain: 'll-auth-domain'
  },
  CONFIG_DEFAULT: {
    mapping: {
      'll-auth-user': 'auth-user',
      'll-auth-domain': 'auth-domain'
    },
    logoutUrl: '/logout_sso'
  }
};
