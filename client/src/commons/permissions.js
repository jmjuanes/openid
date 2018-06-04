//List with all the permissions
let permissions = {
    "email": {
        "name": "Email",
        "description": "This application will be able to read your private email address." 
    }
};

//Get the whole list of permissions
export function getAll () {
    return Object.keys(permissions).map(function (key) {
        return Object.assign({"id": key}, permissions[key]);
    });
}

//Get a single permission
export function get (id) {
    return permissions[id];
}

