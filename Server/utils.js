function RandomGen(seed) {
	// Mulberry32 Algorithm
	const THIS = this
	let _a = seed || ((Math.random() * 4294967296) | 0)

	this.reset = function() {
		_a = seed
	}
	this.float = function(min=0, max=1) {
		let t = (_a += 0x6D2B79F5)
		t = Math.imul(t ^ t >>> 15, t | 1)
		t ^= t + Math.imul(t ^ t >>> 7, t | 61)
		return ((t ^ t >>> 14) >>> 0) / (4294967296 / (max-min)) + min
	}
	this.int = function(min=0, max=1) {
		return THIS.float(min, max+1) | 0
	}

	/**
	 * Return random number between -Infinity and Infinity such as distribution is normal with specified average
	 *
	 * Help for stretch: (for avg=0)
	 *  - for stretch=1.00: 50% chance to get between -0.69 and 0.69
	 *  - for stretch=1.45: 50% chance to get between -1.00 and 1.00
	 *  - for stretch=2.00: 50% chance to get between -1.38 and 1.38
	 *  - for stretch=10.0: 50% chance to get between -6.9 and 6.9
	 */
	this.norm = function(avg=0, stretch=1) {
		let u = 0, v = 0
		while(u === 0) u = THIS.float()
		while(v === 0) v = THIS.float()
		return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stretch + avg
	}
}

function shuffle(array, rnd) {
	rnd = rnd ? rnd.float : Math.random

	let i = array.length, j, t
	while(i) {
		t = array[--i]
		array[i] = array[j = (rnd() * i) | 0]
		array[j] = t
	}
	return array
}

module.exports = {
	RandomGen: RandomGen,
	shuffle: shuffle,
}
