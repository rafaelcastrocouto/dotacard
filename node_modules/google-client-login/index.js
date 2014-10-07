
var request = require('superagent');
var qs = require('querystring');

/**
 * Expose `login`.
 */

module.exports = login;

/**
 * Get the client login token.
 *
 * @param {String} email
 * @param {String} password
 * @param {String} service
 * @param {Function} callback
 */

function login (email, password, service, callback) {

  var payload = qs.stringify({
    Email: email,
    Passwd: password,
    accountType: 'HOSTED_OR_GOOGLE',
    source: 'curl-accountFeed-v2',
    service: service
  });

  request
    .post('https://www.google.com/accounts/ClientLogin')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .send(payload)
    .end(function (err, res) {
      if (err) return callback(err);
      if (res.statusCode === 200) {
        var t = res.text.match(/(Auth=[^\s]*)\s/);
        if (t && t.length > 1) return callback(null, t[1]);
        else callback(new Error('Unexpected result format : ' + res.text));
      } else {
        callback(new Error('Google login error [' + res.statusCode + '] : ' + res.text));
      }
    });
}
