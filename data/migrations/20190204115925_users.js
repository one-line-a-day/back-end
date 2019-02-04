exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", tbl => {
    tbl.increments();

    tbl
      .string("username", 255)
      .notNullable()
      .unique();

    tbl
      .string("email", 255)
      .notNullable()
      .unique();

    tbl.text("name", 128);

    tbl.string("password", 255).notNullable();

    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("users");
};
