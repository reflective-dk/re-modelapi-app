const assert = require('chai').assert;
const requirejs = require('requirejs');
const path = require('path');
var pathToCommon = path.dirname(require.resolve('re-common-app')) + '/lib';

requirejs.config({
    baseUrl: 'static/lib',
    nodeRequire: require,
    paths: {
      common: pathToCommon
    }
});

let diagram;
describe('diagram', () => {

  before('setup require', (done) => {
    requirejs(['diagram'], (mod) => {
      diagram = mod;
      done();
    });
  });

  describe('formatTables', () => {
    it('should format tables to diagram', () => {
      var data = diagram.formatTables({});

      assert.equal(data[0].value, 'domain');
      assert.equal(data[0].data.length, 0);
    });
  });
});