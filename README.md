# aerospike-boolean-example

This is an experiment on how changing dependency versions can break your codebase.

You can read the full article here - https://anikeshk.com/breaking-changes-breaking-projects 

This experiment targets the aerospike Node.js module version [3.16.3](https://github.com/aerospike/aerospike-client-nodejs/blob/master/CHANGELOG.md#3163---2021-02-09), which introduced the boolean datatype for the Map datatype. Follow the instructions below to run this experiment yourself!


## Pre-Requisites

1. Install Docker from [here](https://docs.docker.com/get-docker/).

## Instructions

1. Clone this repository and go to the folder.
```
git clone https://github.com/anikeshk/aerospike-boolean-example.git
```

2. Create a docker network to connect the Aerospike and the Node.js script.
```
docker network create nodejs-aero
```

3. Pull and start the Aerospike docker image.
```
docker pull aerospike:4.9.0.10
docker run --rm -tid --name aerospike --network nodejs-aero -p 3000:3000 -p 3001:3001 -p 3002:3002 aerospike:4.9.0.10
```
Note: We are using Aerospike server version 4.9.0.10 as this code was tested only with this server version.

4. Connect to `aql` using the `docker exec` command.
```
docker exec -it <container id> aql
```
Note: You can get the container id by using the `docker ps` command.

5. Switch to a new terminal. Go to the cloned repository. Build the image to use the aerospike@3.11.0 Node.js library.
```
cd aerospike-boolean-example
docker build -t aerospike-boolean-example:1.0 .
```

6. Run this image and check the results.
```
docker run --network nodejs-aero aerospike-boolean-example:1.0
```

The output should be something like this:
```
Connection to Aerospike cluster succeeded!
User data stored!
User data fetched! {"age":21,"gender":"male","food":{"pizza":0,"burger":1,"taco":1}}
```

7. Check aql for the same entry:
```
aql> select * from test.users where PK="tom"
+-------+-----+--------+------------------------------------------+
| PK    | age | gender | food                                     |
+-------+-----+--------+------------------------------------------+
| "tom" | 21  | "male" | MAP('{"pizza":0, "burger":1, "taco":1}') |
+-------+-----+--------+------------------------------------------+
1 row in set (0.000 secs)
```

> In both the output from the script and aql, you can see Aerospike has stored the boolean values as 1 or 0 in the Map, depending if the choice is true or false.

8. Delete the entry from the database.
```
aql> delete from test.users where PK="tom"
OK, 1 record affected.
```

9. Change the aerospike version in the package.json to `3.16.3` using any editor.
```
{
  ...
  "dependencies": {
    "aerospike": "3.16.3"
  }
}
```

10. Re-build the image using a different tag.
```
docker build -t aerospike-boolean-example:2.0 .
```

11. Run this image and check the results.
```
docker run --network nodejs-aero aerospike-boolean-example:2.0
```

The output should be something like this:
```
Connection to Aerospike cluster succeeded!
User data stored!
User data fetched! {"age":21,"gender":"male","food":{"pizza":false,"burger":true,"taco":true}}
```

12. Check aql for the same entry:
```
aql> select * from test.users where PK="tom"
+-------+-----+--------+------------------------------------------+
| PK    | age | gender | food                                     |
+-------+-----+--------+------------------------------------------+
| "tom" | 21  | "male" | MAP('{"pizza":0, "burger":1, "taco":1}') |
+-------+-----+--------+------------------------------------------+
1 row in set (0.000 secs)
```

> This time in aql the values are stored as 1 or 0, but the script outputs true or false. The datatype of the output has changed!

13. Stop and remove the Aerospike docker image.
```
docker rm -f <container-id>
```

14. Delete the network created earlier.
```
docker network rm nodejs-aero
```