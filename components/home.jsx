const Home = ({mods_count, setTab}) => {
	const [totalInstalls, setTotalInstalls] = React.useState(0)
	React.useEffect(() => {
		loadStatsPage("342255871", data=>setTotalInstalls(Math.max(0, data.length-1)))
	}, [])
	const features = [
		{ icon: "fa-feather", titleKey: "featureSmallSizeTitle", descKey: "featureSmallSizeDesc" },
		{ icon: "fa-compass-drafting", titleKey: "featureModernDesignTitle", descKey: "featureModernDesignDesc" },
		{ icon: "fa-cloud-arrow-down", titleKey: "featureCloudModsTitle", descKey: "featureCloudModsDesc" },
		{ icon: "fa-solid fa-arrow-down-short-wide", titleKey: "featureSortingTitle", descKey: "featureSortingDesc" },
		{ icon: "fa-layer-group", titleKey: "featureAllClientsTitle", descKey: "featureAllClientsDesc" },
		{ icon: "fa-shield-halved", titleKey: "featureOpenSourceTitle", descKey: "featureOpenSourceDesc" },
	]
	return (
		<React.Fragment>
			<div className="container card-page" align="center">
				<div className="row" style={{columnGap: "4rem", marginBottom: "auto", marginTop: "auto"}}>
					<div>
						<Reveal><h2>Web Modpack</h2></Reveal>
						<Reveal delay={1}><h3><LANG id="modpack_description"/></h3></Reveal>
						<div className="row" style={{fontSize: "14px", gap: "2rem"}}>
							<StatCard value={mods_count} label={<LANG id="mods_count"/>}
								delay={2} onClick={_=>setTab("mods")}
							/>
							<StatCard value={totalInstalls} label={<LANG id="installations"/>}
								delay={4} onClick={_=>setTab("other")}
							/>
						</div>
						<div className="row" style={{marginTop: "1.5rem", fontSize: "1.2em"}}>
							<Reveal delay={6}>
								<a className="button shine" href="https://github.com/SuperZombi/wot-modpack/releases/latest/download/Web.Modpack.exe">
									<i className="fa-solid fa-circle-down"></i>
									<span><LANG id="download_button"/></span>
								</a>
							</Reveal>
						</div>
					</div>
					<Reveal className="home_image_block">
						<img src="web/images/home_img.jpg" className="home_image" width="480" height="240" alt="Modpack preview" draggable={false}/>
					</Reveal>
				</div>
				<Reveal delay={10}><i className="fa-solid fa-angles-down fa-bounce"
					style={{fontSize: "2rem", marginBottom: "1rem", marginTop: "2rem"}}>
				</i></Reveal>
			</div>

			<ScrollParallaxCard
				className="container card-page"
				bg="web/images/bg1.png"
				fg="web/images/bg2.png"
			>
				<Reveal delay={2}><h1><LANG id="mods_card_title"/></h1></Reveal>
				<Reveal delay={4}><h3><LANG id="mods_card_description"/></h3></Reveal>
			</ScrollParallaxCard>

			<div className="container card-page" align="center">
				<Reveal delay={1}><h2><LANG id="featureModernDesignTitle"/></h2></Reveal>
				<Reveal delay={2}><BeforeAfterSlider
					before="web/images/before.jpg"
					after="web/images/after.jpg"
				/></Reveal>
			</div>

			<div className="container card-page" align="center">
				<div className="features-grid">
					{features.map((feature, idx) => (
						<Reveal className="feature" key={idx} delay={idx}>
							<i className={`fa-solid ${feature.icon}`}></i>
							<div className="feature-block">
								<span className="feature-header"><LANG id={feature.titleKey}/></span>
								<span><LANG id={feature.descKey}/></span>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</React.Fragment>
	)
}
const StatCard = ({ value, label, duration=2000, delay=0, style={}, className="", onClick=null }) => {
	const combinedStyle = {
		...style,
		...(onClick ? { cursor: "pointer" } : {})
	};
	return (
		<Reveal className={`container stat-card shine ${className}`}
			delay={delay} style={combinedStyle} onClick={onClick}
		>
			<Counter to={value} duration={duration}/>
			<span>{label}</span>
		</Reveal>
	)
}
const Counter = ({ to, duration }) => {
	const [value, setValue] = React.useState(0)
	React.useEffect(() => {
		const startTime = performance.now()
		function animate(now) {
			const progress = Math.min((now - startTime) / duration, 1)
			const current = Math.floor(progress * to)
			setValue(current)
			if (progress < 1) { requestAnimationFrame(animate) }
		}
		requestAnimationFrame(animate)
	}, [to, duration])
	return (
		<span>{value}</span>
	)
}
const Reveal = ({ children, className="", style={}, delay=0, ...props }) => {
	const [visible, setVisible] = React.useState(false)
	const blockRef = React.useRef(null)

	React.useEffect(() => {
		const node = blockRef.current
		if (!node) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true)
					observer.unobserve(entry.target)
				}
			},
			{ threshold: 0.2 }
		)
		observer.observe(node)
		return () => observer.disconnect()
	}, [])
	return (
		<div
			ref={blockRef}
			className={`${className} reveal ${visible ? "visible" : ""}`.trim()}
			style={{ ...style, "--reveal-delay": `${delay * 80}ms` }}
			{...props}
		>
			{children}
		</div>
	)
}
const BeforeAfterSlider = ({ before, after }) => {
	const [dividerPos, setDividerPos] = React.useState(50)
	const sliderRef = React.useRef(null)
	const isDragging = React.useRef(false)
	const frameRef = React.useRef(null)
	const nextClientXRef = React.useRef(null)
	
	const updateDividerPos = React.useCallback((clientX) => {
		const slider = sliderRef.current
		if (!slider) return

		const rect = slider.getBoundingClientRect()
		let offsetX = clientX - rect.left
		if (offsetX < 0) offsetX = 0
		if (offsetX > rect.width) offsetX = rect.width

		const percent = (offsetX / rect.width) * 100
		setDividerPos(percent)
	}, [])
	const flushDragPosition = React.useCallback(() => {
		frameRef.current = null
		if (nextClientXRef.current == null) return
		updateDividerPos(nextClientXRef.current)
	}, [updateDividerPos])
	const queueDragPosition = React.useCallback((clientX) => {
		nextClientXRef.current = clientX
		if (frameRef.current != null) return
		frameRef.current = requestAnimationFrame(flushDragPosition)
	}, [flushDragPosition])
	const startDrag = React.useCallback((e) => {
		isDragging.current = true;
		queueDragPosition(e.clientX)
	}, [queueDragPosition])
	const onDrag = React.useCallback((e) => {
		if (!isDragging.current) return;
		queueDragPosition(e.clientX)
	}, [queueDragPosition])
	const stopDrag = React.useCallback(() => {
		isDragging.current = false;
	}, [])
	React.useEffect(() => {
		window.addEventListener("pointermove", onDrag)
		window.addEventListener("pointerup", stopDrag)
		window.addEventListener("pointercancel", stopDrag)
		return () => {
			window.removeEventListener("pointermove", onDrag)
			window.removeEventListener("pointerup", stopDrag)
			window.removeEventListener("pointercancel", stopDrag)
			if (frameRef.current != null) {
				cancelAnimationFrame(frameRef.current)
			}
		}
	}, [onDrag, stopDrag])
	return (
		<div className="ba-slider" ref={sliderRef}>
			<img src={after} className="ba-image" draggable={false} />
			<div className="ba-holder" style={{ width: `${dividerPos}%` }}>
				<img src={before} className="ba-image" draggable={false} />
			</div>
			<div
				className="ba-divider"
				style={{ left: `${dividerPos}%` }}
				onPointerDown={startDrag}
			>
				<i className="fa-solid fa-arrows-left-right"></i>
			</div>
		</div>
	)
}
function ScrollParallaxCard({children, bg, fg, className=""}){
	const ref = React.useRef(null)
	const bgRef = React.useRef(null)
	const fgRef = React.useRef(null)
	React.useEffect(()=>{
		const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0
		function onScroll(){
			if(!ref.current) return
			const rect = ref.current.getBoundingClientRect()
			const windowHeight = window.innerHeight
			const progress = rect.top / windowHeight
			const bgMove = isMobile ? progress * -40 : progress * -100
			const fgMove = isMobile ? progress * -80 : progress * -200
			if(bgRef.current){
				bgRef.current.style.transform = `translateY(${bgMove}px) scale(1.1)`
			}
			if(fgRef.current){
				fgRef.current.style.transform = `translateY(${fgMove}px)`
			}
		}
		window.addEventListener("scroll", onScroll, { passive:true })
		onScroll()
		return ()=>window.removeEventListener("scroll", onScroll)
	},[])
	return (
		<div ref={ref} className={`${className} scroll-parallax-card`}>
			<img
				ref={bgRef}
				className="parallax-img parallax-bg"
				src={bg}
				draggable={false}
			/>
			<img
				ref={fgRef}
				className="parallax-img parallax-fg"
				src={fg}
				draggable={false}
			/>
			<div className="parallax-content">
				{children}
			</div>
		</div>
	)
}
