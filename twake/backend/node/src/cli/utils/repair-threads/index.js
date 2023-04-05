/* eslint-disable  */
var cassandra = require("cassandra-driver");

var authProvider = new cassandra.auth.PlainTextAuthProvider("", "");
var contactPoints = [""];

var client = new cassandra.Client({
  localDataCenter: "datacenter1",
  contactPoints: contactPoints,
  authProvider: authProvider,
  keyspace: "tdrive",
});

var threadsTable = "threads";
var messagesTable = "messages";

//Copy object to other table
(async () => {
  const query = "SELECT * FROM " + threadsTable + " where answers>1000 allow filtering";
  const parameters = [];
  const options = { prepare: true, fetchSize: 1000 };

  let count = 0;

  let threads = {};

  await new Promise(r => {
    client.eachRow(
      query,
      parameters,
      options,
      function (n, row) {
        threads[row.id] ||= { answers: 0, id: row.id };
        count++;
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

  console.log(
    "Downloaded ",
    Object.keys(threads).length,
    " threads of ",
    messagesTable,
    ". Starting copy...",
  );

  for (var key of Object.keys(threads)) {
    await new Promise(r => {
      const query = "SELECT id FROM " + messagesTable + " where thread_id=" + key;
      const parameters = [];
      const options = { prepare: true, fetchSize: 1000 };
      client.eachRow(
        query,
        parameters,
        options,
        function (n, row) {
          threads[key].answers++;
        },
        function (err, result) {
          if (result && result.nextPage) {
            result.nextPage();
          } else {
            r();
          }
        },
      );
      r();
    });
  }

  var copyCount = 0;
  for (var key of Object.keys(threads)) {
    copyCount++;
    if (copyCount % 100 == 0) {
      console.log(copyCount, "of", Object.keys(threads));
    }

    const row = threads[key];

    await new Promise(r => {
      let query = "UPDATE " + threadsTable + " SET answers=? WHERE id=?";
      console.log(query, [row.answers, row.id + ""]);
      //client.execute(query, [row.answers, row.id], () => {
      //  r();
      //});
    });
  }
  console.log("Ended with ", Object.keys(threads), "threads");
})();
