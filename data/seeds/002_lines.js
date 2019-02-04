exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries

  let seeds = [];
  let seeds2 = [];
  let count = 1;

  for (let year = 2009; year <= 2019; year++) {
    for (let month = 1; month <= 2; month++) {
      for (let day = 1; day <= 9; day++) {
        seeds.push({
          user_id: 1,
          line: `Test line number: ${count}`,
          date: `${year}-0${month}-0${day}`
        });
        seeds2.push({
          user_id: 2,
          line: `Test line number: ${count}`,
          date: `${year}-0${month}-0${day}`
        });
        count++;
      }
    }
  }

  return knex("lines")
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex("lines")
        .insert(seeds)
        .then(function() {
          return knex("lines").insert(seeds2);
        });
    });
};
