const bcrypt = require("bcryptjs");

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("users")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("users").insert([
        {
          username: "TestUser1",
          email: "fake@fake.fake",
          name: "Fake Person",
          password: bcrypt.hashSync("pass", 12)
        },
        {
          username: "TestUser2",
          email: "test@fake.fake",
          name: "Another Fake",
          password: bcrypt.hashSync("pass", 12)
        }
      ]);
    });
};
