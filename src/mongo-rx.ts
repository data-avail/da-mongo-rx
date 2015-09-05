///<reference path="../typings/tsd.d.ts"/>
import Rx = require("rx");
var mongojs = require('mongojs')
var RxNode = require("rx-node");

/**
 * Every method (even write action) must be subscribed to be executed. 
 */
module mongoRx {
		
	/**
	 * Chinable query object.
	 */		
	export interface ICursor {
		sort(sort: any) : ICursor
		limit(count: number) : ICursor
		skip(count: number) : ICursor
		/**
		 * Create stream of resulted query objects. 
		 * @return
		 * Observable with streamed object
		 */		
		query<T>():  Rx.Observable<T>
		/**
		 * Return collection of resulted query objects at once.
		 * @return 
		 * Collection of results
		 */
		toArray<T>():  Rx.Observable<T[]>
	}   
	
	export interface IBulkFind {
		
		remove() : any
		
		removeOne() : any
		
		replaceOne() : any
		
		update(updaterParam: any) : any
		
		updateOne(updaterParam: any) : any
		
		upsert(upsertParam: any) : any		
	}
	
	export interface IBulkResult { 
		writeErrors: any[],
		writeConcernErrors: any[],
		nInserted: number,
		nUpserted: number,
		nMatched: number,
		nModified: number,
		nRemoved: number,
		upserted: any[],
		ok: number 
	}
	
	export interface IBulk {
		
		execute() : Rx.Observable<any>

		find(query: any) : IBulkFind
				
		insert(document: any) : any
		
		toString(): string		
	}
	
	export interface ICommandResult {
		ok : boolean
		n : number
	}

	export interface IFindAndModifyResult {
		doc : any
		command : ICommandResult
	}
			
	class Cursor implements ICursor {
		constructor(private cursor: any) {			
		}

		private fromNode<T>(funcName: string) : (arg1?: any, arg2?: any, arg3?: any) => Rx.Observable<T> {
			return (<any>Rx.Observable).fromNodeCallback(this.cursor[funcName], this.cursor);
		}
				
		sort(sort: any) : ICursor {
			this.cursor.sort(sort);
			return this;
		}
		
		limit(count: number) : ICursor {
			this.cursor.limit(count);
			return this;
		}
		
		skip(count: number) : ICursor {
			this.cursor.skip(count);
			return this;
		}
				
		query<T>():  Rx.Observable<T> {
			return RxNode.fromReadableStream(this.cursor);
		}
		
		toArray<T>():  Rx.Observable<T[]> {
			return this.fromNode<T[]>("toArray")();
		}		
	}
	
		
	class Bulk implements IBulk {
		
		private bulk: any;
		
		constructor(coll: any) {
			this.bulk = coll.initializeOrderedBulkOp();  			
		}
		
		/**
		 * Convert nodeCallback collection function to Rx.Observable object
		 */
		private fromNode<T>(funcName: string) : (arg1?: any, arg2?: any, arg3?: any) => Rx.Observable<T> {
			return (<any>Rx.Observable).fromNodeCallback(this.bulk[funcName], this.bulk);
		}
		
		execute() : Rx.Observable<any> {
			return this.fromNode<any>("execute")();
		}

		find(query: any) : IBulkFind {
			return this.bulk.find(query);
		}
				
		insert(document: any) : void {
			return this.bulk.insert(document);
		}
		
		toString(): string {
			return this.bulk.toString();
		} 				
	}
	
	/**
	 * Collection object.
	 */
	export class Collection {
		/**
		 * Create collection object from mongojs collection.
		 * @param coll
		 * mongojs collection
		 */
		constructor(private coll: any) {			
		}
				
		/**
		 * Create query cursor object.
		 * @param query
		 * Mongo query json
		 * @return Cursor object 
		 */						
		find(query: any, select?: any) : ICursor {						
			return new Cursor(this.coll.find(query, select));									
		}					
		
		/**
		 * Convert nodeCallback collection function to Rx.Observable object
		 */
		private fromNode<T>(funcName: string) : (arg1?: any, arg2?: any, arg3?: any) => Rx.Observable<T> {
			return (<any>Rx.Observable).fromNodeCallback(this.coll[funcName], this.coll);
		}

		/**
		 * Insert object into collection.
		 * @param data 
		 * Object to insert
		 * @return 
		 * Observable with created object
		 */		
		insert<T>(data: any) : Rx.Observable<T> {
			return this.fromNode<T>("insert")(data);			
		}
		
		/**
		 * Remove objects by filter.
		 * @param filter
		 * Mongo filter json object.
		 */
		remove(filter: any) : Rx.Observable<any> {
			return this.fromNode("remove")(filter);
		} 
		
		update(query: any, upd : any) : Rx.Observable<any> {
			return this.fromNode("update")(query, upd);
		}
		
		findAndModify(upd : any) : Rx.Observable<IFindAndModifyResult> {
			return this.fromNode("findAndModify")(upd)
			.map<any>((val: any) => {
				return {doc : val[0], command : val[1]}
			});
		}
		
		/**
		 * Start bulk operation
		 */
		bulk() : IBulk {
			return new Bulk(this.coll);
		}
		
	}
		
	/**
	 * Database connection and operations
	 */		
	export class MongoDb {
		
		private db: any;
		private collections: any = {};
		
		/**
		 * Create database connection.
		 * @param connectionString 
		 * Mongo db connection uri
		 * @param collectionNames 
		 * Name of used collections
		 */
		constructor(connectionString: string, collectionNames: string[]) {			
			this.db = mongojs(connectionString, collectionNames);
			collectionNames.forEach(x => this.collections[x] = new Collection(this.db[x]));														
		}
		
		/**
		 * Get collection by name.
		 * @param name 
		 * Name of the collection
		 * @return Collection object.
		 */
		getCollection(name: string) : Collection{
			return this.collections[name];
		}
		
		/**
		 * Run some mongo command.
		 */		
		runCommand(command: any) : Rx.Observable<ICommandResult> {
			return (<any>Rx.Observable).fromNodeCallback(this.db.runCommand, this.db)(command);		
		}
	
		/**Create record in collection
		 * Returns true if record was created and not exists before
		 * Returns false if record already existed.
		 * params
		 * @id Record Id.
		 * @collName collection name.
		 * @replicas number of replicas to write record (default 1). 
		 */
  		lock(id: string, collName: string, replicas: number = 1): Rx.Observable<boolean> {

            var command = {
                insert: collName,
                documents: [{_id: id}],
                ordered: false,
                writeConcern: {w: replicas}
            };

			return this.runCommand(command)
			.map((r: any) => r.ok && r.n == 1);
											
        }	
		
		//http://docs.mongodb.org/master/tutorial/create-an-auto-incrementing-field/
		
		/*
		insertDocumentWithNumberId(doc: any, targetCollection: string) : Rx.Observable<any> {
			
			var coll = this.getCollection(targetCollection); 

			return coll.find({}, { _id: 1 }).sort( { _id: -1 } ).limit(1)
			.toArray()
			.map((val: number[]) => {doc._id = val[0] + 1; return doc})
			.flatMap(val => coll.insert(val))
			//.doWhile((res: any) => res.writeError.code == 11000) 
			.map((res: any) => res.writeError ? Rx.Observable.throw(res) : res);
		}
		*/
		
		
		/**
		 * Key field must be unique on target collection
		 */
		insertUniqueDocumentWithKey(_id: string, targetCollection: string, keySelector?: (prevKey: any) => any ) : Rx.Observable<number> {
						
			var coll = this.getCollection(targetCollection); 
			var selector = (val: any) => keySelector ? keySelector(val) : (val ? val + 1 : 1);
			var cursor = coll.find({}, { key: 1 }).sort( { key: -1 }).limit(1);
													
			return cursor.query<{key: any}>()
			.defaultIfEmpty({key: null})
			.first()									
			.map(val => selector(val.key))
			.map(val => {return {_id : _id, key: val}})
			.flatMap(val => coll.insert(val))					 
			.map((res: any) => res.writeError ? Rx.Observable.throw(res) : res.key)
			.retryWhen(errs => errs.some(val => val.writeError.code == 11000));
		}
	}		
}

export = mongoRx;
