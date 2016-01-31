'use strict';

var sinon = require('sinon');
var Promise = require('bluebird');
var Manager = require('../../lib/manager');

describe('Sync', function () {
  var knex, manager, schemas;

  beforeEach(function () {
    knex = { schema: {} };
  });

  describe('given empty arguments', function () {
    beforeEach(function () {
      knex.schema.hasTable = sinon.spy();
      manager = new Manager(knex);
    });

    it('should do nothing', function (done) {
      manager.sync()
      .then(function () {
        expect(knex.schema.hasTable).to.not.have.been.called;
        done();
      })
      .catch(done);
    });
  });

  describe('given no schemas', function () {
    beforeEach(function () {
      knex.schema.hasTable = sinon.spy();
      manager = new Manager(knex);
      schemas = [];
    });

    it('should do nothing', function (done) {
      manager.sync(schemas)
      .then(function () {
        expect(knex.schema.hasTable).to.not.have.been.called;
        done();
      })
      .catch(done);
    });
  });

  describe('given existing schemas', function () {
    beforeEach(function () {
      knex.schema.hasTable = sinon.spy(function () {
        return Promise.resolve(true);
      });
      knex.schema.createTable = sinon.spy(function () {
        return Promise.resolve();
      });
      schemas = [
        { tableName: 'a', build: sinon.spy() },
        { tableName: 'b', build: sinon.spy() }
      ];
      manager = new Manager(knex);
    });

    it('should do nothing', function (done) {
      manager.sync(schemas)
      .then(function () {
        expect(knex.schema.hasTable).to.have.been.calledTwice;
        expect(knex.schema.hasTable).to.have.been.calledWith('a');
        expect(knex.schema.hasTable).to.have.been.calledWith('b');
        expect(knex.schema.createTable).to.not.have.been.called;
        done();
      })
      .catch(done);
    });
  });

  describe('given non existing schemas', function () {
    var table;

    beforeEach(function () {
      table = {
        engine: sinon.spy(),
        timestamps: sinon.spy(),
        charset: sinon.spy(),
        timestamp: sinon.spy(),
        defaultTo: sinon.spy()
      };

      knex.schema.hasTable = sinon.spy(function () {
        return Promise.resolve(false);
      });
      knex.schema.createTable = sinon.spy(function (tableName, tableFactory) {
        return Promise.resolve(tableFactory(table));
      });

      schemas = [
        { tableName: 'a', engine: 'InnoDB', charset: 'utf8', timestamps: true, build: sinon.spy() },
        { tableName: 'b', charset: 'utf8', build: sinon.spy() },
        { tableName: 'c', timestamps: true, createdAtDefault: 'now()', build: sinon.spy() }
      ];
      manager = new Manager(knex);
    });

    it('should create tables', function (done) {
      manager.sync(schemas)
      .then(function () {
        expect(knex.schema.hasTable).to.have.been.calledThrice;
        expect(knex.schema.hasTable).to.have.been.calledWith('a');
        expect(knex.schema.hasTable).to.have.been.calledWith('b');
        expect(knex.schema.hasTable).to.have.been.calledWith('c');
        expect(knex.schema.createTable).to.have.been.calledThrice;
        expect(knex.schema.createTable).to.have.been.calledWith('a');
        expect(knex.schema.createTable).to.have.been.calledWith('b');
        expect(knex.schema.createTable).to.have.been.calledWith('c');

        expect(table.engine).to.have.been.calledWith('InnoDB');
        expect(table.charset).to.have.been.calledTwice;
        expect(table.charset).to.have.been.calledWith('utf8');
        expect(table.timestamps).to.have.been.calledTwice;
        expect(table.timestamps).to.have.been.calledWith('now()');

        expect(schemas[0].build).to.have.been.calledOnce;
        expect(schemas[0].build).to.have.been.calledWith(table);

        expect(schemas[1].build).to.have.been.calledOnce;
        expect(schemas[1].build).to.have.been.calledWith(table);

        expect(schemas[2].build).to.have.been.calledOnce;
        expect(schemas[2].build).to.have.been.calledWith(table);
        done();
      })
      .catch(done);
    });
  });
});
