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
	
	export class MongoDb {
		
		private db: any;
		
		constructor(connectionString: string, collections: string[]) {			
			this.db = mongojs(connectionString, collections);														
		}
		
		runCommand(collection: string, command: any) : Rx.Observable<ICommandResult> {
			return (<any>Rx.Observable).fromNodeCallback(this.db.runCommand)(command);		
		} 
		
		/**
		 * Create query stream
		 */
		find<T>(collection: string, query: any) : ICursor {
			return null;				
		}					
		
		insert<T>(collection: string, data: any) : Rx.Observable<any> {
			/*
			this.db[collection].insert(data, (err: any, data: any) => {
				console.log(err, data);
			});
			return null;
			*/
			return (<any>Rx.Observable).fromNodeCallback(this.db[collection].insert, this.db[collection])(data);
			
		}		
	}
	

}

export = mongoRx;
