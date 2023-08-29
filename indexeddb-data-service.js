const AbstractDataService = require('@dankolz/abstract-data-service')
const filog = require('filter-log')


class IndexeddbDataService extends AbstractDataService {

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
		this.log =  filog(`RndexeddbDataService-${this.serviceName}:`)

	}

	async init() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.databaseName, 1)

			request.onerror = (event) => {
				reject(event)
			}
			request.onupgradeneeded = (event) => {
				this.log.debug('onupgrade')
				this.db = event.target.result

				const objectStore = this.db.createObjectStore(this.collections.default, { keyPath: "id" })

				objectStore.transaction.oncomplete = (event) => {
					this.log.debug('upgrade transaction complete')
					resolve(this.db)
				}
			}

			request.onsuccess = (event) => {
				this.log.debug('onsuccess')
				this.db = event.target.result;
				if (request.readyState === 'done') {
					resolve(this.db)
				}
			}
		})
	}

	/**
	 * Creates an object to query the db by an object's ID
	 * @param {*} id 
	 * @returns 
	 */
	createIdQuery(id) {
		if (Array.isArray(id)) {
			let subqueries = id.map(singleId => this.createIdQuery(singleId))
			let query = {
				$or: subqueries
			}
			return query
		}
		else {
			if (typeof id == 'object') {
				return id
			}
			let query = {
				_id: id
			}

			if (this.useIndependentIds && typeof id == 'string') {
				query = {
					$or: [
						query,
						{
							id: id
						}
					]
				}
			}

			return query
		}
	}

	async _doInternalFetch(collection, query) {
		return new Promise((resolve, reject) => {
			if (typeof query === 'string') {

				const transaction = this.db.transaction([collection], "readwrite")
				transaction.oncomplete = (event) => {
					this.log.debug("fetch complete")
				};

				transaction.onerror = (event) => {
					this.log.debug('fetch error')
					reject(event)
				}

				const objectStore = transaction.objectStore(collection)
				const request = objectStore.get(query)
				request.onerror = (event) => {
					this.log.debug('fetch request error')
					reject(event)
				}
				request.onsuccess = (event) => {
					resolve([request.result])
				}
			}
			else if(this.filterGenerator) {
				const objectStore = this.db.transaction(collection).objectStore(collection)
				let result = []

				objectStore.openCursor().onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						result.push(cursor.value)
						cursor.continue()
					} else {
						result = result.filter(this.filterGenerator(query))
						resolve(result)
					}
				}
			}
			else {
				return reject(`Can't handle query`)
			}
		})
	}

	/**
	 * Removes one of more documents. This assumes the id is actually just an id,
	 * but will work fine if a broader query is passed.
	 * @param {*} id A query or a string which is the id
	 * @returns 
	 */
	async remove(id = {}) {
		if(typeof id === 'string') {
			return this._removeByQuery(this.collections.default, id)
		}
		
		return this._removeByQuery(this.collections.default, this.createIdQuery(id))
	}

	async _doInternalRemove(collection, query) {
		return new Promise(async (resolve, reject) => {

			let keys
			if (typeof query === 'string') {
				keys = [query]
			}
			else if(this.filterGenerator) {
				let objects = await this._doInternalFetch(collection, query)
				keys = objects.map(obj => obj.id)
			}
			else {
				return reject(`Can't handle query`)
			}
			

			const transaction = this.db.transaction([collection], "readwrite")
			transaction.oncomplete = (event) => {
				this.log.debug("remove complete")
				resolve(event)
			};

			transaction.onerror = (event) => {
				this.log.debug('remove error')
				reject(event)
			}

			let objectStore = transaction.objectStore(collection)
			for(let key of keys) {
				let request = objectStore.delete(key)
				request.onsuccess = (event) => {
					this.log.debug('delete request success')
				}
				request.onerror = (event) => {
					this.log.debug('delete request error: ' + event.toString())
				}
			}
		})
	}

	async _doInternalSave(collection, focus) {
		return new Promise((resolve, reject) => {
			let isUpdate = !!focus._id
			if(!isUpdate) {
				focus._id = focus.id || this.generateId()
			}

			const transaction = this.db.transaction([collection], "readwrite")
			transaction.oncomplete = (event) => {
				this.log.debug("save complete")
			};

			transaction.onerror = (event) => {
				this.log.debug('save error')
				reject(event)
			}

			const objectStore = transaction.objectStore(collection)
			let request = objectStore.put(focus)
			request.onsuccess = (event) => {
				this.log.debug('save request success')
				resolve([focus, isUpdate ? 'update' : 'create', event])
				// event.target.result === customer.ssn;
			}
			request.onerror = (event) => {
				this.log.debug('save request error: ' + event.toString())
				reject(event)
			}
		})
	}

	/**
	 * Saves an array of objects. If the objects already have an _id attribute, it replaces the existing document, otherwise inserts it.
	 * @param {Collection} collection A MongoDB Collection
	 * @param {object[]} foci An array of objects to save
	 * @param {function} callback (optional) A callback if that's how you get down. Called when Promise.all is done. This function would normally be used with promises and await.
	 * @returns Array An array of promises which represent saves for each object in the array. If you want to wait on the results, try:
	 * 		Promise.all(service._saveMany(col, items)).then(result => {
	 * 			// some code
	 * 		})
	 * 	or
	 * 		await Promise.all(service._saveMany(col, items))
	 */
	_saveMany(collection, foci, callback) {
		let promises = []

		for (let focus of foci) {
			promises.push(this._save(collection, focus))
		}
		if (callback) {
			addCallbackToPromise(Promise.all(promises), callback)
		}
		return promises
	}

}

module.exports = IndexeddbDataService
