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
					<div onClick={BeforeClose} className="close hover">
						<i className="fa-regular fa-circle-xmark"></i>
					</div>
				)}
				{typeof children === "function" ? children({ close: BeforeClose }) : children}
			</div>
		</div>
	)
}
