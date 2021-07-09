const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const minifier = require('./minifier')
const game_import = require('./game')
const Player = game_import.Player

const PORT = 8765
const GAME_TICK = 1000
minifier.setDebug(false)

function serverStart() {
	server.listen(PORT)

	io.sockets.on('connection', onConnect)
	console.log('server listening on http://127.0.0.1:' + PORT)
}

app.get('/', (req, res, nxt)=>{
	console.debug('200: ' + req.originalUrl)
	minifier.getFileAsync('Client/index.html', (f)=>res.sendFile(f), nxt)
})
app.get('/scripts/:file', (req, res, nxt)=>{
	console.debug('200: ' + req.originalUrl)
	minifier.getFileAsync('Client/scripts/' + req.params.file, (f)=>res.sendFile(f), nxt)
})
app.get('/styles/:file', (req, res, nxt)=>{
	console.debug('200: ' + req.originalUrl)
	minifier.getFileAsync('Client/styles/' + req.params.file, (f)=>res.sendFile(f), nxt)
})
app.get('*', (req, res)=>{
	console.warn('404: ' + req.originalUrl)
	res.status(404).send('404: Not Found')
})

// io.emit('cmd', data) // broadcast
// socket.emit('cmd', data) // send command to specific
// io.to('roomName').emit('cmd', data) // send command to every socket in room
// socket.join('roomName') // add socket to room
// socket.leave('roomName') // remove socket from room
const players = []
function onConnect(socket) {
	const connectBy = socket.handshake.headers.host

	const p = new Player()
	console.log('Player '+ p.name +' connected from', connectBy)

	socket.on('disconnect', ()=>{
		players.splice(players.indexOf(p), 1)
		sendRefreshInformation(io)
		console.log('Client disconnected from', socket.handshake.headers.host)
	})

	// data: string (the new name)
	socket.on('updateUserName', (data)=>{
		const newName = (''+data).match(/[A-Za-z0-9]+/g).join('')
		if(!newName
			|| newName.length < 3
			|| players.filter((p)=>p.name===newName).length>0) {
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
	socket.on('updateUserColor', (hue)=>{
		if(!hue
			|| (hue|0)<0
			|| (hue|0)>=360
			|| players.filter((p)=>p.color===hue).length>0) {
			socket.emit('errorr', {
				command: 'updateUserColor',
				msg: `"${hue}" is not a valid color or is already used.`
			})
			return
		}
		p.color = (hue|0)
		io.emit('updateUserColor', {who:p.name, color:p.color})
	})

	socket.on('refreshInformation', ()=>{
		sendRefreshInformation(socket)
		socket.emit('grid', p.getView())
	})

	socket.on('screenMove', (move)=>{
		const moveMap = {
			'up':   [ 0, 1],
			'down': [ 0, -1],
			'left': [-1, 0],
			'right':[ 1, 0],
		}

		if(!moveMap[move])
			return

		p.move(moveMap[move])
		socket.emit('grid', p.getView())
	})

	// data: unused
	socket.on('whoAmI', (data)=>{
		socket.emit('whoAmI', p.toDict())
	})

	players.push(p)
	checkGameStart()
}

function sendRefreshInformation(socket) {
	const playersList = []
	for(const p of players) {
		playersList.push({name: p.name, color: p.color})
	}

	socket.emit('allPlayers', playersList)
}

function checkGameStart() {
	if(players.length >= 1) { // First player, launch game.
		setTimeout(gameLoop, GAME_TICK)
	}
}
function gameLoop() {
	// Launch next loop soon
	checkGameStart()
}

// Starting the server
serverStart()
