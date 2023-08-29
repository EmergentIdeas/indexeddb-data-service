const path = require('path')
const express = require('express');

const filog = require('filter-log')
let log

module.exports = function(app) {
	log = filog('unknown')

	// add a couple javascript based tripartite templates. More a placeholder
	// for project specific templates than it is a useful library.
	require('./add-templates.js')()

}

