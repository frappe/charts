const assert  = require('assert')
const helpers = require('../helpers')

describe('utils.helpers', () => {
    it('should return a value fixed upto 2 decimals', () => {
        assert.equal(helpers.floatTwo(1.234), 1.23);
        assert.equal(helpers.floatTwo(1.456), 1.46);
        assert.equal(helpers.floatTwo(1),     1.00);
    });
});