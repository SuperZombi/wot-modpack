const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const esbuild = require('esbuild')


const files = glob.sync('src/web/src/**/*.jsx')
const tempEntry = 'temp_combined.jsx'
const combinedCode = files.map(f => fs.readFileSync(f, 'utf8')).join('\n\n')
fs.writeFileSync(tempEntry, combinedCode)
esbuild.build({
	entryPoints: [tempEntry],
	bundle: true,
	outfile: 'web/app.js',
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


const cssFiles = glob.sync('src/web/styles/*.css')
const tempCss = 'temp_combined.css'
const combinedCss = cssFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n\n')
fs.writeFileSync(tempCss, combinedCss)
esbuild.build({
	entryPoints: [tempCss],
	outfile: 'web/style.css',
	minify: true,
	bundle: true,
	loader: { '.css': 'css' },
	plugins: [
		{
			name: 'ignore-urls',
			setup(build) {
				build.onResolve({ filter: /^\/images\// }, args => ({
					path: args.path,
					external: true
				}))
			}
		}
	]
}).then(() => {
	fs.unlinkSync(tempCss)
	console.log('✅ CSS Build Done')
}).catch((err) => {
	console.error('❌ CSS Build Error:', err.message)
	process.exit(1)
})


const srcDir = 'src/web'
const destDir = 'web'
fs.ensureDirSync(destDir)
fs.copySync(srcDir, destDir, {
	filter: (src) => {
		if (src.startsWith(path.join(srcDir, 'src')) || src.startsWith(path.join(srcDir, 'styles')) || src.endsWith("html")) {
			return false
		}
		return true
	}
})
fs.copySync('github/react', path.join(destDir, 'react'))
const srcHtml = path.join(srcDir, 'main.html')
const destHtml = path.join(destDir, 'index.html')
fs.copyFileSync(srcHtml, destHtml)
console.log('✅ Files copied')
