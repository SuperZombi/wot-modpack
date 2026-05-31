const InstallTab = ({
	mods, currentInstall
}) => {
	const { settings } = useApp()

	const modObj = mods.find(mod => mod.id === currentInstall.id)
	const download_current = currentInstall?.download_current ?? 0
	const download_total = currentInstall?.download_total ?? 0
	const download_progress = download_total ? (
		Math.round(download_current / download_total * 100)
	) : 0
	
	return (
		<div>
			<br/>
			<h3 style={{marginBottom: "2rem"}}><LANG id="installing_mods"/></h3>
			<div>
				{modObj?.title?.[settings.language] ? replaceFlags(modObj.title[settings.language]) : ""}
			</div>
			<br/>
			<div className="progress-area">
				<progress
					value={currentInstall?.current ?? 0}
					max={currentInstall?.total ?? 1}
				/>
				<span style={{
					color: "#f5a623", fontFamily: "monospace"
				}}>{currentInstall ? `${currentInstall.current ?? 0}/${currentInstall.total ?? 0}` : "0 / 0"}</span>

				<progress
					value={download_progress}
					max="100"
					style={{
						opacity: download_progress > 0 ? 1 : 0
					}}
				/>
				<span style={{
					opacity: download_progress > 0 ? 1 : 0,
					color: "#f5a623", fontFamily: "monospace"
				}}>
					{download_progress + "%"}
				</span>
			</div>
			<div className="download-progress-size"
				style={{opacity: download_progress > 0 ? 1 : 0}}
			>
				<span>
					<span>{bytesToMb(download_current)}</span>
					<LANG id="megabytes"/>
				</span>
				<span>/</span>
				<span>
					<span>{bytesToMb(download_total)}</span>
					<LANG id="megabytes"/>
				</span>
			</div>
			<Gallery/>
		</div>
	)
}
