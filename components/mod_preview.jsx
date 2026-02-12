const ModPreview = ({lang, onClosePreview, previewData, stats}) => {
	React.useEffect(() => {
		document.body.style.overflow = 'hidden';
		return ()=> document.body.style.overflow = 'unset';
	}, []);
	return (
		<div className="popup" onClick={e=>e.target.classList.contains("popup") && onClosePreview()}>
			<div className="container popup-content">
				<i className="close fa-solid fa-circle-xmark" onClick={_=>onClosePreview()}></i>
				<h3 align="center">{previewData.title}</h3>
				<div className="image-container">
					<img src={previewData.image} draggable={false}/>
				</div>
				{previewData.author && (
					<span>{LANG.author[lang]}: {previewData.author}</span>
				)}
				{previewData.version && (
					<span>{LANG.version[lang]}: <code className="version">{previewData.version}</code></span>
				)}
				<div>
					<i className="fa-solid fa-circle-down" style={{marginRight: "5px"}}></i>
					<span>{LANG.downloads[lang]}: {stats[previewData.id] || 0}</span>
				</div>
				{previewData.description && (
					<div className="mod-description">
						<hr/>
						<div dangerouslySetInnerHTML={{ __html: previewData.description}}/>
					</div>
				)}
				{previewData.audio && (
					<div style={{width: "100%"}}>
						<audio src={previewData.audio}
							controls autoPlay controlsList="nodownload"
							style={{width: "100%"}}
						/>
					</div>
				)}
				<div className="row">
					<button className="button" onClick={previewData.on_download}>
						<i className="fa-solid fa-circle-down"></i>
						<span>{LANG.download_button[lang]}</span>
					</button>
					<button className="button" onClick={_=>share({
						title: previewData.title,
						mod_id: previewData.id
					})}>
						<i className="fa-solid fa-share"></i>
						<span>{LANG.share[lang]}</span>
					</button>
				</div>
			</div>
		</div>
	)
}
function share(data) {
	const params = new URLSearchParams()
	params.set("id", data.mod_id)
	const url = new URL(window.location.href)
	url.search = params.toString()
	if (navigator.share) {
		navigator.share({
			title: data.title,
			text: data.title,
			url: url.toString()
		})
	} else {
		navigator.clipboard.writeText(url.toString())
	}
}
