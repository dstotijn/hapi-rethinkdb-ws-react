'use strict';

const r = require('rethinkdb');

r.connect()
  .then((conn) => {

    r.dbCreate('hapi_rethinkdb_ws_react').run(conn);
    return conn;
  })
  .then((conn) => {

    r.db('hapi_rethinkdb_ws_react').tableCreate('messages').run(conn);
  })
  .error((err) => {

    throw err;
  });
