var server = require('http').createServer(handler)
var io = require('socket.io')(server)
var fs = require('fs')

const PORT = 8765
server.listen(PORT)

io.sockets.on('connection', onConnect)
console.log('server listening on http://127.0.0.1:' + PORT)


function handler(req, res) {
	fs.readFile('Client/index.html', (err, data)=>{
		if (err) {
			res.writeHead(500)
			return res.end('Error 500')
		}

		data = (data.toString()).replace(/\$\{serverAddress\}/g, req.headers.host)

		res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
		res.writeHead(200)
		res.end(data)
	})
}


// io.emit('cmd', data) // broadcast
// io.sockets.emit('cmd', who, data); // who = array of sockets
// socket.emit('cmd', data); // send command to specific
function Player() {}

const players = []
let pid = 0
function onConnect(socket) {
	const connectBy = socket.handshake.headers.host
	console.log('New client connected to', connectBy)

	const p = new Player(); // TO BE DEFINED
	p.name = 'P'+(++pid)

	socket.on('disconnect', ()=>{
		players.splice(players.indexOf(p), 1)
		// TODO: notify others
		console.log('Client disconnected of', socket.handshake.headers.host)
	})

	// data: string (the new name)
	socket.on('updateUserName', (data)=>{
		const newName = (''+data).match(/[A-Za-z0-9]+/g).join('')
		if(!newName || newName.length < 3) {
			// TODO: notify error
			return
		}
		socket.emit('updateUserName', {who:p.name, name:newName})
		p.name = newName
	})

	// data: int (between 0 and 359 included, the new hue)
	socket.on('updateUserColor', (hue)=>{
		if(!hue || (hue|0)<0 || (hue|0)>=360) {
			// TODO: notify error
			return
		}
		p.hue = (hue|0)
		socket.emit('updateUserColor', {who:p.name, color:p.hue})
	})
}
