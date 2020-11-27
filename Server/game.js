const UTILS = require('./utils')
const mapGen = require('./mapGen')

let pid = 0
const PLAYER_VIEW_DISTANCE = 9 // *2+1 to get total field of view
const game = new Game(42)

function Game(seed) {
	const THIS = this
	const _grid = {}
	const _rnd = new UTILS.RandomGen()

	const init = function() {
		const t = mapGen.run(_rnd)
		t.forEach((a)=>THIS.set([a.x, a.y], a.bloc))
	}

	//
	// Public functions

	this.get = function(xy) {
		const x = xy[0] | 0, y = xy[1] | 0
		return _grid[x] && _grid[x][y] ? _grid[x][y] : null
	}
	this.set = function(xy, bloc) {
		const x = xy[0] | 0, y = xy[1] | 0
		if(!_grid[x])
			_grid[x] = {}
		_grid[x][y] = bloc
	}

	this.getGridAround = function(xy, dist) {
		const x = xy[0], y = xy[1]
		const grid = []
		const decalX = x-dist
		const decalY = y-dist
		for(let xi=x-dist; xi<=x+dist; xi++) {
			grid[xi-decalX] = []
			for(let yi=y-dist; yi<=y+dist; yi++) {
				grid[xi-decalX][yi-decalY] = THIS.get([xi, yi])
			}
		}
		return grid
	}

	this.getAnyLocationNearWall = function() {
		const sides = UTILS.shuffle([[-1,0], [0,-1], [0,1], [1,0]])
		const xs = UTILS.shuffle(Object.keys(_grid))
		for(let x of xs) {
			const row = _grid[x]
			x |= 0 // cast to int
			const ys = UTILS.shuffle(Object.keys(row))
			for(let y of ys) {
				y |= 0 // cast to int
				const around = THIS.getGridAround([x, y], 1)
				for(const t of sides) {
					if(around[t[0]+1][t[1]+1] === null) {
						return [x + t[0], y + t[1]]
					}
				}
			}
		}
		console.debug(_grid)
		return null
	}

	// Call to init
	init()
}

function Player() {
	this.name = 'P'+ (++pid)
	this.color = (Math.random()*360)|0
	this.locate = game.getAnyLocationNearWall()

	this.move = function([x, y]) {
		this.locate[0] += x
		this.locate[1] += y
	}
	this.toDict = function() {
		return {name: this.name, color: this.color}
	}
	this.getView = function() {
		const gridAround = game.getGridAround(this.locate, PLAYER_VIEW_DISTANCE)
		const view = []
		for(let x=0; x<gridAround.length; x++) {
			view.push([])
			for(let y=0; y<gridAround.length; y++) {
				view[x][y] = blocToJSON(gridAround[x][y])
			}
		}
		return view
	}
}

function blocToJSON(bloc) {
	const jso = {}
	if(!bloc)
		return jso

	let sum = 0
	for(const key in bloc) {
		if(bloc[key] <= 0)
			delete bloc[key]
		else
			sum += bloc[key]
	}
	for(const key in bloc) {
		jso[key] = bloc[key] / sum
	}
	return jso
}

module.exports = {
	game: game,
	Player: Player,
}
