'use strict';

module.exports = (dependencies) => {
  const config = require('./config')(dependencies);
  const auth = require('./auth')(dependencies);

  function init() {
    config.init();
    auth.init();
  }

  return {
    init
  };
};
