const DataService = require('./indexeddb-data-service')
const sift = require('sift')

class IndexeddbDataServiceSift extends DataService {
	/**
	 * 
	 * @param {object} options
	   * @param {string} [options.serviceName] Sets the name of this service for logging, and possibly other purposes
	   * @param {string} [options.databaseName] Specifies which database to use
	   * @param {boolean} [options.useIndependentIds] If true, records will get unique ID strings which are not tied to the underylying datastore
	   * @param {object} options.collections an object holding the indexeddb object store names this service will use, keyed by object storename
	   * @param {string} [options.collections.default] the default object store name. Technically optional, but the basic functions which
	 * don't require the caller to specify the object store won't work if not set.
	 * @param {EventEmitter} [options.notification] An EventEmitter that will be notified on create, update, and delete. The notification is:
	 * emit('object-change', { the object }, changeType: create, update, delete)
	 * @param {string} [options.eventName] The event name which will be used for the emitter. By default this is 'object-change'.
	 * @param {function} [options.filterGenerator] A function which is passed a query object and returns a function which can be use for
	 * array.filter. Check out the npm package sift as an easy way to do this. If this is null, which it is by default, queries that are not
	 * id queries will throw an exception.
	 * 
	 */
	constructor(options = {}) {
		super(options)
		Object.assign(this, arguments[0])
		if(!this.filterGenerator) {
			this.filterGenerator = sift
		}
	}

}

module.exports = IndexeddbDataServiceSift