const ModsList = ({ mods, groups, lang, onPreview }) => {
	return mods.length > 0 ? (
		<div className="container" id="mods-list">
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
									<Mod key={gmod.id} mod={gmod} lang={lang} onPreview={onPreview}/>
								)
							})}
						</React.Fragment>
					)
				}
				return (
					<Mod key={mod.id} mod={mod} lang={lang} onPreview={onPreview}/>
				)
			})}
		</div>
	) : <Loader/>
}
const Mod = ({ mod, lang, onPreview }) => {
	return (
		<div className="mod" onClick={_=>onPreview(mod)}>
			<img src={mod.image} draggable={false}/>
			<span>{replaceFlags(mod.title[lang])}</span>
		</div>
	)
}
const ModStats = ({mods, stats, lang, onPreview}) => {
	const sortedMods = mods
		.filter(mod => mod.title)
		.map(mod => ({
			...mod,
			popularity: stats[mod.id] || 0
		}))
		.sort((a, b) => b.popularity - a.popularity)

	return mods.length > 0 ? (
		<div className="container" id="stats-list">
			{sortedMods.map(mod => (
				<div className="mod" key={mod.id} onClick={_=>onPreview(mod)}>
					<img src={mod.image} draggable={false}/>
					<span>{replaceFlags(mod.title[lang])}</span>
					<span>{mod.popularity}</span>
				</div>
			))}
		</div>
	) : <Loader/>
}
const Loader = ()=>{
	return (
		<div className="container" align="center">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="48" fill="#eee">
				<path d="M12 1a11 11 0 1 0 11 11A11 11 0 0 0 12 1m0 19a8 8 0 1 1 8-8 8 8 0 0 1-8 8" opacity="0.25"/>
				<path d="M10.14 1.16a11 11 0 0 0-9 8.92A1.6 1.6 0 0 0 2.46 12a1.5 1.5 0 0 0 1.65-1.3 8 8 0 0 1 6.66-6.61A1.4 1.4 0 0 0 12 2.69a1.57 1.57 0 0 0-1.86-1.53">
					<animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/>
				</path>
			</svg>
		</div>
	)
}
