const FinishTab = ({
	fails, mods, selectedMods
}) => {
	const { language, langData } = useApp()
	function getKnownError(){
		if (fails.filter(x=>x.error).length > 0){
			let known_error = fails.find(x =>
				Object.keys(langData).some(key => x.error == key)
			)?.error
			return langData[known_error]
		}
	}
	const known_error = getKnownError()
	const system_errors = fails.filter(x=>x.error)
	const mods_errors = fails.filter(x=>x.mod)
	return (
		<div>
			{ fails.length > 0 ? (
				<React.Fragment>
					<br/>
					{known_error ? (
						<h3 style={{color: "red"}} dangerouslySetInnerHTML={{ __html: known_error }}></h3>
					) : system_errors.length > 0 ? (
						<h3 style={{color: "red"}}>{system_errors[0].error}</h3>
					) : null}
					{mods_errors.length > 0 ? (
						<React.Fragment>
							<h3><LANG id="failed_to_install"/></h3>
							<ul className="mods-install-list">
								{mods_errors.map(err=>{
									const title = mods.find(x=>x.id == err.mod).title
									return (
										<li key={err.mod}>{replaceFlags(title[language])}</li>
									)
								})}
							</ul>
						</React.Fragment>
					) : null}
					<br/>
					<Button href="https://github.com/SuperZombi/wot-modpack/issues" style={{fontSize: "12px"}}>
						<LANG id="report_bug"/>
					</Button>
				</React.Fragment>
			) : (
				<React.Fragment>
					<br/>
					<h3>
						{selectedMods.length > 0 ? (
							<LANG id="installed_success"/>
						) : (
							<LANG id="deleted_success"/>
						)}
					</h3>
					<br/>
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
					<Gallery/>
				</React.Fragment>
			)}
		</div>
	)
}
