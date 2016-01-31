'use strict';

module.exports = [
  {
    tableName: 'first',
    timestamps: true,
    build: function (table) {
      table.increments('id').primary();
      table.string('content');
    },
    populate: function (knex) {
      return knex('first').insert([
        { content: 'first-foo' },
        { content: 'first-bar' }
      ]);
    }
  },
  {
    tableName: 'second',
    deps: ['first'],
    timestamps: false,
    build: function (table) {
      table.increments('id').primary();
      table.string('content');
    },
    populate: function (knex) {
      return knex('second').insert([
        { content: 'second-foo' },
        { content: 'second-bar' }
      ]);
    }
  },
  {
    tableName: 'third',
    timestamps: true,
    build: function (table) {
      table.increments('id').primary();
      table.string('content');
    },
    populate: function (knex) {
      return knex('third').insert([
        { content: 'third-foo' },
        { content: 'third-bar' }
      ]);
    }
  }
];
