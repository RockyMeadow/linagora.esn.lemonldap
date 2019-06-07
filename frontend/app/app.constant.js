'use strict';

angular.module('linagora.esn.lemonldap')
  .constant('LEMONLDAP_MODULE_METATDATA', {
    id: 'linagora.esn.lemonldap',
    title: 'LemonLDAP',
    icon: 'lemonldap/images/logo.png',
    config: {
      template: 'lemonldap-configuration-form',
      displayIn: {
        user: false,
        domain: false,
        platform: true
      }
    }
  });
