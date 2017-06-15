'use strict';

const AwesomeModule = require('awesome-module');
const Dependency = AwesomeModule.AwesomeModuleDependency;

const MODULE_NAME = 'lemonldap';
const AWESOME_MODULE_NAME = 'linagora.esn.' + MODULE_NAME;

const awesomeModule = new AwesomeModule(AWESOME_MODULE_NAME, {
  dependencies: [
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.esn-config', 'esn-config'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.domain', 'domain'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.passport', 'passport'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.auth', 'auth'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.logger', 'logger'),
    new Dependency(Dependency.TYPE_NAME, 'linagora.esn.core.user', 'user')
  ],

  states: {
    lib: function(dependencies, callback) {
      const lib = require('./backend/lib')(dependencies);

      return callback(null, {
        lib
      });
    },

    deploy: function(dependencies, callback) {
      return callback();
    },

    start: function(dependencies, callback) {
      this.lib.init();
      callback();
    }
  }
});

module.exports = awesomeModule;
