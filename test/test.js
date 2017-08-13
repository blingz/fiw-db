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
    dbs.execute(`insert into kv (k,v) values(?,?)`, 'xyz', 'hello')

    var one = dbs.queryOne('select k, v from kv where k=?', 'abc')
    assert.equal(123, one.v)

    one = dbs.queryOne('select k, v from kv where k=?', ['xyz'])
    assert.equal('hello', one.v)

    one = dbs.queryOne('select k, v from kv where k=?', ['xyz'], row => {
            return {key: row.k, value: row.v}
          })
    assert.equal('xyz', one.key)
    assert.equal('hello', one.value)

    var rs = dbs.execute('select k, v from kv where k=?', 'abc')
    assert.equal(123, rs[0].v)

    rs = dbs.query('select k, v from kv where k=?', 'abc')
    assert.equal(123, rs[0].v)

    dbs.conn(conn => {
      var rs = conn.execute('select k, v from kv where k=?', 'abc')
      assert.equal(123, rs[0].v)
    })

    //test pool
    var pool = dbs.pool()
    assert.isNotNull(pool)
    assert.isNotNull(pool.connections)
    assert.isNotNull(pool.clear)
    
    //test cache for name
    var dbs1 = DBS('test')
    assert.equal(dbs1, dbs)
  })

})

test.run(console.DEBUG);