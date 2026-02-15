const fs = require('fs-extra')
const glob = require('glob')
const esbuild = require('esbuild')

const files = glob.sync('components/*.jsx')
const tempEntry = 'temp_combined.jsx'
const combinedCode = files.map(f => fs.readFileSync(f, 'utf8')).join('\n\n')
fs.writeFileSync(tempEntry, combinedCode)
esbuild.build({
	entryPoints: [tempEntry],
	bundle: true,
	outfile: 'dist/app.js',
	loader: { '.jsx': 'jsx' },
	platform: 'browser',
	format: 'iife',
	globalName: 'AppBundle',
	minify: true
}).then(() => {
	fs.unlinkSync(tempEntry)
	console.log('✅ React Build Done')
}).catch((err) => {
	console.error('❌ React Build Error:', err.message)
	process.exit(1)
})

const srcDir = 'web'
const distDir = 'dist/web'
fs.ensureDirSync(distDir)
fs.copySync(srcDir, distDir)
console.log('✅ Files copied')
