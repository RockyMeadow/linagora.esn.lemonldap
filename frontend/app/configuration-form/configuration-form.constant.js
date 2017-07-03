'use strict';

angular.module('linagora.esn.lemonldap')
  .constant('LEMONLDAP_MAPPING_TYPES', [
    'firstname',
    'lastname',
    'email',
    'description',
    'main_phone',
    'office_location',
    'building_location',
    'service',
    'job_title'
  ])
  .constant('LEMONLDAP_REQUIRED_MAPPING_TYPES', [
    'll-auth-user',
    'll-auth-domain'
  ]);
