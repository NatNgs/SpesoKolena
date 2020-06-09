const fs = require('fs')
const path = require('path')

const minify = require('@node-minify/core')
const minifyHTML = require('html-minifier-terser').minify
const minifyJS = require('@node-minify/google-closure-compiler')
const minifyCSS = require('@node-minify/crass')

const NULL_FC = ()=>{}

const minifyJSSettings = {
	languageIn: 'ES6',
	languageOut: 'ES6',
}

const minifyHTMLSettings = {
	collapseWhitespace: true,
	collapseBooleanAttributes: true, // Omit attribute values from boolean attributes
	decodeEntities: true, // Use direct Unicode characters whenever possible
	html5: true, // Parse input according to HTML5 specifications
	keepClosingSlash: true, // Keep the trailing slash on singleton elements
	quoteCharacter: '"', // Type of quote to use for attribute values (' or ")
	removeAttributeQuotes: true, // Remove quotes around attributes when possible
	minifyJS: true,
	minifyCSS: true,
	minifyURLs: true,
	removeComments: true, // Strip HTML comments
	removeRedundantAttributes: true, // Remove attributes when value matches default.
	removeScriptTypeAttributes: true, // Remove type="text/javascript" from script tags. Other type attribute values are left intact
	removeStyleLinkTypeAttributes: true, // Remove type="text/css" from style and link tags. Other type attribute values are left intact
	useShortDoctype: true, // Replaces the doctype with the short (HTML5) doctype
}

// Prepare cache folder
const tmpFolder = 'tmp'
fs.rmdirSync(tmpFolder, { recursive: true })

const minifiersMap = {
	// Default (will not be minified)
	'': (fileName, cbSuccess, cbError)=>{
		const tmpPath = path.join(tmpFolder, fileName)
		fs.readFile(fileName, (err, fileContent)=>{
			if(err || !fileContent)
				return cbError(err)

			fs.mkdir(
				path.dirname(tmpPath),
				{ recursive: true },
				()=>fs.writeFile(tmpPath, fileContent, NULL_FC)
			)
			cbSuccess(fileContent)
		})
	},
	'html': (fileName, cbSuccess, cbError)=>{
		const tmpPath = path.join(tmpFolder, fileName)
		fs.readFile(fileName, (err, fileContent)=>{
			if (err || !fileContent) {
				return cbError(err)
			}
			const minified = minifyHTML(fileContent.toString(), minifyHTMLSettings)
			fs.mkdir(
				path.dirname(tmpPath),
				{ recursive: true },
				()=>fs.writeFile(tmpPath, minified, NULL_FC)
			)
			cbSuccess(minified)
		})
	},
	'js': (fileName, cbSuccess, cbError)=>{
		const tmpPath = path.join(tmpFolder, fileName)
		fs.mkdirSync(path.dirname(tmpPath), { recursive: true })
		minify({
			compressor: minifyJS,
			options: minifyJSSettings,
			input: fileName,
			output: tmpPath,
		}).then(cbSuccess).catch(cbError)
	},
	'css': (fileName, cbSuccess, cbError)=>{
		const tmpPath = path.join(tmpFolder, fileName)
		fs.mkdirSync(path.dirname(tmpPath), { recursive: true })
		minify({
			compressor: minifyCSS,
			input: fileName,
			output: tmpPath,
		}).then(cbSuccess).catch(cbError)
	},
}

module.exports = {
	getFileAsync: function(fileName, cbSuccess, cbError) {
		// look for file in tmp folder
		fs.readFile(path.join(tmpFolder, fileName), (err, minifiedFileContent)=>{
			if(minifiedFileContent) {
				cbSuccess(minifiedFileContent)
				return
			}
			const ext = fileName.slice(fileName.lastIndexOf('.')+1)
			let minifier = minifiersMap[ext]
			if(!minifier)
				minifier = minifiersMap['']
			else
				console.debug('Minifying ' + fileName + ' to ' + path.join(tmpFolder, fileName))
			minifier(fileName, cbSuccess, cbError)
		})
	}
}
