'use strict';

angular.module('linagora.esn.lemonldap')
  .run(function(esnModuleRegistry, LEMONLDAP_MODULE_METATDATA) {
    esnModuleRegistry.add(LEMONLDAP_MODULE_METATDATA);
  });
