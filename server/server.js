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

let i = 1

io.on('connection', socket => {

	console.log('a user connected')

	socket.on('spin', () => {

		setTimeout(() => {
			io.emit('spun', i)
			i++
		}, 1500)

	})

})

server.listen(3001, () => {
	console.log('listening on *:3001')
})