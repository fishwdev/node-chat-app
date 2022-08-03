const users = [];

// addUser
const addUser = ({id, username, room}) => {
    // clean the data
    username = username.trim();
    room = room.trim();

    // validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
       return user.room === room && user.username === username && user.id === id
    });

    // validate username
    if (existingUser) {
        return {
            error: 'Username exists.'
        };
    }

    // store user
    const user = {id, username, room};
    users.push(user);
    return {user};
};

// removeUser
const removeUser = (id) => {
    const userIndex = users.findIndex(user => {
        return user.id === id;
    });

    if (userIndex != -1) {
        return users.splice(userIndex, 1)[0];
    }
};

// getUser
const getUser = (id) => {
    return users.find(user => user.id === id);
}

// getUsersInRoom
const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};