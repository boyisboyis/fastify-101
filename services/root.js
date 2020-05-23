'use strict'

module.exports = function (fastify, opts, next) {

  const notes = [
    { id: 1, title: 'title', description: 'description', isDone: false, isImportant: false, isDelete: false },
    { id: 2, title: 'title', description: 'description', isDone: false, isImportant: false, isDelete: false },
  ];


  fastify.addSchema({
    $id: 'note',
    type: "object",
    properties: {
      id: { type: 'integer' },
      title: { type: 'string' },
      description: { type: 'string' },
      isDone: { type: 'boolean' },
      isImportant: { type: 'boolean' },
      date: { type: 'string' },
    }
  })

  fastify.get('/notes', {
    schema: {
      response: {
        '2xx': {
          type: 'array',
          items: { $ref: 'note#' }
        }
      }
    },
    handler: function (request, reply) {
      const { note } = fastify;
      reply.send(note.get().reverse())
    }
  })

  fastify.post('/notes', {
    schema: {
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', default: '' },
          isDone: { type: 'boolean', default: false, },
          isImportant: { type: 'boolean', default: false },
        }
      }
    },
    handler: function (request, reply) {
      const { title, description, isDone, isImportant } = request.body;
      const { note } = fastify;
      const data = {
        title,
        description,
        isDone,
        isImportant,
      }
      reply.send(note.add(data));
    }
  });

  fastify.get('/notes/:id', {
    schema: {
      params: {
        id: { type: 'number' }
      },
      response: {
        '404': {
          required: ['status'],
          properties: {
            message: { type: 'string' },
            status: { type: 'number' }
          }
        },
        '2xx': {
          $ref: 'note#'
        }
      }
    },
    handler: function (request, reply) {
      const { id } = request.params;
      const { note } = fastify
      const n = note.getById(id);
      if (n) {
        reply.send(n);
      } else {
        reply.status(404).send({ status: 404, message: "Not found" })
      }
    }
  })

  fastify.patch('/notes/:id/done', {
    schema: {
      params: {
        id: { type: 'number' },
      },
      body: {
        type: 'object',
        required: ['isDone'],
        properties: {
          isDone: { type: ['boolean', 'integer'], enum: [true, false, 0, 1] }
        }
      }
    },
    preHandler: function (request, reply, done) {
      const { isDone } = request.body;
      request.body.isDone = !!isDone;
      done();
    },
    handler: function (request, reply) {
      const { note } = fastify;
      const { id } = request.params;
      const { isDone } = request.body;
      const n = note.changeDone(id, isDone);
      if (n) {
        reply.send(n);
      } else {
        reply.status(404).send({ status: 404, message: 'Not found' });
      }
    }
  })

  fastify.delete('/notes/:id', {
    schema: {
      params: {
        id: { type: 'integer' }
      }
    },
    handler: function (request, reply) {
      const { note } = fastify;
      const { id } = request.params;
      const n = note.delete(id);
      if (n) {
        reply.send({ message: "Delete success" });
      } else {
        reply.status(404).send({ status: 404, message: 'Not found' });
      }
    }
  })

  fastify.put('/notes/:id', {
    schema: {
      params: {
        id: { type: 'number' },
      },
      body: {
        type: 'object',
        required: ['title', 'description', 'isImportant'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          isImportant: { type: 'boolean' },
        }
      },
    },
    attachValidation: true,
    handler: function (request, reply) {
      if (request.validationError) {
        const { params } = request.validationError.validation[0];
        reply.status(400).send(params);
        return;
      }
      const { id } = request.params;
      const { note } = fastify;
      const n = note.update(id, request.body);
      if (n) {
        reply.send(n);
      } else {
        reply.status(404).send({ message: 'Not Found', status: 404 });
      }
    }
  })

  next()
}

// If you prefer async/await, use the following
//
// module.exports = async function (fastify, opts) {
//   fastify.get('/', async function (request, reply) {
//     return { root: true }
//   })
// }
