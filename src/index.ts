///<reference path="../typings/tsd.d.ts"/>
import Rx = require("rx");
var mongojs = require('mongojs')
var RxNode = require("rx-node");

module mongoRx {
		
	export interface ICursor {
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
	
	export class Collection {
		constructor(private coll: any) {
			
		}
				
		find<T>(query: any) : ICursor {						
			return new Cursor(this.coll.find(query));									
		}					
		
		private fromNode<T>(funcName: string) : (arg1?: any, arg2?: any, arg3?: any) => Rx.Observable<T> {
			return (<any>Rx.Observable).fromNodeCallback(this.coll[funcName], this.coll);
		}
		
		insert<T>(data: any) : Rx.Observable<T> {
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
