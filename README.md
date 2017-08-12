## database

```Javascript
var DBS = require('fiw-db')
var dbs = DBS('test', {
      create: () => {
          return db.openSQLite("test_db.db")
      },
      destroy: (o) => {
          o.close()
      },
      timeout: 30 * 1000,
      retry: 3
    })

dbs.query(sql)
dbs.execute(sql)

//load again
var dbs1 = DBS('test')
dbs1.query(sql)    

```