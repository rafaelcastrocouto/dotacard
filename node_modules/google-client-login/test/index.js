
var assert = require('assert');
var login = require('..');

describe('google-client-login', function () {

  var email = 'node.sheets.test.100@gmail.com';
  var password = 'helloHELLO123';

  it('should fail with bad login able to login', function (done) {
    login(email, 'wrong', 'analytics', function (err, token) {
      assert(err);
      done();
    });
  });

  it('should succeed with good login', function (done) {
    login(email, password, 'analytics', function (err, token) {
      if (err) return done(err);
      assert(token);
      done();
    });
  });
});