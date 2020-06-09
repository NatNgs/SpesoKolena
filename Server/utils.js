module.exports = {
	shuffle: (array)=>{
		let i = array.length, j, t
		while(i) {
			j = Math.floor(Math.random() * i)
			i--
			t = array[i]
			array[i] = array[j]
			array[j] = t
		}
		return array
	}
}
