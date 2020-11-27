const UTILS = require('./utils')
const struct = require('./mapGen.json')

const getRandomBlocContent = function(blocContents, rnd) {
	const finalContent = {}
	for(const alternative in blocContents) {
		const alternativeDistribution = blocContents[alternative]
		const quantity = rnd.int(alternativeDistribution.from, alternativeDistribution.to)
		if(quantity) finalContent[alternative] = quantity
	}
	return finalContent
}
const getRandomBloc = function(layerBlocs, rnd) {
	const options = []
	let sumAltChance = 0
	for(const alternative of layerBlocs) {
		sumAltChance += alternative.chance
		options.push(sumAltChance)
	}
	const rand = rnd.int(0, sumAltChance)
	let choice = 0
	while(options[choice] < rand) choice++
	return getRandomBlocContent(layerBlocs[choice].content, rnd)
}

function Generator(rnd) {
	const blocs = []
	const surface = []

	const addCore = function(layer) {
		const coreBloc = getRandomBloc(layer.blocs, rnd)
		const coresLocation = struct.coresLocation
		const x = rnd.norm(coresLocation.x, coresLocation.d)
		const y = rnd.norm(coresLocation.y, coresLocation.d)
		const descriptor = {x: Math.round(x), y: Math.round(y), bloc: coreBloc}
		blocs.push(descriptor)
		surface.push(descriptor)
		console.log(descriptor.x, descriptor.y)
	}

	const findSurfaceSpace = function(ttry=0) {
		const surfaceIndex = rnd.int(0, surface.length-1)
		const base = surface[surfaceIndex]
		const arnd = UTILS.shuffle([[base.x-1,base.y], [base.x+1,base.y], [base.x,base.y-1], [base.x,base.y+1]], rnd)
		while(arnd.length) {
			const xy = arnd.shift()
			if(!blocs.find((a)=>a.x === xy[0] && a.y === xy[1]))
				return xy
		}
		if(ttry < 100) {
			surface[surfaceIndex] = surface[surface.length-1]
			surface.length--
			return findSurfaceSpace(ttry+1)
		}
		throw 'Could not find space on surface after 100 tries'
	}
	const addLayer = function(layer) {
		for(let i=layer.count; i; i--) {
			const newBloc = getRandomBloc(layer.blocs, rnd)
			const location = findSurfaceSpace()
			const descriptor = {x: location[0], y: location[1], bloc: newBloc}
			blocs.push(descriptor)
			surface.push(descriptor)
		}
	}

	this.generate = function() {
		console.debug('Generating core')
		for(let i=struct.cores; i; i--) addCore(struct.layers[0])
		for(let i=0; i<struct.layers.length; i++) {
			console.debug('Generating layer ' + (i+1) + '/' + struct.layers.length)
			addLayer(struct.layers[i])
		}
		return blocs
	}
}

module.exports = {
	run: (rnd)=>{
		return new Generator(rnd).generate()
	}
}
