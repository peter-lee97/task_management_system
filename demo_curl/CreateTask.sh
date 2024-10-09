curl --location 'localhost:3000/api/v1/demo/CreateTask' \
--header 'Content-Type: application/json' \
--data '{
    "username": "pl",
    "password": "abc123!!",
    "applicationAcronym": "HRM",
    "taskName": "The Human Task",
    "description": ""
}'
