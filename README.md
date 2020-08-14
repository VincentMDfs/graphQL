# GraphQL

Welcome to the GraphQL project, week 8 in CodeBoxx

The GraphQL is at https://rocketelevators3.herokuapp.com/graphql

## Testing

- If not already done, install Postman https://www.postman.com/downloads/
- Ask VincentMDfs for a link to the "Team Workspace"
- Once configured, you will have access to the dashboard
- Navigate to the left of your screen into the collections
- Enter the appropriate folder
- The calls included in this week's Documentation are already prepared
- Click on the request of your choice and a new tab will open
- Simply click the blue "Send" button to start the request

## To manually manipulate the requests

### GraphQL

- In your favorite browser, go to https://relevator.xyz
- Login as an admin (ask VincentMDfs is you need credentials)
- Navigate to the "BACKOFFICE" page under the "ADMIN" button in the navigation bar
- Depending on your query idea, verify the information in the table you wish to query
- Now in postman, navigate to the request you wish to modify
- The "query" details are to be modified to your taste before pressing "Send"
- See examples at the bottom of this readme for reference
- Note that there is only one endpoint, so the url will remain unchanged

## Take a look at the RESTapi:
  https://github.com/VincentMDfs/RESTapi2

## Examples of GraphQL modifications

 {
  batteries(id: ?) {
	id
	status
   }
 }
 
 The question mark above can be replaced by any valid id number
"batteries" can also be replaced by "columns" or "elevators"

# Week 9

## Postman queries
- The connection steps above still apply although a new workspace was made
- The queries contain mutations now, so it is slightly different
- For mutations, check the body section of the queries
- Note the mutation on the first line, the id on the line may be adjusted
- There are "TESTs" queries to confirm updates if needed, but they will return some by default
-Below is an example of the query

mutation{updateStartInterventions(id: ?){
id
status
start_date
end_date
}}

- where ? will be replaced by the proper id number
- note that the return values (id, status, etc) can be changed to your liking
- All table entries can be returned here if needed, here they are:

	id
    	author
    	customer_id
    	building_id
    	battery_id
    	column_id
    	elevator_id
    	employee_id
    	start_date
    	end_date
    	result
    	report
    	status
    	created_at
    	updated_at

 
## For a list of all available queries, consult the server.js file!

## For additionnal information, please contact our dev team
