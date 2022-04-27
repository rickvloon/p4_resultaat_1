const userDB = [];
const timeout = 500;
let id = 0;

module.exports = {
    listUsers(callback) {
        setTimeout(() => {
            callback(userDB);
        }, timeout);
    },

    createUser(user, callback) {
        if (
            !user ||
            !user.emailAdress ||
            userDB.filter((item) => item.emailAdress === user.emailAdress).length > 0
        ) {
            const error = 'A user with this email is already registered.';
            callback(error, undefined);
        } else {
            id++
            const newUser = {
                ...user,
                id,
            }
            userDB.push(newUser);
            callback(undefined, newUser);
        }
    },

    getUser(id, callback) {
        setTimeout(() => {
            callback(userDB.find((user) => user.id == id) ?? {});
        }, timeout);
    },

    updateUser(user, id, callback) {
        setTimeout(() => {
            const index = userDB.findIndex((item) => id == item.id);
            if (
                user.id ||
                index === -1
            ) {
                const error = 'Invalid userID';
                callback(error, undefined);
            } else {
                userDB[index] = {
                    ...userDB[index],
                    ...user
                }
                callback(undefined, userDB[index]);
            }
        }, timeout);
    },

    deleteUser(id, callback) {
        setTimeout(() => {
            const index = userDB.findIndex((item) => id == item.id);
            if (
                index === -1
            ) {
                const error = 'User not found';
                callback(error, undefined);
            } else {
                callback(undefined, userDB.splice(index, 1)[0]);
            }
        }, timeout);
    },
}