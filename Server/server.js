const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io').listen(server)
const fs = require('fs')

const PORT = 8765
server.listen(PORT)

io.sockets.on('connection', onConnect)
console.log('server listening on http://127.0.0.1:' + PORT)

function redirToFile(res, fileName, func=(a=>a)) {
	fs.readFile(fileName, (err, data)=>{
		if (err) {
			res.writeHead(500)
			return res.end('Error 500')
		}

		res.writeHead(200)
		res.end(func(data))
	})
}

app.get('/', (req, res)=>{
	redirToFile(res, 'Client/index.html',reduceCode)
})
app.get('/scripts.js', (req, res)=>{
	redirToFile(res, 'Client/scripts/commands.js',reduceCode)
})

// io.emit('cmd', data) // broadcast
// io.sockets.emit('cmd', who, data); // who = array of sockets
// socket.emit('cmd', data); // send command to specific
function Player() {}

const players = []
let pid = 0
function onConnect(socket) {
	const connectBy = socket.handshake.headers.host

	const p = new Player(); // TO BE DEFINED
	p.name = 'P'+(++pid)
	p.color = (Math.random()*360)|0
	console.log('Player '+p.name+' connected to', connectBy)

	socket.on('disconnect', ()=>{
		players.splice(players.indexOf(p), 1)
		io.emit('remPlayer', {who:p.name})
		console.log('Client disconnected of', socket.handshake.headers.host)
	})

	// data: string (the new name)
	socket.on('updateUserName', data=>{
		const newName = (''+data).match(/[A-Za-z0-9]+/g).join('')
		if(!newName
			|| newName.length < 3
			|| players.filter(p=>p.name===newName).length>0) {
			socket.emit('error', {
				command: 'updateUserName',
				msg: `"${newName}" is not a valid name or is already used.`
			})
			return
		}
		io.emit('updateUserName', {who:p.name, name:newName})
		console.log('Player '+p.name+' was renamed', newName)
		p.name = newName
	})

	// data: int (between 0 and 359 included, the new hue)
	socket.on('updateUserColor', hue=>{
		if(!hue
			|| (hue|0)<0
			|| (hue|0)>=360
			|| players.filter(p=>p.color===hue).length>0) {
			socket.emit('errorr', {
				command: 'updateUserColor',
				msg: `"${hue}" is not a valid color or is already used.`
			})
			return
		}
		p.color = (hue|0)
		io.emit('updateUserColor', {who:p.name, color:p.color})
	})

	socket.on('refreshInformation', data=>{
		for(let p of players) {
			socket.emit('addPlayer', {who:p.name, color:p.color})
		}
	})

	socket.on('whoAmI', data=>{
		socket.emit('whoAmI', {name:p.name, color:p.color})
	})

	players.push(p)
	io.emit('addPlayer', {who:p.name, color:p.color})
}

function reduceCode(code) {
	return (code.toString()).replace(/\n\s+/g,'\n')
}
