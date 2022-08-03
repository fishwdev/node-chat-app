const Filter = require('bad-words');
const socketio = require('socket.io');

const {app, server} = require('./app');
const {constructMessage, constructLocationMessage} = require('./utils/message');
const {addUser, removeUser, getUsers, getUsersInRoom, getUser} = require('./utils/users');

const port = process.env.PORT || 3000;

const io = socketio(server);

const sysUser = 'Admin';

io.on('connection', (socket) => {
    console.log('New WebSocket connection found.');

    // socket.emit: for single connection
    // socket.broadcast.emit: for all connections except the sender
    // io.emit: for all connections

    // socket.broadcast.to.emit: for all connections except the sender within the room
    // io.to.emit: for all connections within the room

    // server (emit) -> client (receive) --acknowledgement -> server
    // client (emit) -> server (receive) --acknowledgement -> client

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room});

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', constructMessage(sysUser,'Welcome!'));
        socket.broadcast.to(user.room).emit('message', constructMessage(sysUser,`User ${user.username} has joined.`));
        io.to(user.room).emit('roomData', {
           room: user.room,
           users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed.');
        }
        if (user)
            io.to(user.room).emit('message', constructMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage',
            constructLocationMessage(user.username, coords.latitude, coords.longitude)
        );

        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', constructMessage(sysUser, `User ${user.username} has disconnected.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

// listening from port
server.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});

// displaying index.html
/*
app.get('/', (req, res) => {
    res.writeHead(200, {'content-type': 'text/html'});
    fs.createReadStream('./public/index.html').pipe(res);
});
 */