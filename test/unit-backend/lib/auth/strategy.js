const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('The lib/auth/strategy module', function() {
  let getModule;
  let provisionMock;

  beforeEach(function() {
    getModule = () => this.moduleHelpers.requireBackend('lib/auth/strategy')(this.moduleHelpers.dependencies);
    provisionMock = {};

    mockery.registerMock('./provision', () => provisionMock);
  });

  describe('The verify fn', function() {
    let verify, findLDAPForUserMock;

    beforeEach(function() {
      verify = null;
      findLDAPForUserMock = () => {};

      mockery.registerMock('passport-trusted-header', {
        Strategy: function(options, verifyFn) {
          verify = verifyFn;
        }
      });
    });

    it('should call done with false if it fails to get auth data from request', function(done) {
      const req = {};
      const headers = {};

      provisionMock.getAuthDataFromRequest = () => Promise.reject(new Error('an_error'));

      this.moduleHelpers.addDep('ldap', {
        findLDAPForUser: () => {}
      });

      getModule();
      verify(req, headers, (error, user) => {
        expect(error).to.not.exist;
        expect(user).to.be.false;
        done();
      });
    });

    it('should call done with false if the user not found', function(done) {
      const req = {};
      const headers = {};

      provisionMock.getAuthDataFromRequest = () => Promise.resolve({
        username: null
      });

      this.moduleHelpers.addDep('ldap', {
        findLDAPForUser: () => {}
      });

      getModule();
      verify(req, headers, (error, user) => {
        expect(error).to.not.exist;
        expect(user).to.be.false;
        done();
      });

    });

    it('should call done with false if failed to find ldap for user', function(done) {
      const req = {};
      const headers = {};
      const usernameMock = 'aff2018';

      provisionMock.getAuthDataFromRequest = () => Promise.resolve({
        username: usernameMock
      });

      findLDAPForUserMock = sinon.spy((username, callback) => {
        expect(username).to.equal(usernameMock);

        callback(new Error('something wrong'));
      });

      this.moduleHelpers.addDep('ldap', {
        findLDAPForUser: findLDAPForUserMock
      });

      getModule();
      verify(req, headers, (error, user) => {
        expect(error).to.not.exist;
        expect(user).to.be.false;
        expect(findLDAPForUserMock).to.have.been.calledOnce;
        done();
      });
    });

    it('should call done with error if username is not found in any ldap connector', function(done) {
      const req = {};
      const headers = {};
      const usernameMock = 'aff2018';

      provisionMock.getAuthDataFromRequest = () => Promise.resolve({
        username: usernameMock
      });

      findLDAPForUserMock = sinon.spy((username, callback) => {
        expect(username).to.equal(usernameMock);

        callback(null, []);
      });

      this.moduleHelpers.addDep('ldap', {
        findLDAPForUser: findLDAPForUserMock
      });

      getModule();

      verify(req, headers, (err) => {
        expect(err).to.equal(`Username ${usernameMock} can not be found in any of the OpenPaaS configured authenticators.`);
        expect(findLDAPForUserMock).to.have.been.calledOnce;
        done();
      });
    });

    it('should call done with error if username is found in more than 1 ldap connector', function(done) {
      const req = {};
      const headers = {};
      const usernameMock = 'aff2018';

      provisionMock.getAuthDataFromRequest = () => Promise.resolve({
        username: usernameMock
      });

      findLDAPForUserMock = sinon.spy((username, callback) => {
        expect(username).to.equal(usernameMock);

        callback(null, [{}, {}]);
      });

      this.moduleHelpers.addDep('ldap', {
        findLDAPForUser: findLDAPForUserMock
      });

      getModule();

      verify(req, headers, (err) => {
        expect(err).to.equal(`Username ${usernameMock} is invalid. Please contact OpenPaaS administrator for more detail.`);
        expect(findLDAPForUserMock).to.have.been.calledOnce;
        done();
      });
    });

    it('should provision user if found', function(done) {
      const req = {};
      const headers = {};
      const provisionedUser = { _id: 'provisioned user' };
      const usernameMock = 'aff2018';
      const ldap = {
        domainId: 'domainId'
      };

      provisionMock.getAuthDataFromRequest = () => Promise.resolve({
        username: usernameMock
      });
      provisionMock.provisionUser = sinon.stub().returns(Promise.resolve(provisionedUser));

      findLDAPForUserMock = sinon.spy((username, callback) => {
        expect(username).to.equal(usernameMock);

        callback(null, [ldap]);
      });

      this.moduleHelpers.addDep('ldap', {
        findLDAPForUser: findLDAPForUserMock
      });

      getModule();

      verify(req, headers, (err, user) => {
        expect(err).to.not.exist;
        expect(user).to.deep.equal(provisionedUser);
        expect(findLDAPForUserMock).to.have.been.calledOnce;
        expect(provisionMock.provisionUser).to.have.calledWith({
          username: usernameMock,
          domainId: ldap.domainId
        });
        done();
      });
    });

    it('should call done with false if it fails to provision user', function(done) {
      const req = {};
      const headers = {};
      const usernameMock = 'aff2018';
      const ldap = {
        domainId: 'domainId'
      };

      provisionMock.getAuthDataFromRequest = () => Promise.resolve({
        username: usernameMock
      });
      provisionMock.provisionUser = sinon.stub().returns(Promise.reject(new Error('an_error')));

      findLDAPForUserMock = sinon.spy((username, callback) => {
        expect(username).to.equal(usernameMock);

        callback(null, [ldap]);
      });

      this.moduleHelpers.addDep('ldap', {
        findLDAPForUser: findLDAPForUserMock
      });

      getModule();

      verify(req, headers, (err, user) => {
        expect(err).to.not.exist;
        expect(user).to.be.false;
        expect(findLDAPForUserMock).to.have.been.calledOnce;
        expect(provisionMock.provisionUser).to.have.calledWith({
          username: usernameMock,
          domainId: ldap.domainId
        });
        done();
      });
    });

    describe('save provisioned fields to user metadata after provisioning/updating user', function() {
      beforeEach(function() {
        provisionMock.getAuthDataFromRequest = () => Promise.resolve({ username: 'username' });
        provisionMock.saveUserProvisionedFields = () => Promise.resolve();
        provisionMock.provisionUser = () => Promise.resolve({ _id: 'provisioned user' });

        this.moduleHelpers.addDep('ldap', {
          findLDAPForUser: (username, callback) => callback(null, [{ domainId: 'domain' }])
        });
      });

      it('should not save provion fields if failes to provision user', function(done) {
        provisionMock.provisionUser = () => Promise.reject(new Error('error'));
        provisionMock.saveUserProvisionedFields = sinon.spy(() => Promise.reject(new Error('should not called')));
        getModule();

        verify({}, {}, () => {
          expect(provisionMock.saveUserProvisionedFields).to.not.have.been.called;

          done();
        });
      });

      it('should save provion fields after provision user', function(done) {
        provisionMock.saveUserProvisionedFields = sinon.stub().returns(Promise.resolve());
        getModule();

        verify({}, {}, (error) => {
          if (error) return done(error);

          expect(provisionMock.saveUserProvisionedFields).to.have.been.called;

          done();
        });
      });
    });
  });

});
