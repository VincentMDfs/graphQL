require('dotenv').config();
var express = require('express');
var express_graphql = require('express-graphql');
const { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

// MySQL operational DB connection BEGIN
//env set in .env file
var mysql = require('mysql');
const con_mysql = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB_NAME
});
con_mysql.connect(function(error){
    if (!!error) {
        console.log("\n" + "-- > NO!, connection to the MySQL operational DB "  + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST + " has failed!" + "\n");
    } else {
        console.log("\n" + "-- > YES, connection to the MySQL operational DB " + process.env.MYSQL_DB_NAME + " on HOST "+process.env.MYSQL_HOST +" has been successfully established !." + "\n");
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
        console.log("\n" + "-- > NO!, connection to the PostgreSQL decision DB "  + process.env.POSTGRESQL_DB_NAME + " on HOST "+process.env.POSTGRESQL_HOST + " failed!" + "\n");
    } else {
        console.log("\n" + "-- > YES, connection to the PostgreSQL decision DB " + process.env.POSTGRESQL_DB_NAME + " on HOST "+process.env.POSTGRESQL_HOST +" has been successfully established!." + "\n");
    }
});
// PostgreSQL decision DB connection END


// GraphQL schema
// ! means that the field is non-nullable, meaning that the GraphQL service promises to always give you a value
// when you query this field. In the type language, we'll represent those with an exclamation mark.
var schema = buildSchema(`
scalar DateTime
    type Query {
        buildings(id: Int!): Building
        interventions(id: Int!): Intervention
        employees(id: Int!): Employee
        elevators(id: Int!): Elevator
        columns(id: Int!): Column
        batteries(id: Int!): Battery
        interventionLists: [InterventionList]
        customerEmails(email: String!): Customer
        customerBuildings(email: String!): [Building]
        customerBatteries(id: Int!): [Battery]
        customerColumns(id: Int!): [Column]
        customerElevators(id: Int!): [Elevator]
        cxList(email: String!): CX
        employeeEmail(email: String!): Employee
        
    },
    type CX {
        Building: [Building]
        Battery: [Battery]
        Column: [Column]
        Elevator: [Elevator]
    },
    type Mutation {
        updateStartInterventions(id: Int!): InterventionList
        updateEndInterventions(id: Int!): InterventionList
        createIntervention(customer_id: Int!, building_id: Int!, battery_id: Int!, column_id: Int, elevator_id: Int, report: String): InterventionMutation
    },

    type Building {
        id: Int!
        customer_id: Int
        admin_full_name: String
        admin_email: String
        admin_phone: String
        tech_contact_full_name: String
        tech_contact_email: String
        tech_contact_phone: String
        building_details: [Building_detail]
        interventions: [Intervention]
        address: Address
        customer: Customer
    }

    type Building_detail {
        id: Int!
        building_id: Int
        key: String
        value: String
    }

    type Address {
        id: Int!
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
        id: Int!
        company_name: String
        full_name: String
        email: String
        address_id: Int
        user_id: Int
        phone: String
        company_description: String
        tech_authority_full_name: String
        tech_authority_email: String
        tech_authority_phone: String
    }

    type Employee {
        id: Int!
        user_id: Int
        email: String
        first_name: String
        last_name: String
        title: String
        building_details: [Building_detail]
        interventions: [Intervention]
        building: [Building]
    }

    type Intervention {
        id: Int!
        employee_id: Int
        building_id: Int
        battery_id: String
        column_id: String
        elevator_id: String
        building_details: [Building_detail]
        start_date: DateTime
        end_date: DateTime
        result: String
        report: String
        status: String
        address: Address
    }

    type Elevator {
        id: Int!
        column_id: Int
        type_of_building: String
        serial_number: String
        model: String
        status: String
        date_of_commissioning: DateTime
        date_of_last_inspection: DateTime
        certificate_of_operations: String
        information: String
        notes: String
        created_at: DateTime
        updated_at: DateTime
    }

    type Column {
        id: Int!
        battery_id: Int
        type_of_column: String
        number_of_floors_served: Int
        status: String
        information: String
        notes: String
        created_at: DateTime
        updated_at: DateTime
    }

    type Battery {
        id: Int!
        building_id: Int
        type_of_battery: String
        status: String
        employee_id: Int
        date_of_commissioning: DateTime
        date_of_last_inspection: DateTime
        certificate_of_operations: String
        information: String
        notes: String
        created_at: DateTime
        updated_at: DateTime
    }

    type InterventionList {
        id: Int
        author: Int
        customer_id: Int
        building_id: Int
        battery_id: Int
        column_id: Int
        elevator_id: Int
        employee_id: Int
        start_date: DateTime
        end_date: DateTime
        result: String
        report: String
        status: String
        created_at: DateTime
        updated_at: DateTime
    }
    type InterventionMutation {
        id: Int
        author: Int!
        customer_id: Int!
        building_id: Int!
        battery_id: Int!
        column_id: Int
        elevator_id: Int
        employee_id: Int
        start_date: DateTime
        end_date: DateTime
        result: String!
        report: String
        status: String!
        created_at: DateTime
        updated_at: DateTime
    }
`);

// Root resolver
var root = {
    buildings: getBuildings,
    interventions: getInterventions,
    employees: getEmployees,
    elevators: getElevatorStatus,
    columns: getColumnStatus,
    batteries: getBatteryStatus,
    elevatorLists: getElevatorList,
    interventionLists: getInterventionList,
    updateStartInterventions: updateStartInterventions,
    updateEndInterventions: updateEndInterventions,
    customerEmails: getCustomerEmail,
    customerBuildings: getCustomerBuildings,
    customerBatteries: getCustomerBatteries,
    customerColumns: getCustomerColumns,
    customerElevators: getCustomerElevators,
    cxList: getCxList,
    createIntervention: updateCreateIntervention,
    employeeEmail: getEmployeeEmail
};

//To answer Question 1 by intervention id
async function getInterventions({id}) {

    // Query the factintervention table from the PostgreSQL
    intervention = await query_postgresql('SELECT * FROM factintervention WHERE id = ' + id)
    console.log(intervention)
    resolve = intervention[0]
    
    // Query the MySQL address table.
    address = await query_mysql('SELECT * FROM addresses JOIN buildings ON buildings.address_id = addresses.id WHERE buildings.id = ' + resolve.building_id);
    console.log(address)
    resolve['address']= address[0];

    return resolve
};

//To answer Question 2 by building id
async function getBuildings({id}) {
    // Query building from the MySQL table
    var buildings = await query_mysql('SELECT * FROM buildings WHERE id = ' + id )
    resolve = buildings[0]
    console.log(buildings)

    // Query intervention from the PostgreSQL table
    interventions = await query_postgresql('SELECT * FROM factintervention WHERE building_id = ' + id)
    console.log(interventions)

    //Query customer info from the MySQL table
    customer = await query_mysql('SELECT * FROM customers WHERE id = ' + resolve.customer_id)

    resolve['customer']= customer[0];
    resolve['interventions']= interventions;

    return resolve
};

//To answer Question 3 by employee id
async function getEmployees({id}) {
    // Query employee from the MySQL table
    var employees = await query_mysql('SELECT * FROM employees WHERE id = ' + id )
    resolve = employees[0]
    console.log(employees)

    // Query intervention from the PostgreSQL table
    interventions = await query_postgresql('SELECT * FROM factintervention WHERE employee_id = ' + id)
    result = interventions[0]
    console.log(interventions)

    // Query building_details table in the MySQL DB to get key, value for each intervetion.
    var j;
    for (j = 0; j < interventions.length; j++){
    building_details = await query_mysql('SELECT * FROM building_details WHERE building_id = ' + interventions[j].building_id)
    interventions[j]['building_details']= building_details;
    console.log(building_details)
    }   
    resolve['interventions']= interventions;

    return resolve
};

//REST query elevator status
async function getElevatorStatus({id}) {

    // Query the MySQL elevators table.
    elevators = await query_mysql('SELECT * FROM elevators WHERE id = ' + id);
    console.log(elevators)
    resolve = elevators[0];

    return resolve
};

//REST query column status
async function getColumnStatus({id}) {

    // Query the MySQL columns table.
    columns = await query_mysql('SELECT * FROM columns WHERE id = ' + id);
    console.log(columns)
    resolve = columns[0];

    return resolve
};
//REST query battery status
async function getBatteryStatus({id}) {

// Query the MySQL batteries table.
    batteries = await query_mysql('SELECT * FROM batteries WHERE id = ' + id);
    console.log(batteries)
    resolve = batteries[0];

    return resolve
};

async function getElevatorList() {

    // Query the MySQL elevators table.
        elevatorList = await query_mysql('SELECT * FROM elevators WHERE status = "Inactive" OR status = "Intervention"');
        console.log(elevatorList)
        resolve = elevatorList;
    
        return resolve
    };

async function getInterventionList() {

    // Query the MySQL interventions table.
        interventionList = await query_mysql('SELECT * FROM interventions WHERE status = "Pending" AND start_date IS NULL');
        console.log(interventionList)
        resolve = interventionList;
    
        return resolve
    };
async function updateStartInterventions({id}) {

    // Query the MySQL batteries table.
        intervStartUpdate = await query_mysql("UPDATE interventions SET status = 'InProgress', start_date = CURRENT_TIMESTAMP() WHERE Id = " + id);
        intervStartShow = await query_mysql('SELECT * FROM interventions WHERE id = ' + id);
        console.log(intervStartShow)
        console.log(intervStartUpdate)
        resolve = intervStartShow[0];
    
        return resolve
    };

    async function updateCreateIntervention({customer_id, building_id, battery_id, column_id, elevator_id, report}) {

        // Query the MySQL batteries table.
            interventionCreation = await query_mysql("INSERT INTO interventions (author, customer_id, building_id, battery_id, column_id, elevator_id, result, report, status, created_at, updated_at ) VALUES(1,'"+customer_id+"','"+building_id+"','"+battery_id+"','"+column_id+"','"+elevator_id+"', 'incomplete','"+report+"', 'pending', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());");
            interventionCreationShow = await query_mysql('SELECT * FROM interventions WHERE id = ' + interventionCreation.insertId);
            console.log(interventionCreation)
            resolve = interventionCreationShow[0];
            return resolve
        };
async function updateEndInterventions({id}) {

    // Query the MySQL batteries table.
        intervEndUpdate = await query_mysql("UPDATE interventions SET status = 'Completed', end_date = CURRENT_TIMESTAMP() WHERE Id = " + id);
        intervEndShow = await query_mysql('SELECT * FROM interventions WHERE id = ' + id);
        console.log(intervEndUpdate)
        console.log(intervEndShow)
        resolve = intervEndShow[0];
    
        return resolve
    };


// WEEK 11 ASPNETCORE

async function getCxList({email}) {
    let Building = []
    let Battery = []
    let Column = []
    let Elevator = []
    // Query the MySQL customers table.
    CustomerEmail = await query_mysql(`SELECT * FROM customers WHERE email = "${email}"`);
    CustomerBuilding = await query_mysql(`SELECT * FROM buildings WHERE customer_id = ${CustomerEmail[0].id}`);
    Building = CustomerBuilding
    console.log(CustomerBuilding.length)
    for (let i = 0; i < CustomerBuilding.length; i++) {
        CustomerBattery = await query_mysql(`SELECT * FROM batteries WHERE building_id = ${CustomerBuilding[i].id} `);
        Battery = Battery.concat(CustomerBattery)
        for (let j = 0; j < CustomerBattery.length; j++) {
            CustomerColumn = await query_mysql(`SELECT * FROM columns WHERE battery_id = ${CustomerBattery[j].id} `);
            Column = Column.concat(CustomerColumn)
            for (let k = 0; k < CustomerColumn.length; k++) {
                CustomerElevator = await query_mysql(`SELECT * FROM elevators WHERE column_id = ${CustomerColumn[k].id} `);
                Elevator = Elevator.concat(CustomerElevator)
            }
        } 
    }
    resolve = {
        Building: [...Building],
        Battery: [...Battery],
        Column: [...Column],
        Elevator: [...Elevator]}
    console.log(resolve)
    return resolve
    
};
// To check in the registration page if the email is an existing customer
async function getCustomerEmail({email}) {

    // Query the MySQL customers table.
    singleQuote = "'"
    CustomerEmail = await query_mysql('SELECT * FROM customers WHERE email = ' + singleQuote + email + singleQuote);
    console.log(CustomerEmail)
    resolve = CustomerEmail[0]

    return resolve
};

async function getEmployeeEmail({email}) {

    // Query the MySQL customers table.
    singleQuote = "'"
    CustomerEmail = await query_mysql('SELECT * FROM employees WHERE email = ' + singleQuote + email + singleQuote);
    console.log(CustomerEmail)
    resolve = CustomerEmail[0]

    return resolve
};

// Select the buildings based on the customers email
async function getCustomerBuildings({email}) {

    // Query the MySQL buildings table.
    customerBuildings = await query_mysql('SELECT b.id FROM buildings b JOIN customers c ON b.customer_id = c.id WHERE c.email = "' + email+'"' );
    console.log(customerBuildings)
    resolve = customerBuildings

    return resolve
};

// Select the batteries based on the previously selected building id
async function getCustomerBatteries({id}) {

    // Query the MySQL columns table
    customerBatteries = await query_mysql('SELECT * FROM batteries WHERE building_id = ' + id);
    console.log(customerBatteries)
    resolve = customerBatteries

    return resolve
};

// Select the columns based on the previously selected battery id
async function getCustomerColumns({id}) {

    // Query the MySQL columns table.
    customerColumns = await query_mysql('SELECT * FROM columns WHERE battery_id = ' + id);
    console.log(customerColumns)
    resolve = customerColumns

    return resolve
};

// Select the elevators based on the previously selected column id
async function getCustomerElevators({id}) {

    // Query the MySQL columns table.
    customerElevators = await query_mysql('SELECT * FROM elevators WHERE column_id = ' + id);
    console.log(customerElevators)
    resolve = customerElevators

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
// Before prof, set to false to desactivate GraphiQL GUI on the route /graphql
    graphiql: true
}));
//PORT as env variable so Heroku can set a port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`-- > Express server started on port ${PORT}`));