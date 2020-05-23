'use strict'

const { test } = require('tap')
const { build } = require('../helper')

test('default root route', (t) => {
  // t.plan(2)
  const app = build(t)

  app.inject({
    url: '/notes'
  }, (err, res) => {
    t.error(err)
    t.equal(JSON.parse(res.payload).length, 2);
    t.done();
  })
})

test('should 3 when call POST notes', (t) => {
  const app = build(t);
  app.inject({
    url: '/notes',
    method: 'POST',
    body: {
      title: 'test'
    }
  }, () => {
    app.inject({
      url: '/notes'
    }, (err, res) => {
      t.error(err);
      t.equal(JSON.parse(res.payload).length, 3);
      t.done();
    })
  })
})

test('should error when call POST notes', (t) => {
  const app = build(t);
  app.inject({
    url: '/notes',
    method: 'POST',
    body: {
    }
  }, (err, res) => {
    t.error(err);
    t.equal(res.statusCode, 400);
    const body = JSON.parse(res.payload);
    t.equal(body.message, `body should have required property 'title'`);
    t.done();
  })
});

test('should get id 1', (t) => {
  const app = build(t);
  app.inject({
    url: '/notes/1'
  }, (err, res) => {
    t.error(err);
    const body = JSON.parse(res.payload);
    t.equal(body.id, 1);
    t.done();
  })
})

test('should error when get id 3', (t) => {
  const app = build(t);
  app.inject({
    url: '/notes/3'
  }, (err, res) => {
    t.error(err);
    const body = JSON.parse(res.payload);
    t.equal(res.statusCode, 404);
    t.equal(body.message, 'Not found');
    t.done();
  })
})

// If you prefer async/await, use the following
//
// test('default root route', async (t) => {
//   const app = build(t)
//
//   const res = await app.inject({
//     url: '/'
//   })
//   t.deepEqual(JSON.parse(res.payload), { root: true })
// })
