const InstallTab = ({
	mods, currentInstall
}) => {
	const { settings } = useApp()

	const modObj = mods.find(mod => mod.id === currentInstall.id)
	const download_progress = Math.round(
		(currentInstall?.download_total
			? (currentInstall.download_current ?? 0) / currentInstall.download_total * 100
			: 0
		)
	)
	
	return (
		<div>
			<br/>
			<h3 style={{marginBottom: "2rem"}}><LANG id="installing_mods"/></h3>
			<p>
				{modObj?.title?.[settings.language] ? replaceFlags(modObj.title[settings.language]) : ""}
			</p>
			<br/>
			<div className="progress-area">
				<progress
					value={currentInstall?.current ?? 0}
					max={currentInstall?.total ?? 1}
				/>
				<span>{currentInstall ? `${currentInstall.current ?? 0}/${currentInstall.total ?? 0}` : "0/0"}</span>

				<progress
					value={download_progress}
					max="100"
					style={{
						opacity: download_progress > 0 ? 1 : 0
					}}
				/>
				<span style={{
					opacity: download_progress > 0 ? 1 : 0
				}}>
					{download_progress + "%"}
				</span>
			</div>
			<Gallery/>
		</div>
	)
}
