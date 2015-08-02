///<reference path="../typings/tsd.d.ts"/>
import Rx = require("rx");
var mongojs = require('mongojs')

module mongoRx {
		
	export interface ICursor {
		find(query: any) : ICursor
		sort(sort: any) : ICursor
		limit(count: number) : ICursor
		skip(count: number) : ICursor		
		query<T>():  Rx.Observable<T>
		toArray<T>():  Rx.Observable<T[]>
	}   
	
	export interface ICommandResult {
		ok : boolean
		n : number
	}
	
	export class Collection {
		constructor(private coll: any) {
			
		}
				
		/**
		 * Create query stream
		 */
		find<T>(collection: string, query: any) : ICursor {
						
			return null;
									
		}					
		
		private fromNode<T>(funcName: string) : (arg1?: any, arg2?: any, arg3?: any) => Rx.Observable<T> {
			return (<any>Rx.Observable).fromNodeCallback(this.coll[funcName], this.coll);
		}
		
		insert<T>(collection: string, data: any) : Rx.Observable<T> {
			return this.fromNode<T>("insert")(data);			
		}
		
		remove(filter: any) : Rx.Observable<any> {
			return this.fromNode("remove")(filter);
		} 
	}
		
	export class MongoDb {
		
		private db: any;
		private collections: any = {};
		
		constructor(connectionString: string, collectionNames: string[]) {			
			this.db = mongojs(connectionString, collectionNames);
			collectionNames.forEach(x => this.collections[x] = new Collection(this.db[x]));														
		}
		
		getCollection(name: string) : any{
			return this.collections[name];
		}
				
		runCommand(collection: string, command: any) : Rx.Observable<ICommandResult> {
			return (<any>Rx.Observable).fromNodeCallback(this.db.runCommand)(command);		
		} 					
	}
	

}

export = mongoRx;
