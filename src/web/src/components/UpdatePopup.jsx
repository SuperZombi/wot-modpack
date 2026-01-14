const Popup = ({onClose, children}) => {
	const [show, setShow] = React.useState(false)
	React.useEffect(_=>{
		setTimeout(_=>setShow(true), 0)
	}, [])
	const BeforeClose = _=>{
		if (show){
			setShow(false)
			setTimeout(_=>{
				onClose()
			}, 300)
		}
	}
	return (
		<div className={`popup ${show ? "show" : ""}`}
			onClick={e=>e.target.classList.contains("popup") && BeforeClose()}
		>
			<div className="popup_wraper">
				<img src="/images/close.svg" className="close hover" draggable={false}
					onClick={BeforeClose}
				/>
				{children}
			</div>
		</div>
	)
}

const UpdatePopup = ({
	onClose
}) => {
	return (
		<Popup onClose={onClose}>
			<div className="flex-center">
				<img src="/images/up-arrow.svg" height="64" draggable={false} style={{userSelect: "none"}}/>
				<h3 align="center"><LANG id="update_available"/></h3>
				<Button href="https://github.com/SuperZombi/wot-modpack/releases">
					<LANG id="download"/>
				</Button>
			</div>
		</Popup>
	)
}
