const { expect } = require('chai');
const sinon = require('sinon');
const q = require('q');
const _ = require('lodash');

describe('The lib/auth/provision module', function() {
  let getModule, constants;
  let coreUserMock, setUserMetadataMock;

  beforeEach(function() {
    setUserMetadataMock = () => Promise.resolve();
    coreUserMock = {
      findByEmail: (username, callback) => callback(null),
      update: (user, callback) => callback(null),
      provisionUser: (user, callback) => callback(null),
      metadata: () => ({
        set: setUserMetadataMock
      }),
      translate: () => {}
    };

    constants = this.moduleHelpers.requireBackend('lib/constants');
    this.moduleHelpers.addDep('user', coreUserMock);
    getModule = () => this.moduleHelpers.requireBackend('lib/auth/provision')(this.moduleHelpers.dependencies);
  });

  describe('The getAuthDataFromRequest fn', function() {
    let mapping, headers, req;

    beforeEach(function() {
      mapping = {
        [constants.SPECIAL_AUTH_FIELDS.username]: 'auth-username',
        firstname: 'auth-firstname',
        lastname: 'auth-lastname',
        email: 'auth-username'
      };
      headers = {
        'auth-username': 'alice',
        'auth-firstname': 'Alice',
        'auth-lastname': 'Rose',
        otherfield: 'other field'
      };
      req = {
        get: key => headers[key]
      };

      this.moduleHelpers.addDep('esn-config', (key) => {
        expect(key).to.equal('mapping');

        return {
          inModule(module) {
            expect(module).to.equal(constants.MODULE_NAME);

            return {
              get() {
                return q(_.cloneDeep(mapping));
              }
            };
          }
        };
      });
    });

    it('should convert the request to auth data', function(done) {
      getModule()
        .getAuthDataFromRequest(req)
        .done((authData) => {
          expect(authData).to.deep.equal({
            mapping: {
              // no more special mappings here
              firstname: 'auth-firstname',
              lastname: 'auth-lastname',
              email: 'auth-username'
            },
            user: {
              'auth-username': 'alice',
              'auth-firstname': 'Alice',
              'auth-lastname': 'Rose'
            },
            username: 'alice'
          });
          done();
        });

    });
  });

  describe('The provisionUser fn', function() {
    it('should provision new user if not exist', function(done) {
      const payload = {
        username: 'alice',
        user: { name: 'Alice' }
      };
      const translatedUser = { _id: 'translated user' };

      coreUserMock.findByEmail = (email, callback) => {
        expect(email).to.equal(payload.username);
        callback();
      };
      coreUserMock.translate = (baseUser, _payload) => {
        expect(baseUser).to.not.exist;
        expect(_payload).to.deep.equal(payload);

        return translatedUser;
      };
      coreUserMock.provisionUser = (user) => {
        expect(user).to.equal(translatedUser);
        done();
      };

      getModule().provisionUser(payload);
    });

    it('should update the user if exists', function(done) {
      const payload = {
        username: 'alice',
        user: { name: 'Alice' }
      };
      const translatedUser = { _id: 'translated user' };
      const foundUser = { _id: 'found user' };

      coreUserMock.findByEmail = (email, callback) => {
        expect(email).to.equal(payload.username);
        callback(null, foundUser);
      };
      coreUserMock.translate = (baseUser, _payload) => {
        expect(baseUser).to.deep.equal(foundUser);
        expect(_payload).to.deep.equal(payload);

        return translatedUser;
      };
      coreUserMock.update = (user) => {
        expect(user).to.equal(translatedUser);
        done();
      };

      getModule().provisionUser(payload);
    });
  });

  describe('The getTrustedHeaders fn', function() {
    let mapping, headers, req, trustedHeadders;

    beforeEach(function() {
      mapping = {
        [constants.SPECIAL_AUTH_FIELDS.username]: 'auth-user',
        firstname: 'AUTH-FIRST-NAME',
        lastname: 'AUTH-LAST-NAME'
      };
      headers = {
        'auth-user': 'peter.wilson@open-paas.org',
        'AUTH-FIRST-NAME': 'JÃ©rÃ´me',
        'AUTH-LAST-NAME': 'LoÃ¯c'
      };
      req = {
        get: key => headers[key]
      };
      trustedHeadders = {};
    });

    it('should return decoded name', function() {
      trustedHeadders = getModule().getTrustedHeaders(req, mapping);
      expect(trustedHeadders).to.deep.equal({
        'AUTH-FIRST-NAME': 'Jérôme',
        'AUTH-LAST-NAME': 'Loïc',
        'auth-user': 'peter.wilson@open-paas.org'
      });
    });

    it('should return an object which does not contain key when the key is not in the header', function() {
      headers = {
        'auth-user': 'peter.wilson@open-paas.org',
        'AUTH-LAST-NAME': 'dwho'
      };

      trustedHeadders = getModule().getTrustedHeaders(req, mapping);
      expect(trustedHeadders).to.deep.equal({
        'AUTH-LAST-NAME': 'dwho',
        'auth-user': 'peter.wilson@open-paas.org'
      });
    });
  });

  describe('The saveUserProvisionedFields fn', () => {
    it('should set metdata of provision fields for a user then return the user object', function(done) {
      const payload = {
        user: { id: 'provisioned-user' },
        mapping: {
          firstname: 'header-firstname',
          lastname: 'header-lastname'
        }
      };

      setUserMetadataMock = sinon.stub().returns(Promise.resolve());

      getModule().saveUserProvisionedFields(payload)
        .then((result) => {
          expect(result).to.equal(payload.user);
          expect(setUserMetadataMock).to.have.been.calledWith('profileProvisionedFields', ['firstname', 'lastname']);
          done();
        })
        .catch(done);
    });
  });
});
