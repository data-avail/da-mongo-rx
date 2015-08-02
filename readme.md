# Mongo-Rx

Thin layer on top of [mongojs](https://github.com/mafintosh/mongojs) library 
exposes [RxJS](https://github.com/Reactive-Extensions/RxJS) interfaces.

Contains typeScript defintion files. 

## Test

Set up uri for test db 

+ In `.npmrc` set `MONGO_URI=xxx`, higest priority
+ In `package.json` field `config.MONGO_URI` (defualt `127.0.0.1`)

Run test
 
`npm test`

## Development

Project contians `tasks` file for Visual Studio Code

+ Build - run `tsc`, same as `npm run-task build`
+ Test - run `mocha`, same as `npm test`

For some reason VS Code take quite a time to start build,
usually watch rebuild proccess via `tsc -w` work much faster.

This way use `tsc -w` in console and then run test task manually,
when neccessary.   