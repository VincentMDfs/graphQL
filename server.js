require('dotenv').config();
require('./db_query.js');
require('./db_connection.js');
var express = require('express');
var express_graphql = require('express-graphql');
const { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');


// MySQL DB connection BEGIN
var mysql = require('mysql');
const con_mysql = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB_NAME
});
con_mysql.connect(function(error){
    if (!!error) {
        console.log("\n" + "-- > NO!, connection to the MySQL DB "  + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST + " disgracefully failed!" + "\n");
    } else {
        console.log("\n" + "-- > YES, connection to the MySQL DB " + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST +" successfully established with success!." + "\n");
    }
});
// MySQL DB connection END

// PostgreSQL DB connection BEGIN
const { Client }  = require('pg');
const con_pg = new Client({
    user: process.env.POSTGRESQL_USERNAME,
    host: process.env.POSTGRESQL_HOST,
    database: process.env.POSTGRESQL_DB_NAME,
    password: process.env.POSTGRESQL_PASS,
    port: process.env.POSTGRESQL_PORT
});
con_pg.connect(function(error){
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
        buildings(id: Int!): Building
        factintervention(building_id: Int!): FactIntervention
    },

    type Building {
        id: Int!
        admin_full_name: String
        admin_email: String
        tech_contact_full_name: String
    },

    type FactIntervention {
        building_id: Int!
        result: String
        report: String
        start_date: String
        end_date: String
    }
`);



// Root resolver
var root = {
    buildings: getBuildings,
    factintervention: getFactIntervention
};


async function getBuildings({id}) {
    var buildings = await query_mysql('SELECT * FROM buildings WHERE id = ' + id )
    resolve = buildings[0]

    return resolve
};

async function getFactIntervention({building_id}) {
    var factintervention = await query_postgresql('SELECT * FROM factintervention WHERE building_id = ' + building_id )
    resolve = factintervention[0]

    return resolve
};


// Function used to query the MySQL DB BEGIN
function query_mysql (queryStr) {
    console.log("-- > Run MySQL query : " + queryStr)
    return new Promise((resolve, reject) => {
        con_mysql.query(queryStr, function(err, result) {
            if (err) {
                return reject(err);
            } 
            return resolve(result)
        })
    })
};
// Function used to query the MySQL DB END


// Function used to query the PostgreSQL DB BEGIN
function query_postgresql(queryStr) {
    console.log("-- > Run PostgreSQL query : " + queryStr)
    return new Promise((resolve, reject) => {
        con_pg.query(queryStr, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result.rows)
        })
    })
};
// Function used to query the PostgreSQL DB END


// Create an express server and a GraphQL endpoint
var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(process.env.PORT || 4000, () => console.log('-- > Express GraphQL Server Now Running On localhost:4000/graphql'));