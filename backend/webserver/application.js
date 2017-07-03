'use strict';

const express = require('express');

module.exports = function(dependencies) {

  const application = express();

  require('./config/views')(dependencies, application);
  require('./config/i18n')(dependencies, application);

  return application;
};
