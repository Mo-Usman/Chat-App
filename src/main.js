const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/timestamps')
const { addUser, removeUser, getUser, getRoomUsers } = require('./utils/Users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    // Recieving the Username and Room name from the client
    socket.on('join', ({ Username, Room }, callback) => {

        const { error, user } = addUser({ id: socket.id, Username, Room })

        if(error) {
            return callback(error)
        }

        socket.join(user.Room)

    // Emitting a message event to the user from the server
    socket.emit('message', generateMessage('Admin','Welcome!'))
    socket.broadcast.to(user.Room).emit('message', generateMessage( 'Admin', user.Username + ' has joined!'))
    
    // Emitting and event to show the users list in a room
    io.to(user.Room).emit('roomData', {
        room: user.Room,
        users: getRoomUsers(user.Room)
    })

    callback()

    })


    // Recieving a sendMessage event on the server from the user
    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id)
        
        
        const filter = new Filter()
        if(filter.isProfane(message)) {
            return callback('Foul Language is not allowed!')
        }

            io.to(user.Room).emit('message', generateMessage(user.Username, message))
            callback()
    })

    // Recieving a sendLocation event on the server from the client
    socket.on('sendLocation', (position, callback) => {

        const user = getUser(socket.id)

        const location = 'https://google.com/maps?q='+position.latitude+','+position.longitude
        io.to(user.Room).emit('locationMessage', generateLocationMessage(user.Username, location))
        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)
        if(user) {
            io.to(user.Room).emit('message', generateMessage('Admin', user.Username + ' has left!'))
            io.to(user.Room).emit('roomData', {
                room: user.Room,
                users: getRoomUsers(user.Room)
            })
        }
    })
})

server.listen(3000, () => {
    console.log('Server is up on port 3000')
})