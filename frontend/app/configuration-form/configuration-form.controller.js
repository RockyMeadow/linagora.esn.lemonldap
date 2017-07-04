'use strict';

angular.module('linagora.esn.lemonldap')
  .controller('lemonldapConfigurationFormController', lemonldapConfigurationFormController);

  function lemonldapConfigurationFormController(_, LEMONLDAP_MAPPING_TYPES, LEMONLDAP_REQUIRED_MAPPING_TYPES) {
    var self = this;

    self.LEMONLDAP_MAPPING_TYPES = LEMONLDAP_MAPPING_TYPES;
    self.LEMONLDAP_REQUIRED_MAPPING_TYPES = LEMONLDAP_REQUIRED_MAPPING_TYPES;
  }
