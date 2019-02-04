'.../api/users/register'
POST - body - {username, email, password}

Response: {message, id, token}

'.../api/users/login'
POST - body - {username, password}
note: username key will work with both matching username or email value.

Response: {message, username, token}
