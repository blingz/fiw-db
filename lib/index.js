var pool = require('fib-pool')
var db = require('db')
var util = require('util')

function dbs(pool) {

  /**
   * return pool
   */
  this.pool = function() {
    return pool
  }

  /**
   * 连接方式
   * conn(function(conn) { conn.execute(sql) })
   */
  this.conn = function(fn) {
    return pool(conn => {
      return fn(conn)
    })
  }

  /**
   * 事务方式 
   * 参考 http://fibjs.org/docs/manual/object/ifs/dbconnection.md.html#trans
   */
  this.trans = function(fn) {
    return pool(conn => {
      return conn.trans(fn)
    })
  }

  /**
  * query(sql, [1,2,3], row_func)
  * query(sql, 1, 2, 3, row_func)
  * return list or []
  */
  this.query = function(sql, ...args) {
    var row_func = null
    var params = [sql]
    for(var n=0; n<args.length; n++) {
      if(util.isArray(args[n])) {
        params = params.concat(args[n])
      }else if(util.isFunction(args[n])) {
        row_func = args[n]
      }else {
        params.push(args[n])
      }
    }
    return this.conn(conn => {
      var rs = conn.execute(...params)
      if(!rs || rs.length<1) {
        return []
      }else if(row_func) {
        var aa = []
        rs.forEach(row => {
          aa.push(row_func(row))
        })
        return aa
      }
      return rs
    })
  }

  /**
  * queryOne(sql, [1,2,3], row_func)
  * queryOne(sql, 1, 2, 3, row_func)
  * return {...} or null
  */
  this.queryOne = function(...args) {
    var rs = this.query(...args)
    if(rs.length>0) {
      return rs[0]
    }
    return null
  }

  /**
   * execute(sql)
   * execute(sql, p1, p2, p3...)
   * execute(sql, [p1, p2, p3...])
   */
  this.execute = function(sql, ...args){
    if(args.length == 1 && util.isArray(args[0])){
      args = [sql].concat(args[0])
    }else{
      args = [sql].concat(args)
    }
    return this.conn(conn => {
      return conn.execute(...args)
    })
  }
}


var cache = {}
module.exports = function(name, opts) {
  var name = name||'db'
  if(cache[name]) {
    return cache[name]
  }

  var p =  pool(opts)
  var s = new dbs(p)
  cache[name] = s
  return s
}
