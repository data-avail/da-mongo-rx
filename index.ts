///<reference path="./typings/tsd.d.ts"/>
import Rx = require("rx");

var mongojs = require('mongojs')
  

module da.mongo.rx {  
	
	export class MongoDb {
		
		private db: any;
		
		constructor(connectionString: string, collections: string[]) {
			
			this.db = mongojs(connectionString, [collections]);
			
			
		}
			
	}
}
