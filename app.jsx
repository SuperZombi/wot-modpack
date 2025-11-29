const App = () => {
	const [mods, setMods] = React.useState([])
	const [groups, setGroups] = React.useState([])
	const [showPreview, setShowPreview] = React.useState(false)
	const [previewData, setPreviewData] = React.useState({})
	
	const supportedLangs = ["en", "ru", "uk"]
	const userLang = navigator.language?.slice(0, 2)
	const [lang, setLang] = React.useState(supportedLangs.includes(userLang) ? userLang : 'en')

	React.useEffect(() => {
		fetch('https://raw.githubusercontent.com/SuperZombi/wot-modpack/refs/heads/mods/config.json')
		.then(r=>{
			if (!r.ok) {
				throw new Error(`HTTP error!: ${r.status}`);
			}
			return r.json()
		}).then(data=>{
			setMods(data.mods)
			setGroups(data.groups)
		})
		.catch(console.error)
	}, [])

	const onPreview = data=>{
		setPreviewData(data)
		setShowPreview(true)
	}

	return (
		<React.Fragment>
			<h1 align="center">Web Modpack Mods list</h1>
			<p align="center">{mods.filter(mod => mod.title).length} mods</p>
			<p align="center">
				<select name="lang" value={lang} onChange={e=>setLang(e.target.value)} style={{fontSize: "12pt"}}>
					<option value="en">English</option>
					<option value="ru">Russian</option>
					<option value="uk">Ukranian</option>
				</select>
			</p>
			<ModsList mods={mods} groups={groups} lang={lang} onPreview={onPreview}/>
			{showPreview ? (
				<div className="popup" onClick={e=>e.target.classList.contains("popup") ? setShowPreview(false) : null}>
					<div className="popup-content">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
							className="close" onClick={_=>setShowPreview(false)}
						>
							<path fill="#ec0000" d="M127.86 254.3C58.13 254.3 1.4 197.59 1.4 127.87 1.4 58.13 58.13 1.4 127.86 1.4s126.45 56.72 126.45 126.45c0 69.72-56.73 126.45-126.45 126.45"/>
							<path fill="#fff" d="M82.62 187.14a14.04 14.04 0 0 1-9.94-23.98l90.48-90.47a14.05 14.05 0 0 1 19.86 19.87l-90.46 90.47a14 14 0 0 1-9.94 4.11"/>
							<path fill="#fff" d="M173.1 187.14a14 14 0 0 1-9.94-4.11L72.69 92.56a14.05 14.05 0 1 1 19.87-19.87l90.47 90.47a14.04 14.04 0 0 1-9.94 23.98z"/>
						</svg>
						<div className="image-container">
							<img src={previewData.image} draggable={false}/>
						</div>
						<h3 align="center">{previewData.title}</h3>
						{previewData.description ? (
							<p dangerouslySetInnerHTML={{ __html: previewData.description}}></p>
						) : null}
					</div>
				</div>
			) : null}
		</React.Fragment>
	)
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>)

const ModsList = ({ mods, groups, lang, onPreview }) => {
	return (
		<div id="mods-list">
			{mods.map(mod => {
				if (!mod.title){return null}
				if (mod.group) {
					const group = groups.find(g => g.id === mod.group);
					if (!group) return null;

					const alreadyRendered = mods.findIndex(m => m.group === group.id) < mods.indexOf(mod);
					if (alreadyRendered) return null;

					const modsInGroup = mods.filter(m => m.group === group.id)
					return (
						<React.Fragment key={group.id}>
							{modsInGroup.map(gmod=>{
								return (
									<Mod
										key={gmod.id}
										title={gmod.title[lang]}
										description={gmod.description?.[lang]}
										author={gmod.author}
										image={gmod.image}
										onPreview={onPreview}
									/>
								)
							})}
						</React.Fragment>
					)
				}
				return (
					<Mod
						key={mod.id}
						title={mod.title[lang]}
						description={mod.description?.[lang]}
						author={mod.author}
						image={mod.image}
						onPreview={onPreview}
					/>
				)
			})}
		</div>
	)
}

const Mod = ({
	title, description, author, image, onPreview
}) => {
	return (
		<div className="mod" onClick={_=>onPreview({
			title: replaceFlags(title),
			description: description,
			author: author,
			image: image
		})}>
			<img src={image} draggable={false}/>
			<span>{replaceFlags(title)}</span>
		</div>
	)
}
function replaceFlags(text) {
	const parts = text.split(/(:flag_[a-z]{2}:)/gi)
	return parts.map((part, i) => {
		const match = part.match(/^:flag_([a-z]{2}):$/i)
		if (match) {
			const code = match[1].toLowerCase()
			return <span key={i} className={`fi fi-${code}`} style={{verticalAlign: "middle"}}></span>
		}
		return part
	})
}
