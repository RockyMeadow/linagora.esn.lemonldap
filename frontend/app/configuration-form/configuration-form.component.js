'use strict';

angular.module('linagora.esn.lemonldap')

.component('lemonldapConfigurationForm', {
  templateUrl: '/lemonldap/app/configuration-form/configuration-form.html',
  controller: 'lemonldapConfigurationFormController',
  bindings: {
    configurations: '='
  }
});
