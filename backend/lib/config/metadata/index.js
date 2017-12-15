module.exports = dependencies => ({
  rights: {
    padmin: 'rw'
  },
  configurations: {
    mapping: require('./mapping')(dependencies),
    logoutUrl: require('./logout-url')(dependencies)
  }
});
