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
	const { langData } = useApp()
	return (
		<Popup onClose={onClose} closeButton={false} closeOnOutsideClick={false}>
			{({ close }) => (
				<div className="flex-center data-collection">
					<h3><LANG id="data_collection_title"/></h3>
					<p><LANG id="data_collection_description"/></p>
					<ul>
						{langData["data_collection_list"].split(",").map((item, index) => (
							<li key={index}>{item.trim()}</li>
						))}
					</ul>
					<div style={{marginTop: "1em"}}>
						<Button onClick={close}><LANG id="accept"/></Button>
					</div>
				</div>
			)}
		</Popup>
	)
}
