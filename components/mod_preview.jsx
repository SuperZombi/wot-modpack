const ModPreview = ({lang, onClosePreview, previewData, stats}) => {
	const [visible, setVisible] = React.useState(false);
	React.useEffect(() => {
		setVisible(true);
		document.body.style.overflow = 'hidden';
		return ()=> document.body.style.overflow = 'unset';
	}, []);
	const BeforeClose = _=>{
		if (visible){
			setVisible(false)
			setTimeout(_=>{ onClosePreview() }, 300)
		}
	}
	return (
		<div className={`popup ${visible ? "visible" : "hidden"}`}
			onClick={e=>e.target.classList.contains("popup") && BeforeClose()}
		>
			<div className="container popup-content">
				<i className="close fa-solid fa-circle-xmark" onClick={_=>BeforeClose()}></i>
				<h3 align="center">{previewData.title || previewData.id}</h3>
				{previewData.image && (
					<div className="image-container">
						<img src={previewData.image} draggable={false}/>
					</div>
				)}
				{previewData.author && (
					<span>{LANG.author[lang]}: {previewData.author}</span>
				)}
				{previewData.version && (
					<div>
						<span style={{marginRight: "5px"}}>{LANG.version[lang]}:</span>
						<code className="container version">{previewData.version}</code>
					</div>
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
					<button className="button shine" onClick={previewData.on_download}>
						<i className="fa-solid fa-circle-down"></i>
						<span>{LANG.download_button[lang]}</span>
					</button>
					<button className="button shine" onClick={_=>share({
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
