const Settings = ({
	appVersion, onClose, setCachedMods
}) => {
	const langOptions = [
		{ path: "en", title: "English" },
		{ path: "ru", title: "Русский" },
		{ path: "uk", title: "Українська" }
	]
	const {
		langData, language, setLanguage,
		matchClientLang, setMatchClientLang,
		useCache, setUseCache
	} = useApp()
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
		<div className="popup show">
			<div className="popup_wraper">
				<img src="/images/close.svg" className="close hover" draggable={false}
					onClick={onClose}
				/>
				<h3 align="center"><LANG id="settings"/></h3>
				<p style={{textAlign: "center"}}>
					<LANG id="version"/> <span id="app-version">{appVersion}</span>
				</p>
				<hr/>
				<br/>
				<div className="flex-row">
					<img src="/images/planet.svg" height="20" draggable={false}/>
					<span><LANG id="language"/>:</span>
					<Select
						options={langOptions}
						value={{path: language, title: langOptions.find(x=>x.path==language).title}}
						onChange={val=>setLanguage(val.path)}
						placeholder={langData["language"]}
					/>
				</div>
				<br/>
				<div className="flex-center">
					<label className="hover">
						<input type="checkbox" className="setting_element hover"
							checked={matchClientLang} onChange={e=>setMatchClientLang(e.target.checked)}
						/>
						<LANG id="match_client_lang"/>
					</label>
				</div>
				<br/>
				<hr/>
				<p className="flex-center">
					<label className="hover">
						<input type="checkbox" className="setting_element hover"
							checked={useCache} onChange={e=>setUseCache(e.target.checked)}
						/>
						<LANG id="use_cache"/>
					</label>
				</p>
				<p style={{textAlign: "center"}}>
					<span><LANG id="cache_size"/>: </span>
					<span className="file_size">
						<span>{cacheSize}</span>
						<LANG id="megabytes"/>
					</span>
				</p>
				<div style={{textAlign: "center", fontSize: "14px"}}>
					<div className="button hover" onClick={clear_cache}>
						<LANG id="clear_cache"/>
					</div>
				</div>
				<hr/>
				<p className="links">
					<a href="https://www.youtube.com/c/SuperZombi" className="hover" target="_blank">
						<img src="/images/youtube_logo.png" draggable={false}/>
					</a>
					<a href="https://github.com/SuperZombi/wot-modpack" className="hover" target="_blank">
						<img src="/images/github_logo.png" draggable={false}/>
					</a>
					<a href="https://donatello.to/super_zombi" className="hover" target="_blank">
						<img src="/images/donatello_logo.png" draggable={false}/>
					</a>
				</p>
				<div style={{textAlign: "center", fontSize: "12px"}}>
					<a className="button hover" href="https://github.com/SuperZombi/wot-modpack/issues" target="_blank">
						<LANG id="report_bug"/>
					</a>
				</div>
			</div>
		</div>
	)
}
function bytesToMb(bytes) {
	return Math.round(bytes / (1024 * 1024));
}
