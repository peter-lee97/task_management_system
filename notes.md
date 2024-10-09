## MySQL default credentials

- root | qwepoi!!

### Documentation

- [mysql2 documentation](https://sidorares.github.io/node-mysql2/docs)

### Email Information

- [Incoming Email Testing](https://www.wpoven.com/tools/free-smtp-server-for-testing)
- [Sending Mock Email](https://ethereal.email/create)
- Using `MailDev` for running local smtp server
  - Require to install docker image:
    - `docker pull maildev/maildev`
  - To Run: `docker run -p 1080:1080 -p 1025:1025 maildev/maildev`

```bash
curl --location 'localhost:3000/api/v1/demo/CreateTask' \
--header 'Content-Type: application/json' \
--data '{
    "username": "pl",
    "password": "abc123!!",
    "appAcronym": "Youtube",
    "taskName": "New Recommendation Feature",
    "description": "Improve the current recommendation feature with a new AI algorithm",
    "taskNotes": "Getting this as a beta version would be good",
    "taskPlan": "sprint 1"
}'
```
