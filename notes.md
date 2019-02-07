Endpoints:

- USERS -

POST - `/api/users/register` -
required body: {username, email, password}
response: {message, id, token, username, name}

POST - `/api/users/login` -
required body: {username, password}
response: {message, id, token, username, name}

    note: username key will work with both matching username or email value for account.

PATCH - `/api/users/:id` -
required headers: {Authorization: token},
required body: {(optional: username, password, name, email)}

DELETE = `/api/users/:id` -
required headers: {Authorization: token}
response: {message}
note: deleting a user deletes all corresponding lines.

- LINES -

GET - `/api/lines` -
required headers: {Authorization: token}
Response: [ {line, date, id, img_url} ]

GET - `/api/lines/YYYY-MM-DD` -
required headers: {Authorization: token}
Response: {line, date, id, img_url}

    note: (please use leading 0s for days/months 1-9)

GET - `/api/lines/id/:id` -
required headers: {Authorization: token}
Response: {line, date, id, img_url}

GET - `/api/lines/month/MM/year/YYYY`
required headers: {Authorization: token}
Response: [ lines ]

POST - `/api/lines` -
required headers: {Authorization: token},
required body: {line, date: 'YYYY-MM-DD' },
response: {message, id}

PATCH - `/api/lines/:id` -
required headers: {Authoerization: token},
required body: {(optional: line and/or date)}
response: {updatedLine}

DELETE - `/api/lines/:id` -
required headers: required headers: {Authoerization: token}
response: {message}

EXISTING DATA:

    Test Users:

        username: TestUser1
        email: 'fake@fake.fake'
        password: 'pass'

        username: TestUser2
        email: 'test@fake.fake'
        password: 'pass'

    Test Lines:  Lines for both test users have been added for dates: Jan/Feb, 1st-9th, 2009-2019

---
