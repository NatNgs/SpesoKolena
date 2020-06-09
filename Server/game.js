const UTILS = require('./utils')

let pid = 0
const PLAYER_VIEW_DISTANCE = 5 // *2+1 to get total field of view
const game = new Game()
init()

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
		return game.getGridAround(this.locate, PLAYER_VIEW_DISTANCE)
	}
}

function Game() {
	const _grid = {}
	this.get = function(xy) {
		const x = xy[0], y = xy[1]
		return _grid[x] && _grid[x][y] ? _grid[x][y] : null
	}
	this.set = function(xy, set) {
		const x = xy[0], y = xy[1]
		if(!_grid[x])
			_grid[x] = {}
		_grid[x][y] = set
	}

	this.getGridAround = function(xy, dist) {
		const x = xy[0], y = xy[1]
		const grid = []
		const decalX = x-dist
		const decalY = y-dist
		for(let xi=x-dist; xi<=x+dist; xi++) {
			grid[xi-decalX] = []
			for(let yi=y-dist; yi<=y+dist; yi++) {
				grid[xi-decalX][yi-decalY] = this.get([xi, yi])
			}
		}
		return grid
	}

	this.getAnyLocationNearWall = function() {
		const xs = UTILS.shuffle(Object.keys(_grid))
		for(const x in xs) {
			const row = _grid[x]
			const ys = UTILS.shuffle(Object.keys(row).filter((a)=>a==='Wall'))
			for(const y in ys) {
				const around = this.getGridAround([x, y], 1)
				const tries = UTILS.shuffle([[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]])
				for(const t in tries) {
					if(around[t[0]][t[1]] === null) {
						return [x + t[0], y + t[1]]
					}
				}
			}
		}
		return null
	}
}

function init() {
	game.set([0, 0], 'Wall')
}

module.exports = {
	game: game,
	Player: Player,
}
