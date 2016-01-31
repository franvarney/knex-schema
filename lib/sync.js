'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var Resolver = require('./resolver');

/**
 * Module interface.
 */

module.exports = sync;

/**
 * Synchronize given schemas with database. If it exists, it calls `postBuild` afterwards
 *
 * @param {[Schemas]} schemas
 * @return {Promise}
 */

function sync(schemas) {
  var resolver = new Resolver(schemas);
  // Reduce force sequential execution.
  return Promise.resolve(Promise.reduce(resolver.resolve(), syncSchema.bind(this), []))
  .tap(function () {
    var knex = this.knex;
    return Promise.map(schemas || [], function(schema) {
      return (schema.postBuild || _.noop)(knex);
    });
  }.bind(this));
}

/**
 * Synchronize given schema with database.
 *
 * @param {[Schema]} result - reduce accumulator
 * @param {Schema} schema
 * @return {Promise}
 */

function syncSchema(result, schema) {
  var knex = this.knex;
  return knex.schema.hasTable(schema.tableName)
  .then(function (exists) {
    if (exists) return result;
    return knex.schema.createTable(schema.tableName, defineSchemaTable(schema))
    .then(function () {
      return result.concat([schema]);
    });
  });
}

/**
 * Define default properties on the given schema.
 *
 * @param {Schema} schema
 * @return {Function}
 */

function defineSchemaTable(schema) {
  return function (table) {
    if (schema.engine) table.engine(schema.engine);

    if (schema.timestamps) {
      if (schema.createdAtDefault) {
        table.timestamp('created_at').defaultTo(schema.createdAtDefault);
        table.timestamp('updated_at');
      } else {
        table.timestamps();
      }
    }

    if (schema.charset) table.charset(schema.charset);

    (schema.build || _.noop)(table);
  };
}
