const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('The lib/auth module', function() {
  let getModule, constants;
  let passportMock, ssoStrategiesMock;

  beforeEach(function() {
    constants = this.moduleHelpers.requireBackend('lib/constants');
    getModule = () => this.moduleHelpers.requireBackend('lib/auth')(this.moduleHelpers.dependencies);

    passportMock = { use: sinon.spy() };
    ssoStrategiesMock = { register: sinon.spy() };

    this.moduleHelpers.addDep('passport', {
      get: () => passportMock,
      ssoStrategies: ssoStrategiesMock
    });

    mockery.registerMock('./strategy', () => {});
  });

  describe('The init fn', function() {
    it('should register passport strategy', function() {
      getModule().init();

      expect(passportMock.use).to.have.been.calledWith(constants.STRATEGY_NAME);
    });

    it('should register to SSO strategies registry', function() {
      getModule().init();

      expect(ssoStrategiesMock.register).to.have.been.calledWith(constants.STRATEGY_NAME);
    });
  });

});
