const Settings = ({
	onClose, setCachedMods
}) => {
	const langOptions = [
		{ path: "en", title: "English" },
		{ path: "ru", title: "Русский" },
		{ path: "uk", title: "Українська" }
	]
	const {langData, settings, updateSetting} = useApp()
	const [cacheSize, setCacheSize] = React.useState(0)
	
	React.useEffect(_=>{
		(async _=>{
			const cache = await eel.get_cache_size()()
			setCacheSize(bytesToMb(cache))
		})()
	}, [cacheSize])
	async function clear_cache(){
		await eel.delete_cache()()
		setCacheSize(0)
		setCachedMods([])
	}
	React.useEffect(() => {
		lucide.createIcons()
	}, [])

	return (
		<Popup onClose={onClose}>
			<section>
				<h3 style={{margin: 0}}><LANG id="settings"/></h3>
			</section>
			<hr/>
			<section>
				<div className="row">
					<div className="row-label">
						<div><i data-lucide="languages"></i></div>
						<span><LANG id="language"/>:</span>
					</div>
					<Select
						options={langOptions}
						value={{path: settings.language, title: langOptions.find(x=>x.path==settings.language).title}}
						onChange={val=>updateSetting("language", val.path)}
						placeholder={langData["language"]}
						style={{fontSize: "0.8em"}}
					/>
				</div>
				<div className="row">
					<div className="row-label">
						<div><i data-lucide="funnel"></i></div>
						<LANG id="match_client_lang"/>
					</div>
					<input type="checkbox" className="setting_element hover"
						checked={settings.match_client_lang} onChange={e=>updateSetting("match_client_lang", e.target.checked)}
					/>
				</div>
			</section>
			<hr/>
			<section>
				<div className="row">
					<div className="row-label">
						<div><i data-lucide="database"></i></div>
						<LANG id="use_cache"/>
					</div>
					<input type="checkbox" className="setting_element hover"
						checked={settings.use_cache} onChange={e=>updateSetting("use_cache", e.target.checked)}
					/>
				</div>
				<div className="row">
					<div className="row-label">
						<div><i data-lucide="trash"></i></div>
						<span><LANG id="cache_size"/>:</span>
						<span className="file_size">
							<span>{cacheSize}</span>
							<LANG id="megabytes"/>
						</span>
					</div>
					<Button onClick={clear_cache} style={{fontSize: "14px"}}>
						<LANG id="clear_cache"/>
					</Button>
				</div>
			</section>
			<hr/>
			<section>
				<div className="links">
					<a href="https://www.youtube.com/c/SuperZombi" className="hover" target="_blank">
						<img src="/images/youtube_logo.png" draggable={false}/>
					</a>
					<a href="https://github.com/SuperZombi/wot-modpack" className="hover" target="_blank">
						<img src="/images/github_logo.png" draggable={false}/>
					</a>
					<a href="https://donatello.to/super_zombi" className="hover" target="_blank">
						<img src="/images/donatello_logo.png" draggable={false}/>
					</a>
				</div>
			</section>
			<hr/>
			<section style={{paddingBottom: 0}}>
				<Button href="https://github.com/SuperZombi/wot-modpack/issues" style={{fontSize: "12px", gap: "4px"}}>
					<i data-lucide="bug"></i>
					<LANG id="report_bug"/>
				</Button>
			</section>
		</Popup>
	)
}
const Button = ({children, href=null, className="", hasIcon=false, ...props})=>{
	React.useEffect(() => {
		if (hasIcon){lucide.createIcons()}
	}, [hasIcon])
	if (href){
		return (
			<a className={`button hover ${className}`.trim()}
				href={href} target="_blank" {...props}
			>
				{children}
			</a>
		)
	}
	return (
		<div className={`button hover ${className}`.trim()}
			{...props}
		>
			{children}
		</div>
	)
}
const BackButton = ({className="", style, ...props})=>{
	return (
		<Button
			className={`flex-center-row ${className}`}
			style={{ display: "inline-flex", gap: "5px", ...style }}
			hasIcon={true} {...props}
		>
			<i data-lucide="arrow-left"></i>
			<LANG id="back"/>
		</Button>
	)
}
const NextButton = ({className="", style, ...props})=>{
	return (
		<Button
			className={`flex-center-row ${className}`}
			style={{ display: "inline-flex", gap: "5px", ...style }}
			hasIcon={true} {...props}
		>
			<LANG id="next"/>
			<i data-lucide="arrow-right"></i>
		</Button>
	)
}
