///<reference path="../typings/tsd.d.ts"/>
import Rx = require("rx");
var mongojs = require('mongojs')
var RxNode = require("rx-node");

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
	
	export interface ICommandResult {
		ok : boolean
		n : number
	}
		
	class Cursor implements ICursor {
		constructor(private cursor: any) {			
		}

		private fromNode<T>(funcName: string) : (arg1?: any, arg2?: any, arg3?: any) => Rx.Observable<T> {
			return (<any>Rx.Observable).fromNodeCallback(this.cursor[funcName], this.cursor);
		}
				
		sort(sort: any) : ICursor {
			return this.cursor.sort(sort);
		}
		
		limit(count: number) : ICursor {
			return this.cursor.limit(count);
		}
		
		skip(count: number) : ICursor {
			return this.cursor.limit(count);
		}
				
		query<T>():  Rx.Observable<T> {
			return RxNode.fromReadableStream(this.cursor);
		}
		
		toArray<T>():  Rx.Observable<T[]> {
			return this.fromNode<T[]>("toArray")();
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
		find(query: any) : ICursor {						
			return new Cursor(this.coll.find(query));									
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
			return (<any>Rx.Observable).fromNodeCallback(this.db.runCommand)(command);		
		} 					
	}

}

export = mongoRx;
