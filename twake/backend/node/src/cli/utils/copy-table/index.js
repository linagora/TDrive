/* eslint-disable */
var cassandra = require("cassandra-driver");

var authProvider = new cassandra.auth.PlainTextAuthProvider("", "");
var contactPoints = [""];
var from = "table_a";
var to = "table_b";

var client = new cassandra.Client({
  localDataCenter: "datacenter1",
  contactPoints: contactPoints,
  authProvider: authProvider,
  keyspace: "tdrive",
});

//Copy object to other table
(async () => {
  const query = "SELECT * FROM " + from;
  const parameters = [];

  let count = 0;
  let max = 0;
  let min = new Date().getTime();

  let rows = [];

  const options = { prepare: true, fetchSize: 1000 };

  await new Promise(r => {
    client.eachRow(
      query,
      parameters,
      options,
      function (n, row) {
        min = Math.min(parseInt(row.created_at.toString()), min);
        max = Math.max(parseInt(row.created_at.toString()), max);
        count++;
        if (count % 100 == 0) {
          console.log(count);
        }
        rows.push(row);
      },
      function (err, result) {
        if (result && result.nextPage) {
          result.nextPage();
        } else {
          r();
        }
      },
    );
  });

  console.log("Downloaded ", count, " rows of ", from, ". Starting copy...");

  let copyCount = 0;

  for (let i = 0; i < count; i++) {
    copyCount++;
    if (copyCount % 100 == 0) {
      console.log(copyCount, "of", count);
    }

    const row = rows[i];

    await new Promise(r => {
      let query =
        "UPDATE " +
        to +
        " SET answers=?, created_at=?, created_by=?, last_activity=?, participants=?, updated_at=? WHERE id=?";
      client.execute(
        query,
        [
          row.answers,
          row.created_at,
          row.created_by,
          row.last_activity,
          row.participants,
          row.updated_at,
          row.id,
        ],
        () => {
          r();
        },
      );
    });
  }
  console.log("Ended with ", count, "threads");
})();
