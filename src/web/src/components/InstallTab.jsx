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
				{modObj?.title?.[language] ? replaceFlags(modObj.title[language]) : ""}
			</p>
			<br/>
			<div className="progress-area">
				<progress
					value={currentInstall?.current ?? 0}
					max={currentInstall?.total ?? 1}
				/>
				<span>{currentInstall ? `${currentInstall.current ?? 0}/${currentInstall.total ?? 0}` : "0/0"}</span>

				<progress
					value={currentInstall?.download_progress ?? 0}
					max="100"
					style={{
						opacity: (currentInstall?.download_progress ?? 0) > 0 ? 1 : 0
					}}
				/>
				<span style={{
					opacity: (currentInstall?.download_progress ?? 0) > 0 ? 1 : 0
				}}>
					{(currentInstall?.download_progress ?? 0) + "%"}
				</span>
			</div>
			<Gallery/>
		</div>
	)
}
