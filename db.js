const fastifyPlugin = require('fastify-plugin');

async function dbConnector(fastify, options) {
  const notes = [
    { id: 1, title: 'title', description: 'description', isDone: false, isImportant: false, isDelete: false, date: new Date() },
    { id: 2, title: 'title', description: 'description', isDone: false, isImportant: false, isDelete: false, date: new Date() },
  ];

  const db = {
    get: () => notes.filter(n => !n.isDelete),
    add: (note) => {
      const data = { id: notes.length + 1, ...note, isDelete: false, date: new Date() };
      notes.push(data);
      return data;
    },
    getById: (id) => {
      const note = notes.filter(n => n.id === id);
      return note.length ? note[0] : null;
    },
    changeDone: (id, isDone) => {
      const index = notes.findIndex(n => n.id === id);
      if (index > -1) {
        notes[index].isDone = isDone;
        return notes[index];
      } else {
        return null;
      }
    },
    delete: (id) => {
      const index = notes.findIndex(n => n.id === id);
      if (index > -1) {
        notes[index].isDelete = true;
        return notes[index];
      } else {
        return null;
      }
    },
    update: (id, { title, description, isImportant }) => {
      const index = notes.findIndex(n => n.id === id);
      if (index < 0) {
        return null;
      }
      const note = notes[index];
      if (title) {
        note.title = title;
      }
      if (description) {
        note.description = description;
      }
      if (isImportant === true || isImportant === false) {
        note.isImportant = isImportant;
      }
      notes[index] = note;
      return notes[index];
    }
  }

  fastify.decorate('note', db);
  fastify.register(require('fastify-cors'), { origin: '*' });
}

module.exports = fastifyPlugin(dbConnector);
