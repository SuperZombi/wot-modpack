const FinishTab = ({
	fails, mods, selectedMods
}) => {
	const { settings, langData } = useApp()
	const [isLogsOpen, setIsLogsOpen] = React.useState(false)

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
					<div className="finish-tab-header error">
						<i className="fa-solid fa-circle-xmark"></i>
					</div>
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
										<li key={err.mod}>{replaceFlags(title[settings.language])}</li>
									)
								})}
							</ul>
						</React.Fragment>
					) : null}
						<Button href="https://github.com/SuperZombi/wot-modpack/issues"
							style={{fontSize: "12px", marginTop: "8px"}}
						>
							<i className="fa-regular fa-bug"></i>
							<LANG id="report_bug"/>
						</Button>
						<div style={{margin: "8px"}}>
							<InstallLogsViewer onVisibilityChange={setIsLogsOpen}/>
						</div>
					</React.Fragment>
				) : (
				<React.Fragment>
					<div className="finish-tab-header done">
						<i className="fa-solid fa-circle-check"></i>
						<div style={{fontWeight: "bold"}}>
							{selectedMods.length > 0 ? (
								<LANG id="installed_success"/>
							) : (
								<LANG id="deleted_success"/>
							)}
						</div>
					</div>
					<InstallLogsViewer onVisibilityChange={setIsLogsOpen}/>
					{!isLogsOpen && (
						<React.Fragment>
							<div className="advert-block">
								<div style={{fontWeight: "bold"}}><LANG id="advert_title"/></div>
								<p><LANG id="advert_description"/></p>
								<Button href="https://donatello.to/super_zombi">
									<i className="fa-solid fa-heart"></i>
									<LANG id="advert_button"/>
								</Button>
							</div>
							<Gallery style={{height: "300px", marginTop: "1rem"}}/>
						</React.Fragment>
					)}
					</React.Fragment>
				)}
		</div>
	)
}
