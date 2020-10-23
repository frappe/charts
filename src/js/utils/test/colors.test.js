const assert = require('assert');
const colors = require('../colors');

describe('utils.colors', () => {
  it('should return #aaabac for RGB()', () => {
    assert.equal(colors.getColor('rgb(170, 171, 172)'), '#aaabac');
  });
  it('should return #ff5858 for the named color red', () => {
    assert.equal(colors.getColor('red'), '#ff5858d');
  });
  it('should return #1a5c29 for the hex color #1a5c29', () => {
    assert.equal(colors.getColor('#1a5c29'), '#1a5c29');
  });
});