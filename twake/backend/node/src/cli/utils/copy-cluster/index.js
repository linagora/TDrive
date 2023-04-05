/* eslint-disable */
var cassandra = require("cassandra-driver");

var fromAuthProvider = new cassandra.auth.PlainTextAuthProvider("", "");
var fromContactPoints = [""];
var fromKeyspace = "tdrive";

var toAuthProvider = new cassandra.auth.PlainTextAuthProvider("", "");
var toContactPoints = [""];
var toKeyspace = "tdrive";

var forceUpdateAll = false;
var ignoreTables = ["notification"];
var countersTables = ["statistics", "stats_counter", "channel_counters", "scheduled_queue_counter"];

var specialConversions = {
  "tdrive.group_user.date_added": value => {
    return new Date(value).getTime();
  },
};

// -- start process

var fromClient = new cassandra.Client({
  localDataCenter: "datacenter1",
  contactPoints: fromContactPoints,
  authProvider: fromAuthProvider,
  keyspace: fromKeyspace,
});

var toClient = new cassandra.Client({
  localDataCenter: "datacenter1",
  contactPoints: toContactPoints,
  authProvider: toAuthProvider,
  keyspace: toKeyspace,
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

(async () => {
  const result = await client(
    fromClient,
    "SELECT table_name from system_schema.tables WHERE keyspace_name = '" + fromKeyspace + "'",
    [],
    {},
  );
  for (row of result.rows) {
    try {
      const fromTable = fromKeyspace + "." + row.table_name;
      const toTable = toKeyspace + "." + row.table_name;

      if (ignoreTables.includes(row.table_name)) {
        console.log(fromTable.padEnd(50) + " | " + "ignored".padEnd(20) + " | ⏺");
        continue;
      }

      let fromCount = 0;

      const destColumns = (
        await client(
          toClient,
          "SELECT column_name from system_schema.columns where keyspace_name = '" +
            toKeyspace +
            "' and table_name = '" +
            row.table_name +
            "'",
          [],
          {},
        )
      ).rows.map(r => r.column_name);

      try {
        const fromResult = await client(
          fromClient,
          "SELECT count(*) from " + fromTable + "",
          [],
          {},
        );
        fromCount = parseInt(fromResult.rows[0].count);
      } catch (err) {
        fromCount = NaN;
      }

      if (destColumns.length === 0) {
        if (fromCount > 0)
          console.log(
            fromTable.padEnd(50) + " | " + ("not_in_dest" + "/" + fromCount).padEnd(20) + " | ⏺",
          );
        continue;
      }

      try {
        const toResult = await client(toClient, "SELECT count(*) from " + toTable + "", [], {});
        const toCount = parseInt(toResult.rows[0].count);

        console.log(
          fromTable.padEnd(50) +
            " | " +
            (toCount + "/" + fromCount).padEnd(20) +
            " | " +
            (toCount >= fromCount ? "✅" : "❌"),
        );

        if (row.table_name.indexOf("counter") >= 0 || countersTables.includes(row.table_name)) {
          console.log(
            fromTable.padEnd(50) + " | " + ("counter_table" + "/" + fromCount).padEnd(20) + " | 🧮",
          );
          if (fromCount > toCount || !fromCount || forceUpdateAll) {
            await new Promise(r => {
              fromClient.eachRow(
                "SELECT JSON * from " + fromTable,
                [],
                { prepare: true, fetchSize: 1000 },
                async function (n, row) {
                  //
                  //TODO handle counters (it is special !)
                },
                async function (err, result) {
                  if (result && result.nextPage) {
                    await new Promise(r => setTimeout(r, 1000));
                    result.nextPage();
                  } else {
                    r();
                  }
                },
              );
            });
          }

          continue;
        }

        if (fromCount > toCount || !fromCount || forceUpdateAll) {
          await new Promise(r => {
            fromClient.eachRow(
              "SELECT JSON * from " + fromTable,
              [],
              { prepare: true, fetchSize: 1000 },
              async function (n, row) {
                try {
                  const json = JSON.parse(row["[json]"]);

                  //The from table can have additional depreciated fields, we need to remove them
                  const filteredJson = {};
                  for (const col of destColumns) {
                    if (
                      typeof json[col] == "string" &&
                      (json[col] || "").match(
                        /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+/,
                      )
                    ) {
                      json[col] = json[col].split(".")[0];
                    }

                    if (specialConversions[fromTable + "." + col]) {
                      json[col] = specialConversions[fromTable + "." + col](json[col]);
                    }

                    if (json[col] !== undefined) filteredJson[col] = json[col];
                  }

                  await client(
                    toClient,
                    "INSERT INTO " +
                      toTable +
                      " JSON '" +
                      JSON.stringify(filteredJson).replace(/'/g, "'$&") +
                      "'",
                    [],
                    {},
                  );
                } catch (err) {
                  console.log(err);
                }
              },
              async function (err, result) {
                if (result && result.nextPage) {
                  await new Promise(r => setTimeout(r, 1000));
                  result.nextPage();
                } else {
                  r();
                }
              },
            );
          });
        }
      } catch (err) {
        console.log(
          fromTable.padEnd(50) + " | " + ("error" + "/" + fromCount).padEnd(20) + " | ❌",
        );
      }
    } catch (err) {
      console.log(err);
      continue;
    }

    //TODO copy content
  }
})();
