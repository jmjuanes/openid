let tokenName = "token";

//Check if the token exists
export function hasToken () {
    return getToken() !== null;
}
//Return the current token
export function getToken () {
    return localStorage.getItem(tokenName);
}

//Save the provided token to the local storage
export function saveToken (token) {
    localStorage.setItem(tokenName, token);
}

//Delete the token
export function deleteToken () {
    localStorage.removeItem(tokenName);
}

//Generate the authentication credentials
export function generateAuth () {
    let currentToken = getToken();
    return {
        "bearer": (currentToken === null) ? "" : currentToken
    };
}

