const client = {
	userList: []
}

const me = {name: undefined, color: undefined};
let socket
function init() {
	socket = io()
	const remPlayer = data=>{
		const toRem = client.userList.filter(p=>p.name===data.who)
		while(toRem.length > 0) {
			const a = toRem.shift()
			client.userList.splice(client.userList.indexOf(a), 1)
		}
		setTimeout(updateView,0)
	}

	socket.on('addPlayer', data=>{
		remPlayer(data)
		client.userList.push({name:data.who, color:data.color})
	})
	socket.on('remPlayer', remPlayer)
	socket.on('updateUserName', data=>{
		client.userList.filter(p=>p.name===data.who)[0].name = data.name
		if(data.who === me.name)
			me.name = data.name
		setTimeout(updateView,0)
	})
	socket.on('updateUserColor', data=>{
		client.userList.filter(p=>p.name===data.who)[0].color = data.color
		if(data.who === me.name)
			me.color = data.color
		setTimeout(updateView,0)
	})
	socket.on('errorr', data=>{
		console.error(data)
		alert(data.msg)
	})
	socket.on('whoAmI', data=>{
		me.name = data.name
		me.color = data.color
	})

	socket.emit('whoAmI', null)
	socket.emit('refreshInformation', null)
}

function updateUserName(inputId) {
	socket.emit('updateUserName', document.getElementById(inputId).value)
}
function changeColor() {
	socket.emit('updateUserColor', (Math.random()*359)|0+1)
}
function updateView() {
	const userList = document.getElementById('userList')
	const userListHtml = client.userList.map(c=>{
		const style = `style='background-color:hsl(${c.color},75%,75%)'`
		if(c.name === me.name) {
			const rid = 'nameInput' + ((Math.random()*(2<<15))|0)
			return `<div class='user' ${style}><input id='${rid}' onChange='updateUserName("${rid}")' value='${c.name}' ${style} /> <button onclick='changeColor()'>Randomize color</button></div>`
		} else
			return `<div class='user' ${style}>${c.name}</div>`
	}).join('')
	userList.innerHTML = userListHtml
}
