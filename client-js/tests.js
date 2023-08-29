const mocha = require('mocha')
mocha.setup('bdd')
mocha.run()
const assert = require('chai').assert
const sift = require('sift')

const EventEmitter = require('events')
const IndexeddbDataService = require('../indexeddb-data-service-sift')
let StoreClass = IndexeddbDataService

async function genStore(events) {
	
	let serv = new StoreClass({
		collections: {
			default: 'test1'
		}
		, databaseName: 'db' + (new Date().getTime())
		, notification: events
	})
	
	await serv.init()
	return serv
}




describe("basic data operations", async function () {

	it("independent ids", async function () {
		let serv = await genStore()
		assert.equal(serv.useIndependentIds, true)
		
		let id = serv.generateId()
		assert.isNotNull(id)
	})

	it("ops", async function () {
		let p = new Promise(async (resolve, reject) => {
			try {
				let events = new EventEmitter()
				let serv = await genStore(events)
				
				events.on('object-change', (one, two) => {
					console.log(`object change: ${JSON.stringify(one)} ${two}`)
				})

				let dat = {
					msg: 'hello'
				}
				let [r] = await serv.save(Object.assign({}, dat))
				assert.isNotNull(r.id)
				let id2 = r.id
				let id = id2

				let result = await serv.fetch()
				assert.equal(result.length, 1)

				result = await serv.fetchOne(id)
				assert.equal(result.msg, 'hello')

				result = await serv.fetchOne(id.toString())
				assert.equal(result.msg, 'hello')
				
				result.msg = 'hi'
				await serv.save(result)
				
				result = await serv.fetchOne(id.toString())
				assert.equal(result.msg, 'hi')

				result = await serv.fetchOne({id: id2})
				assert.equal(result.msg, 'hi')

				result = await serv.fetchOne(id2)
				assert.equal(result.msg, 'hi')

				result = await serv.remove(id.toString())

				result = await serv.fetchOne(id.toString())
				assert.isFalse(!!result)
				
				
				let promises = serv.saveMany([
					{msg: 'hello'}
					, {msg: 'world'}
				])
				await Promise.all(promises)

				result = await serv.fetch()
				assert.equal(result.length, 2)
				
				let ids = result.map(item => item.id)
				let ids2 = result.map(item => item._id.toString())
				
				result = await serv.fetch({})
				assert.equal(result.length, 2)
				
				result = await serv.fetchOne(ids)
				assert.isNotNull(result)

				result = await serv.fetchOne(ids2)
				assert.isNotNull(result)
				
				result = await serv.fetch(serv.createIdQuery(ids))
				assert.equal(result.length, 2)

				result = await serv.fetch(serv.createIdQuery(ids2))
				assert.equal(result.length, 2)
				
				result = await serv.fetch({name: 'Kolz'})
				assert.equal(result.length, 0)


				await serv.save({name: 'Kolz', count: 1})
				result = await serv.fetch({name: 'Kolz'})
				assert.equal(result.length, 1)
				assert.equal(result[0].count, 1)

				await serv.save({name: 'Kolz', count: 2})
				await serv.save({name: 'Kolz', count: 3})
				result = await serv.fetch({name: 'Kolz'})
				assert.equal(result.length, 3)
				
				result = await serv.fetch({})
				assert.equal(result.length, 5)
				result = await serv.fetch()
				assert.equal(result.length, 5)
				
				await serv.remove({})
				result = await serv.fetch()
				assert.equal(result.length, 0)

				await serv.save({name: 'Kolz', count: 2})
				await serv.save({name: 'Kolz', count: 3})
				result = await serv.fetch({name: 'Kolz'})
				assert.equal(result.length, 2)

				await serv.remove()
				result = await serv.fetch()
				assert.equal(result.length, 0)
			}
			catch(e) {
				console.log(e)
				return reject('error')
			}
			resolve()
		})
		return p
	})
})













