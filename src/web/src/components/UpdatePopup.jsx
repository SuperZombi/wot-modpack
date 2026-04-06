const Popup = ({
	onClose, children,
	closeButton=true,
	closeOnOutsideClick=true
}) => {
	const [show, setShow] = React.useState(false)
	React.useEffect(_=>{
		setTimeout(_=>setShow(true), 0)
	}, [])
	const BeforeClose = _=>{
		if (show){
			setShow(false)
			setTimeout(_=>{ onClose && onClose() }, 300)
		}
	}
	return (
		<div className={`popup ${show ? "show" : ""}`}
			onClick={closeOnOutsideClick ? (
				e=>e.target.classList.contains("popup") && BeforeClose()
			) : null}
		>
			<div className="popup_wraper">
				{closeButton && (
					<img src="/images/close.svg" className="close hover" draggable={false}
						onClick={BeforeClose}
					/>
				)}
				{typeof children === "function" ? children({ close: BeforeClose }) : children}
			</div>
		</div>
	)
}

const UpdatePopup = ({onClose}) => {
	return (
		<Popup onClose={onClose}>
			<div className="flex-center">
				<img src="/images/up-arrow.svg" height="64" draggable={false} style={{userSelect: "none"}}/>
				<h3><LANG id="update_available"/></h3>
				<Button href="https://github.com/SuperZombi/wot-modpack/releases">
					<LANG id="download"/>
				</Button>
			</div>
		</Popup>
	)
}
const DataCollectionPopup = ({onClose}) => {
	return (
		<Popup onClose={onClose} closeButton={false} closeOnOutsideClick={false}>
			{({ close }) => (
				<div className="flex-center">
					<h3><LANG id="data_collection_title"/></h3>
					<p><LANG id="data_collection_description"/></p>
					<ul style={{display: "flex", flexDirection: "column", gap: "0.5em", textAlign: "left", margin: 0}}>
						<li>List of selected mods</li>
						<li>Modpack version</li>
						<li>Game version</li>
						<li>Game type</li>
						<li>Game language</li>
						<li>Game realm</li>
						<li>Game branch</li>
					</ul>
					<div style={{marginTop: "1em"}}>
						<Button onClick={close}><LANG id="accept"/></Button>
					</div>
				</div>
			)}
		</Popup>
	)
}
