/*
 * Request Handlers
 *
 */

 // Dependencies
var _data = require('./data');
 var helpers = require('./helpers');

// Define the handlers
var handlers = {}

// Ping handler
handlers.ping = (data, callback) => {
    callback(200);
}

// Not-Found
handlers.notFound = function(data,callback){
    callback(404);
};

handlers.users = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstname, lastname, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    var firstname = typeof(data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
    var lastname = typeof(data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
    var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;
    console.log(firstname +' '+ lastname +' '+ phone +' '+ password +' '+ tosAgreement);
    if (firstname && lastname && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read('users', phone, (err, data) => {
            if (err) {
                // Hash the password
                var hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // Create the user object
                    const userObject = {
                        firstname: firstname,
                        lastname: lastname,
                        phone: phone,
                        hashedPassword: hashedPassword,
                        tosAgreement: true
                    };

                    // Store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {Error: 'Could not create the new user'});
                        }
                    });
                } else {
                    callback(500, {Error: 'Could not hash the user\'s password'});
                }
            } else {
                // User already exists
                callback(400, {Error: 'A user with that phone number already exists'});
            }
        });
    } else {
        callback(400, {Error: 'Missing required fields'});
    }
};

// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone else's
handlers._users.get = (data, callback) => {
    // Check that the phone number is valid
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // Remove the hashed password from the user object before returning it to the request
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        })
    } else {
        callback(400, {Error: 'Missing required field'});
    }
};

// Users - put
// Required data: phone
// Optional data: firsname, lastname,password (at least one must be specified)
// @TODO Only let an an authenticated user update their object. Don't let them update anyone else's
handlers._users.put = (data, callback) => {
    // Check for the required field
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

    // Check for the optional fields
    var firstname = typeof(data.payload.firstname) === 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
    var lastname = typeof(data.payload.lastname) === 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    

    // Error if the phone is invalid
    if (phone) {
        // Error if nothing is sent to update
        if (firstname || lastname || password) {
            // Lookup the user
            _data.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    // Update the fields necessary
                    if (firstname) {
                        userData.firstname = firstname;
                    }
                    if (lastname) {
                        userData.lastname = lastname;
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }
                    // Store the new updates
                    _data.update('users', phone, userData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {Error: 'Could not update the user'});
                        }
                    });
                } else {
                    callback(400, {Error: 'The specified user does not exist'});
                }
            });
        } else {
            callback(400, {Error: 'Missing fields to update'});
        }
    } else {
        callback(400, {Error: 'Missing required field'});
    }
};

// Users - delete
// REquired field: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete anyone
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {Error: 'Could not delete the specified user'});
                    }
                });
            } else {
                callback(404, {Error: 'Could not find the specified user'});
            }
        });
    } else {
        callback(400, {Error: 'Missing required field'});
    }
};


module.exports = handlers;