
let pid = 0
const PLAYER_VIEW_DISTANCE = 5 // *2+1 to get total field of view
const game = new Game()
init()

function Player() {
	this.name = 'P'+ (++pid)
	this.color = (Math.random()*360)|0
	this.locate = [0, 0]

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
	this.grid = {}
	this.get = function(xy) {
		const [x, y] = [...xy]
		if(this.grid[''+x] && this.grid[''+x][''+y]) {
			return this.grid[''+x][''+y]
		}
		return null
	}
	this.set = function(xy, set) {
		const [x, y] = [...xy]
		if(!this.grid[''+x]) {
			this.grid[''+x] = {}
		}
		this.grid[''+x][''+y] = set
	}

	this.getGridAround = function(xy, dist) {
		const [x, y] = [...xy]
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
}

function init() {
	game.set([0, 0], 'Wall')
}

module.exports = {
	game: game,
	Player: Player,
}
