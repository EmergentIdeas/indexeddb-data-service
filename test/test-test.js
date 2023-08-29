require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert
const tu = require('../utils/test-util')

describe("a basic test which shows tests are working", function() {
	
	it("two times two", function() {
		assert.equal(tu(2, 2), 4)
	})
	it("two times 3", function() {
		assert.equal(tu(2, 3), 6)
	})

})