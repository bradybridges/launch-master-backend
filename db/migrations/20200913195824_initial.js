exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("username");
      table.string("password");
    })
    .createTable("tokens", (table) => {
      table.increments("id").primary();
      table.string("token");
    })
    .then(() => console.log('done creating tables'));
};

exports.down = function (knex) {
  return knex.schema.dropTable("tokens").dropTable("users");
};
