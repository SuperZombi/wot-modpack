const ModPreview = ({onClosePreview, previewData, collectFiles, stats, stats_csv}) => {
	const {lang, langData} = useApp()
	const [currentGameVersion, setCurrentGameVersion] = React.useState("1.0.0")
	React.useEffect(() => {
		setCurrentGameVersion(
			getLatestGameVersion(
				countByField(stats_csv, "WoT version",
					row => row["WoT branch"] === "RELEASE"
				)
			)
		)
	}, [stats_csv])

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
		<Popup onClose={onClosePreview}>
			<h3 align="center">
				{replaceFlags(previewData.title?.[lang]) || previewData.id}
			</h3>
			{previewData.image && (
				<div className="image-container">
					<img src={previewData.image} draggable={false}/>
				</div>
			)}
			<div className="badge-area">
				{previewData.author && (
					<div className="badge shine" title={langData["author"][lang]}>
						<i className="fa-solid fa-circle-user"></i>
						<span>{previewData.author}</span>
					</div>
				)}
				{previewData.ver && (
					<div className="badge shine" title={langData["version"][lang]}>
						<i className="fa-solid fa-tag"></i>
						<span>{previewData.ver}</span>
					</div>
				)}
				<div className="badge shine" title={langData["downloads"][lang]}>
					<i className="fa-solid fa-circle-down"></i>
					<span>{stats[previewData.id] || 0}</span>
				</div>
				{previewData.src && (
					<a href={previewData.src} className="badge shine" title={langData["source"][lang]} target="_blank">
						<i className="fa-solid fa-code"></i>
					</a>
				)}
			</div>
			{previewData.description && (
				<div className="mod-description">
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
		</Popup>
	)
}
const Popup = ({onClose, children}) => {
	const [show, setShow] = React.useState(false)
	React.useEffect(_=>{
		setTimeout(_=>setShow(true), 0)
		const body = document.body
		const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
		const computedStyle = window.getComputedStyle(body)
		const originalPaddingRight = computedStyle.paddingRight
		const originalOverflow = body.style.overflow
		body.style.overflow = "hidden"
		body.style.paddingRight = `calc(${originalPaddingRight} + ${scrollBarWidth}px)`
		return () => {
			body.style.overflow = originalOverflow
			body.style.paddingRight = ""
		}
	}, [])
	const BeforeClose = _=>{
		if (show){
			setShow(false)
			setTimeout(_=>{ onClose && onClose() }, 300)
		}
	}
	return (
		<div className={`popup ${show ? "show" : ""}`}
			onClick={e=>e.target.classList.contains("popup") && BeforeClose()}
		>
			<div className="container popup-content">
				<i className="close fa-solid fa-circle-xmark" onClick={_=>BeforeClose()}></i>
				{children}
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
