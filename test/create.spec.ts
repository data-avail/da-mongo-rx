/// <reference path="../typings/tsd.d.ts"/>
/// <reference path="../dist/index.d.ts"/>
var expect = require('chai').expect;
import mongoRx = require('../dist/index');

describe("create tests",  () => {
	
	it("create some test record",  (done) => {		
		var db = new mongoRx.MongoDb("192.168.0.103:8082/test", ["test"]);		
		db.getCollection("test").insert("test", {test : "some"}).subscribe((val) => done(null));																
	})
		
}) 
