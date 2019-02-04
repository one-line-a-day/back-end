exports.up = function(knex, Promise) {
  return knex.schema.createTable("lines", tbl => {
    tbl.increments();

    tbl.text("line").notNullable();

    tbl
      .integer("user_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .notNullable();

    tbl.string("img_url");

    tbl.date("date").notNullable();

    tbl.unique(["user_id", "date"], "uq_lines_user_and_date");

    tbl.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("lines");
};
