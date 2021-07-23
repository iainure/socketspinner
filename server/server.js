const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

app.use(express.static(__dirname + '/client'))

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/client/index.html')
})


let current

io.on('connection', socket => {

console.log('user connected', current)

	socket.on('spin', max => {
		
		current = randomSpin(max)
		io.emit('spun', current)

	})

	// let people who just connected get the current spin value
	if(current){
		socket.emit('startAt', current)
	}

})

server.listen(8077, () => {
	console.log('listening on *:8077')
})

/* utils */

const randomSpin = max => Math.floor((Math.random() * max) + 1)