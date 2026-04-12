const Settings = ({
	appVersion, onClose, setCachedMods
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

	return (
		<Popup onClose={onClose}>
			<section>
				<h3 style={{margin: 0}}><LANG id="settings"/></h3>
				<span>
					<LANG id="version"/> <span id="app-version">{appVersion}</span>
				</span>
			</section>
			<hr/>
			<section>
				<div className="flex-row">
					<img src="/images/planet.svg" height="20" draggable={false}/>
					<span><LANG id="language"/>:</span>
					<Select
						options={langOptions}
						value={{path: settings.language, title: langOptions.find(x=>x.path==settings.language).title}}
						onChange={val=>updateSetting("language", val.path)}
						placeholder={langData["language"]}
					/>
				</div>
				<label className="hover">
					<input type="checkbox" className="setting_element hover"
						checked={settings.match_client_lang} onChange={e=>updateSetting("match_client_lang", e.target.checked)}
					/>
					<LANG id="match_client_lang"/>
				</label>
			</section>
			<hr/>
			<section>
				<label className="hover">
					<input type="checkbox" className="setting_element hover"
						checked={settings.use_cache} onChange={e=>updateSetting("use_cache", e.target.checked)}
					/>
					<LANG id="use_cache"/>
				</label>
				<div>
					<span><LANG id="cache_size"/>: </span>
					<span className="file_size">
						<span>{cacheSize}</span>
						<LANG id="megabytes"/>
					</span>
				</div>
				<Button onClick={clear_cache} style={{fontSize: "14px"}}>
					<LANG id="clear_cache"/>
				</Button>
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
				<Button href="https://github.com/SuperZombi/wot-modpack/issues" style={{fontSize: "12px"}}>
					<LANG id="report_bug"/>
				</Button>
			</section>
		</Popup>
	)
}
function bytesToMb(bytes) {
	return Math.round(bytes / (1024 * 1024));
}
