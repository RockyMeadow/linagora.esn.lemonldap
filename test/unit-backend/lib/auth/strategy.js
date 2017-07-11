const mockery = require('mockery');
const expect = require('chai').expect;
const q = require('q');

describe('The lib/auth/strategy module', function() {
  let getModule;
  let provisionMock;

  beforeEach(function() {
    getModule = () => this.moduleHelpers.requireBackend('lib/auth/strategy')(this.moduleHelpers.dependencies);
    provisionMock = {};

    mockery.registerMock('./provision', () => provisionMock);
  });

  describe('The verify fn', function() {
    let verify;

    beforeEach(function() {
      verify = null;

      mockery.registerMock('passport-trusted-header', {
        Strategy: function(options, verifyFn) {
          verify = verifyFn;
        }
      });
    });

    it('should call done with false if the user not found', function(done) {
      const req = {};
      const headers = {};

      provisionMock.getAuthDataFromRequest = () => q({
        username: null
      });

      getModule();
      verify(req, headers, (error, user) => {
        expect(error).to.not.exist;
        expect(user).to.be.false;
        done();
      });

    });

    it('should call done with false if the domain is not found', function(done) {
      const req = {};
      const headers = {};

      provisionMock.getAuthDataFromRequest = () => q({
        username: 'a user',
        domainId: null
      });

      getModule();
      verify(req, headers, (error, user) => {
        expect(error).to.not.exist;
        expect(user).to.be.false;
        done();
      });

    });

    it('should provision user if found', function(done) {
      const req = {};
      const headers = {};
      const provisionedUser = { _id: 'provisioned user' };

      provisionMock.getAuthDataFromRequest = () => q({
        domainId: '123',
        username: 'a user'
      });
      provisionMock.provisionUser = () => q(provisionedUser);

      getModule();

      verify(req, headers, (err, user) => {
        expect(err).to.not.exist;
        expect(user).to.deep.equal(provisionedUser);
        done();
      });
    });
  });

});
