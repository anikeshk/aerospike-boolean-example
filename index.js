const Aerospike = require("aerospike");

let client = Aerospike.client({
  hosts: [{ addr: "aerospike", port: 3000 }],
  log: {
    level: Aerospike.log.INFO,
  },
});

// namespace: test, set: users, PK: tom
let key = new Aerospike.Key("test", "users", "tom");

let bins = {
  age: 21,
  gender: "male",
  food: { pizza: false, burger: true, taco: true },
};

client
  .connect(function (error) {
    if (error) {
      console.log("Connection to Aerospike cluster failed!");
    } else {
      console.log("Connection to Aerospike cluster succeeded!");
    }
  })
  .then(function () {
    // Input user data using a frontend webpage and store it in the database
    client.put(key, bins, function (error) {
      if (error) {
        console.error("Error occurred while storing user data!", error);
      } else {
        console.log("User data stored!");
      }
    });
  })
  .then(function () {
    // Backend service that queries that user's details for processing
    client.get(key, function (error, record) {
      if (error) {
        console.error("Error occurred while getting user data!", error);
      } else {
        console.log("User data fetched!", JSON.stringify(record.bins));
      }
      client.close();
    });
  })
  .catch(function (error) {
    return console.error(error);
  });
