const ModPreview = ({onClosePreview, previewData, collectFiles}) => {
	const {lang, langData} = useApp()
	const [isClosing, setIsClosing] = React.useState(false)
	const [stats, setStats] = React.useState({})
	const [currentGameVersion, setCurrentGameVersion] = React.useState("1.0.0")

	React.useEffect(() => {
		loadStatsPage("2089462923", data=>setStats(statsAsNumber(data)))
		loadStatsPage("379781718", data=>setCurrentGameVersion(getLatestGameVersion(statsAsNumber(data))))
	}, [])
	
	React.useEffect(() => {
		document.body.style.overflow = 'hidden';
		return ()=> document.body.style.overflow = 'unset';
	}, []);
	const BeforeClose = _=>{
		if (isClosing){return}
		setIsClosing(true)
		setTimeout(_=>{ onClosePreview() }, 350)
	}
	const onDownload = _=>{
		const files = collectFiles(previewData.id)
		buildZip({
			filename: previewData.id,
			files: files,
			gameVersion: currentGameVersion,
			downloadErrorText: langData["download_file_error"]?.[lang]
		})
	}
	
	return (
		<div className={`popup ${isClosing ? "hidden" : "visible"}`}
			onClick={e=>e.target.classList.contains("popup") && BeforeClose()}
		>
			<div className="container popup-content">
				<i className="close fa-solid fa-circle-xmark" onClick={_=>BeforeClose()}></i>
				<h3 align="center">
					{replaceFlags(previewData.title?.[lang]) || previewData.id}
				</h3>
				{previewData.image && (
					<div className="image-container">
						<img src={previewData.image} draggable={false}/>
					</div>
				)}
				{previewData.author && (
					<span>{<LANG id="author"/>}: {previewData.author}</span>
				)}
				{previewData.version && (
					<div>
						<span style={{marginRight: "5px"}}>{<LANG id="version"/>}:</span>
						<code className="container version">{previewData.version}</code>
					</div>
				)}
				<div>
					<i className="fa-solid fa-circle-down" style={{marginRight: "5px"}}></i>
					<span>{<LANG id="downloads"/>}: {stats[previewData.id] || 0}</span>
				</div>
				{previewData.description && (
					<div className="mod-description">
						<hr/>
						<div dangerouslySetInnerHTML={{ __html: previewData.description?.[lang] }}/>
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
					<button className="button shine" onClick={onDownload}>
						<i className="fa-solid fa-circle-down"></i>
						<span>{<LANG id="download_button"/>}</span>
					</button>
					<button className="button shine" onClick={_=>share({
						title: previewData.title?.[lang] || previewData.id,
						mod_id: previewData.id
					})}>
						<i className="fa-solid fa-share"></i>
						<span>{<LANG id="share"/>}</span>
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
function replaceFlags(text) {
	if (!text){return}
	const parts = text.split(/(:flag_[a-z]{2}:)/gi)
	return parts.map((part, i) => {
		const match = part.match(/^:flag_([a-z]{2}):$/i)
		if (match) {
			const code = match[1].toLowerCase()
			return <span key={i} className={`fi fi-${code}`} style={{verticalAlign: "middle"}}></span>
		}
		return part
	})
}
function compareVersions(left, right){
	return String(left).localeCompare(String(right), undefined, {numeric: true})
}
function getLatestGameVersion(gameVersionStats){
	const versions = Object.keys(gameVersionStats || {}).filter(version => /^\d+(\.\d+)+$/.test(version))
	if (versions.length === 0) {
		return "1.0.0"
	}
	return versions.sort(compareVersions).at(-1)
}
async function buildZip({
	filename, files, gameVersion = "1.0.0",
	downloadErrorText = "Failed to download file"
}){
	const zip = new JSZip();
	const PATHS = {
		mods: ["mods", gameVersion],
		res_mods: ["res_mods", gameVersion],
		configs: ["mods", "configs"]
	}
	for (const file of files) {
		const sourceFilename = file.url.split("/").pop() || file.url;
		try {
			const response = await fetch(file.url);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const blob = await response.blob();
			const isZip = sourceFilename.endsWith(".zip");

			const basePath = PATHS[file.dest];
			if (!basePath) continue;

			const baseParts = [
				...basePath,
				file.folder
			].filter(Boolean);

			if (isZip) {
				const innerZip = await JSZip.loadAsync(blob);
				for (const [innerPath, innerFile] of Object.entries(innerZip.files)) {
					if (innerFile.dir) continue;
					const innerContent = await innerFile.async("blob");
					const finalPath = [
						...baseParts,
						innerPath
					].join("/");
					zip.file(finalPath, innerContent);
				}
			} else {
				const finalPath = [
					...baseParts,
					sourceFilename
				].join("/");
				zip.file(finalPath, blob);
			}
		} catch (error) {
			alert(`${downloadErrorText}: ${sourceFilename}`);
			console.error("Failed to download file:", file.url, error);
			return;
		}
	}
	const content = await zip.generateAsync({ type: "blob" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(content);
	link.download = `${filename}.zip`;
	link.click();
}
