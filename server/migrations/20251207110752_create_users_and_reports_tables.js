exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("google_id").unique();
      table.string("email").notNullable().unique();
      table.string("name");
      table.timestamps(true, true);
    })
    .createTable("reports", (table) => {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.text("description");
      table.string("category").notNullable();
      table.decimal("latitude", 10, 7);
      table.decimal("longitude", 10, 7);
      table
        .enu("status", ["open", "in-progress", "resolved"])
        .defaultTo("open");
      table
        .integer("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("reports")
    .dropTableIfExists("users");
};
