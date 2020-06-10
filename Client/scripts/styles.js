const blocsvg = '<svg viewBox="0 0 4 4">'
	+ '<rect x="0" y="0" width="1.1" height="1.1"/>'
	+ '<rect x="0" y="1" width="1.1" height="1.1"/>'
	+ '<rect x="0" y="2" width="1.1" height="1.1"/>'
	+ '<rect x="0" y="3" width="1.1" height="1"/>'
	+ '<rect x="1" y="0" width="1.1" height="1.1"/>'
	+ '<rect x="1" y="1" width="1.1" height="1.1"/>'
	+ '<rect x="1" y="2" width="1.1" height="1.1"/>'
	+ '<rect x="1" y="3" width="1.1" height="1"/>'
	+ '<rect x="2" y="0" width="1.1" height="1.1"/>'
	+ '<rect x="2" y="1" width="1.1" height="1.1"/>'
	+ '<rect x="2" y="2" width="1.1" height="1.1"/>'
	+ '<rect x="2" y="3" width="1.1" height="1"/>'
	+ '<rect x="3" y="0" width="1" height="1.1"/>'
	+ '<rect x="3" y="1" width="1" height="1.1"/>'
	+ '<rect x="3" y="2" width="1" height="1.1"/>'
	+ '<rect x="3" y="3" width="1" height="1"/>'
	+ '</svg>'

const blocColors = {
	air: '#FFFFFF',
	stone: '#666666',
	obsidian: '#6622DD',
	iron: '#BBBBBB',
	copper: '#DD4411',
	gold: '#FFDD44',
	bedrock: '#000000',
	diamond: '#00BBFF',
	water: '#0000FF'
}

function getStyle(blocDescription) { // eslint-disable-line no-unused-vars
	let count = 0
	const content = Object.keys(blocDescription)
		.sort((a,b)=>blocDescription[a][1]>blocDescription[b][1]?1:-1)
		.map((element)=>[element, blocDescription[element], count += blocDescription[element]])

	const rnd = new RandomGen(JSON.stringify(content)) // Generate randomizer
	content.push(['air', 2, 2]) // Fill rest of the bloc with air

	const colors = []
	for(let i=0; i<16; i++) {
		count = i/16
		while(count > content[0][2])
			content.push(content.shift())
		colors.push(content[0][0])
	}

	const svg = $(blocsvg)
	const parts = svg.find('rect')
	const orders = []
	for(let i=0; i<parts.length; i++) orders.push(i)
	shuffle(orders, rnd)
	while(orders.length) {
		$(parts.get(orders.shift())).css('fill', blocColors[colors.shift()] || blocColors.air)
	}

	return svg
}

function RandomGen(strSeed) {
	const hash = (str)=>{
		let hash = 0
		for (let i = 0; i < str.length; i++) {
			hash = ((hash<<5)-hash) + str.charCodeAt(i)
			hash &= hash
		}
		return hash
	}
	let _a = hash(strSeed || ''+Math.random())

	const THIS = this

	// Mulberry32 Algorithm
	this.float = function(min=0, max=1) {
		let t = (_a += 0x6D2B79F5)
		t = Math.imul(t ^ t >>> 15, t | 1)
		t ^= t + Math.imul(t ^ t >>> 7, t | 61)
		return ((t ^ t >>> 14) >>> 0) / (4294967296 / (max-min)) + min
	}
	this.int = function(min, max) {
		return THIS.float(min, max+1) | 0
	}
}
function shuffle(array, rnd) {
	let i = array.length, j, t
	while(i) {
		t = array[--i]
		array[i] = array[j = rnd.int(0, i-1)]
		array[j] = t
	}
	return array
}
