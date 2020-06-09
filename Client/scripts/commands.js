/* global io */
const client = {
	userList: []
}

const me = {name: undefined, color: undefined, keyMap: {}}
let socket
function init() {
	socket = io()

	// Prepare to receive messages
	socket.on('allPlayers', (data)=>{
		client.userList = data
		console.log('allPlayers', data)
		updateUserList()
	})
	socket.on('updateUserName', (data)=>{
		client.userList.filter((p)=>p.name===data.who)[0].name = data.name
		if(data.who === me.name)
			me.name = data.name
		updateUserList()
	})
	socket.on('updateUserColor', (data)=>{
		client.userList.filter((p)=>p.name===data.who)[0].color = data.color
		if(data.who === me.name)
			me.color = data.color
		updateUserList()
	})
	socket.on('errorr', (data)=>{
		console.error(data)
		alert(data.msg)
	})
	socket.on('whoAmI', (data)=>{
		me.name = data.name
		me.color = data.color
	})
	socket.on('grid', (data)=>{
		let grid = '<table border=border>'
		for(let y = data[0].length -1; y>= 0; y--) {
			grid += '<tr>'
			for(let x = 0; x < data.length; x++) {
				const toPrint = []
				if(data[x][y]) {
					for(const key in data[x][y])
						if(key)
							toPrint.push(key + ': ' + (data[x][y][key] * 100 | 0) + '%')
				}
				grid += '<td>' + toPrint.join(', ') + '</td>'
			}
			grid += '</tr>'
		}
		$('#grid').html(grid)
	})

	// Prepare keymap
	me.keyMap['ArrowUp'] = ()=>{
		socket.emit('screenMove', 'up')
	}
	me.keyMap['ArrowDown'] = ()=>{
		socket.emit('screenMove', 'down')
	}
	me.keyMap['ArrowLeft'] = ()=>{
		socket.emit('screenMove', 'left')
	}
	me.keyMap['ArrowRight'] = ()=>{
		socket.emit('screenMove', 'right')
	}

	// Send first messages
	socket.emit('whoAmI', null)
	socket.emit('refreshInformation', null)
}

function onUpdateUserName() { // eslint-disable-line
	socket.emit('updateUserName', $('#nameInput').val())
}
function changeColor() { // eslint-disable-line
	socket.emit('updateUserColor', (Math.random()*359)|0 +1)
}
function updateUserList() {
	const userListHtml = client.userList.map((c)=>{
		const style = `style="background-color:hsl(${c.color},75%,75%)"`
		if(c.name === me.name)
			return `<div class="user" ${style}><input id="nameInput" onChange="onUpdateUserName()" value="${c.name}" ${style} /> <button onclick="changeColor()">Randomize color</button></div>`
		else
			return `<div class="user" ${style}>${c.name}</div>`
	}).join('')
	$('#userList').html(userListHtml)
}

$(document).ready(init)
$(document).keydown((event)=>{
	const keyCode = event.key
	if(keyCode) {
		// console.log(keyCode)
		me.keyMap[keyCode] && me.keyMap[keyCode]()
	}
})
