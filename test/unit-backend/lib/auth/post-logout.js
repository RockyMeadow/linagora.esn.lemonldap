const expect = require('chai').expect;
const q = require('q');

describe('The lib/auth/post-logout module', function() {
  let getModule, constants;
  let configMock;

  beforeEach(function() {
    constants = this.moduleHelpers.requireBackend('lib/constants');
    getModule = () => this.moduleHelpers.requireBackend('lib/auth/post-logout')(this.moduleHelpers.dependencies);

    this.moduleHelpers.addDep('esn-config', () => ({
      inModule() {
        return {
          get() {
            return configMock;
          }
        };
      }
    }));
  });

  it('should redirect the user to the configured logoutUrl', function(done) {
    const logoutUrl = '/path/to/sso/logout/url';
    const req = {};
    const res = {
      redirect(url) {
        expect(url).to.equal(logoutUrl);
        done();
      }
    };

    configMock = q(logoutUrl);

    getModule()(req, res);
  });

  it('should redirect the user to the default logoutUrl if not logoutUrl found', function(done) {

    const req = {};
    const res = {
      redirect(url) {
        expect(url).to.equal(constants.CONFIG_DEFAULT.logoutUrl);
        done();
      }
    };

    configMock = q();

    getModule()(req, res);
  });

  it('should respond 500 error when it fails to get logoutUrl', function(done) {
    const req = {};
    const res = {
      status(code) {
        expect(code).to.equal(500);

        return {
          json(json) {
            expect(json).to.deep.equal({
              error: {
                code: 500,
                message: 'Server Error',
                details: 'Error while getting LemonLDAP logoutUrl config'
              }
            });
            done();
          }
        };
      }
    };

    configMock = q.reject(new Error('an error'));

    getModule()(req, res);
  });

});
