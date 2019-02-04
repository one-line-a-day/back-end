'.../api/users/register'
POST - body - {username, email, password}

Response: {message, id, token}

'.../api/users/login'
POST - body - {username, password}
note: username key will work with both matching username or email value.

Response: {message, username, token}

'.../api/lines'
GET - headers - {Authorization: token}

Response: {lines: [ {line, date} ] }

'.../api/lines/YYYY-MM-DD'
GET - headers - {Authorization: token}

Response: {line, date}

note: (please use leading 0s for days/months 1-9)

'.../api/lines'
POST - headers - {Authorization: token} - body - {line, date}

Response: {message, id}
