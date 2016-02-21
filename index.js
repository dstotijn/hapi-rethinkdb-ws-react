'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const r = require('rethinkdb');

server.connection({
  port: process.env.PORT || 8000
});

server.register([require('inert'), require('nes')], (err) => {

  if (err) throw err;

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'dist',
        listing: true
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/messages',
    handler: (request, reply) => {
      r.connect()
        .then((conn) => {

          return r.db('hapi_rethinkdb_ws_react').table('messages')
            .insert(request.payload, {returnChanges: true})
            .run(conn);
        })
        .then((data) => {

          reply(data.changes[0].new_val);
        })
        .error((err) => {

          console.error(err);
          reply('error!');
        });
    }
  })

  server.subscription('/messages');
});

server.start(() => {

  r.connect()
    .then((conn) => {

      return r.db('hapi_rethinkdb_ws_react')
        .table('messages').changes().run(conn, (err, cursor) => {

          if (err) reply('error!');

          cursor.each((err, row) => {

            if (err) reply('error!');

            if (row.new_val) {
              server.publish('/messages', row.new_val);
            }
          });
        });
    })
    .error((err) => {

      console.error(err);
    });

  console.log('Server running at:', server.info.uri);
});
