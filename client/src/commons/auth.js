let tokenName = "token";

//Return the current token
export function getToken () {
    return localStorage.getItem(tokenName);
}

//Save the provided token to the local storage
export function saveToken (token) {
    //..
}

//Delete the token
export function deleteToken () {
    //...
}

//Generate the authentication credentials
export function generateAuth () {
    return {
        "bearer": getToken()
    };
}

