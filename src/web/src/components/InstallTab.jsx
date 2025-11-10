const InstallTab = ({
	mods, currentInstall
}) => {
	const { language } = useApp()

	const modObj = mods.find(mod => mod.id === currentInstall.id)
	
	return (
		<div>
			<br/>
			<h3 style={{marginBottom: "2rem"}}><LANG id="installing_mods"/></h3>
			<p>
				{modObj ? (replaceFlags(modObj.title[language])) : ""}
			</p>
			<br/>
			<div className="progress-area">
				<progress
					value={currentInstall ? currentInstall.current : 0}
					max={currentInstall ? currentInstall.total : 1}
				/>
				<span>{currentInstall ? `${currentInstall.current}/${currentInstall.total}` : "0/0"}</span>

				<progress
					value={currentInstall ? currentInstall.download_progress : 0}
					max="100"
				/>
				<span>{currentInstall ? `${currentInstall.download_progress}%` : "0%"}</span>
			</div>
			<Gallery/>
		</div>
	)
}
