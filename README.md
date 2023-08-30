# IndexedDBDataService

An implementation of the AbstractDataService interface for the browser's IndexedDB database. By default,
it uses the same query syntax as MongoDB. Anything except a query based on the id will not be fast if
there's a lot of documents, but it is functional.

## Install

```bash
npm install @dankolz/indexeddb-data-service
```

## Usage

In the browser

```js
const DataService = require('@dankolz/indexeddb-data-service')

async function run(events) {
	let serv = new DataService({
		collections: {
			/* the name of the store (table/collection) name */
			default: 'people'
		}
		, databaseName: 'databasename'
	})
	
	await serv.init()
	
	await serv.save({firstName: 'Dan', lastName: 'Kolz'})
	let person = await serv.fetchOne({lastName: 'Kolz'})
	
	document.querySelector('#results').innerHTML = person.firstName
	
	await serv.remove(person.id)
}

run()

```


## API

It's the api as used in [@dankolz/abstract-data-service](https://www.npmjs.com/package/@dankolz/abstract-data-service) and
the other implementation of the abstract data service 
[@dankolz/mongodb-data-service](https://www.npmjs.com/package/@dankolz/mongodb-data-service)