require('dotenv').config();
var express = require('express');
var express_graphql = require('express-graphql');
const { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

// MySQL DB connection BEGIN
var mysql = require('mysql');
const con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB_NAME
});
con.connect(function(error){
    if (!!error) {
        console.log("\n" + "-- > NO!, connection to the MySQL DB "  + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST + " disgracefully failed!" + "\n");
    } else {
        console.log("\n" + "-- > YES, connection to the MySQL DB " + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST +" successfully established with success!." + "\n");
    }
});
// MySQL DB connection END

// PostgreSQL DB connection BEGIN
const { Client }  = require('pg');
const client = new Client({
    user: process.env.POSTGRESQL_USERNAME,
    host: process.env.POSTGRESQL_HOST,
    database: process.env.POSTGRESQL_DB_NAME,
    password: process.env.POSTGRESQL_PASS,
    port: process.env.POSTGRESQL_PORT
});
client.connect(function(error){
    if (!!error) {
        console.log("\n" + "-- > NO!, connection to the PostgreSQL DB "  + process.env.POSTGRESQL_DB_NAME + " on HOST "+process.env.POSTGRESQL_HOST + " disgracefully failed!" + "\n");
    } else {
        console.log("\n" + "-- > YES, connection to the PostgreSQL DB " + process.env.POSTGRESQL_DB_NAME + " on HOST "+process.env.POSTGRESQL_HOST +" successfully established with success!." + "\n");
    }
});
// PostgreSQL DB connection END


// GraphQL schema
var schema = buildSchema(`
    type Query {
        message: String
    }
`);



// Root resolver
var root = {
    message: () => 'Hello World!'
};



// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(process.env.PORT || 4000, () => console.log('-- > Express GraphQL Server Now Running On localhost:4000/graphql'));