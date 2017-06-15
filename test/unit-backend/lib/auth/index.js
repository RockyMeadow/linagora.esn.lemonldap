const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('The lib/auth module', function() {
  let getModule, constants;
  let passportMock, authMock;

  beforeEach(function() {
    constants = this.moduleHelpers.requireBackend('lib/constants');
    getModule = () => this.moduleHelpers.requireBackend('lib/auth')(this.moduleHelpers.dependencies);

    passportMock = { use: sinon.spy() };
    authMock = {
      handlers: {
        addLoginHandler: sinon.spy(),
        addLogoutHandler: sinon.spy()
      }
    };

    this.moduleHelpers.addDep('passport', {
      get: () => passportMock
    });
    this.moduleHelpers.addDep('auth', authMock);

    mockery.registerMock('./strategy', () => {});
  });

  describe('The init fn', function() {
    it('should register passport strategy', function() {
      getModule().init();

      expect(passportMock.use).to.have.been.calledWith(constants.STRATEGY_NAME);
    });

    it('should register to login and logout handlers', function() {
      getModule().init();

      expect(authMock.handlers.addLoginHandler).to.have.been.calledWith(sinon.match.func);
      expect(authMock.handlers.addLogoutHandler).to.have.been.calledWith(sinon.match.func);
    });
  });

});
