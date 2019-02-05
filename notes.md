Server is UP and running at:
`https://one-line-a-day-backend.herokuapp.com/`

Endpoints:

POST - `/api/users/register` -
required body: {username, email, password}
response: {message, id, token}

POST - `/api/users/login` -
required body: {username, password}
response: {message, username, token}

    note: username key will work with both matching username or email value for account.

GET - `/api/lines` -
required headers: {Authorization: token}
Response: {lines: [ {line, date, id} ] }

GET - `/api/lines/YYYY-MM-DD` -
required headers: {Authorization: token}
Response: {line, date, id}

    note: (please use leading 0s for days/months 1-9)

POST - `/api/lines` -
required headers: {Authorization: token},
required body: {line, date: 'YYYY-MM-DD' },
response: {message, id}

PATCH - `/api/lines` -
required headers: {Authoerization: token},
required body: {id, (optional: line and/or date)}
response: {updatedLine}

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
