const path = require('path')
const express = require('express')
const app = express()
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage , generateLocation}  = require('./utils/messages')
const {addUser, removeUser, getUser, getUserinRoom} = require('./utils/users')


const publicDir = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicDir))



io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    socket.on('showMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage( user.username, message))  
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user){
            io.to(user.room).emit('message', generateMessage( 'Admin', `${user.username} has left`))
            io.to(user.room).emit('roomUsers', {
                room:user.room,
                users: getUserinRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)       
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))  
        callback('Location sent')
    })

    socket.on('join', ({username, room}, callback) => {

        const {error, user} = addUser({id: socket.id, username, room})
        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getUserinRoom(user.room)
        })
        callback()
    })
})


server.listen(port, () => {
    console.log(`Server is running on port: ${port}!`)
})