var test = require('test');
test.setup();

var fs = require('fs')
var db = require('db')
var DBS = require('../')
var dbs = null

describe("fiw-db", () => {

  before(() => {
    dbs = DBS('test', {
      create: () => {
          return db.openSQLite("test_db.db")
      },
      destroy: (o) => {
          o.close()
      },
      timeout: 30 * 1000,
      retry: 3
    })

  })
  
  after(() => {
    fs.unlink("test_db.db");
  });

  it('test db', () => {

    dbs.execute(`CREATE TABLE kv (
        k VARCHAR(200) not null,
        v VARCHAR(2000) not null) `)


    dbs.execute(`insert into kv (k,v) values(?,?)`, 'abc', 123)

    var one = dbs.queryOne('select k, v from kv where k=?', 'abc')
    assert.equal(123, one.v)

  })

})

test.run(console.DEBUG);