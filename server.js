require('dotenv').config();
require('./db_query.js');
require('./db_connection.js');
var express = require('express');
var express_graphql = require('express-graphql');
const { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');


// MySQL operational DB connection BEGIN
var mysql = require('mysql');
const con_mysql = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB_NAME
});
con_mysql.connect(function(error){
    if (!!error) {
        console.log("\n" + "-- > NO!, connection to the MySQL operational DB "  + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST + " disgracefully failed!" + "\n");
    } else {
        console.log("\n" + "-- > YES, connection to the MySQL operational DB " + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST +" successfully established with success!." + "\n");
    }
});
// MySQL operational DB connection END

// PostgreSQL decision DB connection BEGIN
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
        console.log("\n" + "-- > NO!, connection to the PostgreSQL decision DB "  + process.env.POSTGRESQL_DB_NAME + " on HOST "+process.env.POSTGRESQL_HOST + " disgracefully failed!" + "\n");
    } else {
        console.log("\n" + "-- > YES, connection to the PostgreSQL decision DB " + process.env.POSTGRESQL_DB_NAME + " on HOST "+process.env.POSTGRESQL_HOST +" successfully established with success!." + "\n");
    }
});
// PostgreSQL decision DB connection END



// GraphQL schema
var schema = buildSchema(`
    type Query {
        buildings(id: Int!): Building
        intervention(building_id: Int!): Intervention
        employees(id: Int!): Employee
    },

    type Building {
        id: Int!
        address: Address
        customer_id: Int!
        customer: Customer
        admin_full_name: String
        admin_email: String
        admin_phone: String
        tech_contact_full_name: String
        tech_contact_email: String
        tech_contact_phone: String
        building_details: [Building_detail]
        interventions: [Intervention]
    }

    type Building_detail {
        building_id: Int!
        key: String
        value: String
    }

    type Address {
        type_of_address: String
        status: String
        entity: String
        number_and_street: String
        appartment_or_suite: String
        city: String
        state: String
        zip_code: String
        country: String
        note: String
        longitude: Float
        latitude: Float
    }

    type Customer {
        company_name: String
        full_name: String
        email: String
        address_id: Int!
        user_id: Int!
        phone: String
        company_description: String
        tech_authority_full_name: String
        tech_authority_email: String
        tech_authority_phone: String
    }

    type Employee {
        id: Int!
        user_id: Int!
        email: String
        first_name: String
        last_name: String
        title: String
        building_details: [Building_detail]
        interventions: [Intervention]
    }

    type Intervention {
        employee_id: Int!
        building_id: Int!
        battery_id: String
        column_id: String
        elevator_id: String
        building_details: [Building_detail]
        start_date: String
        end_date: String
        result: String
        report: String
        status: String
    }
`);



// Root resolver
var root = {
    buildings: getBuildings,
    interventions: getInterventions,
    employees: getEmployees,
};

async function getEmployees({id}) {
    // Employee
    var employees = await query_mysql('SELECT * FROM employees WHERE id = ' + id )
    resolve = employees[0]
    
    // Interventions
    interventions = await query_postgresql('SELECT * FROM factintervention WHERE employee_id = ' + id)
    result = interventions[0]
    console.log(interventions)


    // Buildings
    building_details = await query_mysql('SELECT * FROM building_details WHERE building_id = ' + result.building_id)
    console.log(building_details)

    resolve['interventions']= interventions;
    resolve['building_details']= building_details;

    return resolve
};

async function getBuildings({id}) {
    // Query building details from MySQL buildings table
    var buildings = await query_mysql('SELECT * FROM buildings WHERE id = ' + id )
    resolve = buildings[0]

    // Query building details from PostgreSQL factintervention table
    interventions = await query_postgresql('SELECT * FROM factintervention WHERE building_id = ' + id)

    //Query customer details from MySQL buildings table
    customer = await query_mysql('SELECT * FROM customers WHERE id = ' + resolve.customer_id)

    resolve['customer']= customer[0];
    resolve['interventions']= interventions;

    return resolve
};

async function getInterventions({building_id}) {
    // Query intervention from PostgreSQL factintervention table
    var intervention = await query_postgresql('SELECT * FROM factintervention WHERE building_id = ' + building_id)
    resolve = intervention[0]
    
    // Query address from MySQL buildings table
    address = await query_mysql('SELECT * FROM addresses WHERE entity = "Building" AND entity_id = ' + building_id)

    resolve['address']= address[0];

    return resolve
};


// Function used to query the MySQL operational DB BEGIN
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


// Function used to query the PostgreSQL decision DB BEGIN
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