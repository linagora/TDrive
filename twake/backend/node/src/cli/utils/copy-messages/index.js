/* eslint-disable */
var cassandra = require("cassandra-driver");

var fromAuthProvider = new cassandra.auth.PlainTextAuthProvider("", "");
var fromContactPoints = [""];

var toAuthProvider = new cassandra.auth.PlainTextAuthProvider("", "");
var toContactPoints = [""];

// -- start process

var fromClient = new cassandra.Client({
  localDataCenter: "datacenter1",
  contactPoints: fromContactPoints,
  authProvider: fromAuthProvider,
  keyspace: "tdrive",
});

var toClient = new cassandra.Client({
  localDataCenter: "datacenter1",
  contactPoints: toContactPoints,
  authProvider: toAuthProvider,
  keyspace: "tdrive",
  queryOptions: {
    consistency: cassandra.types.consistencies.quorum,
  },
});

// -- Get all tables and copy schema

async function client(origin, query, parameters, options) {
  return await new Promise((resolve, reject) => {
    origin.execute(query, [], {}, function (err, result) {
      if (err) {
        reject({ err, result });
      } else {
        resolve(result);
      }
    });
  });
}

// Get all threads and then copy all messages in each threads

let copiedMessages = 0;
let copiedThreads = 0;

(async () => {
  await new Promise(r => {
    fromClient.eachRow(
      "SELECT id from tdrive.threads",
      [],
      { prepare: true, fetchSize: 50 },
      async function (n, row) {
        const threadId = row["id"];

        console.log("Threads / Messages :", copiedThreads, "/", copiedMessages);

        copiedThreads++;

        await new Promise(r2 => {
          fromClient.eachRow(
            "SELECT JSON * from tdrive.messages where thread_id = ? order by id desc",
            [threadId],
            { prepare: true, fetchSize: 1000 },
            async function (n, row) {
              const message = row["[json]"];

              copiedMessages++;

              await toClient.execute(
                "INSERT INTO tdrive.messages JSON '" + message.replace(/'/g, "'$&") + "'",
                [],
                { prepare: true },
              );
            },
            async function (err, result) {
              if (result && result.nextPage) {
                await new Promise(r => setTimeout(r, 100));
                result.nextPage();
              } else {
                r2();
              }
            },
          );
        });
      },
      async function (err, result) {
        if (result && result.nextPage) {
          await new Promise(r => setTimeout(r, 2000));
          result.nextPage();
        } else {
          r();
        }
      },
    );
  });
})();
