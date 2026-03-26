const Home = ({mods_count, mods_images, setTab}) => {
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
					<Reveal>
						<h2>Web Modpack</h2>
						<h3><LANG id="modpack_description"/></h3>
						<div className="row" style={{fontSize: "14px", gap: "2rem"}}>
							<StatCard value={mods_count} label={<LANG id="mods_count"/>} delay={2} onClick={_=>setTab("mods")}/>
							<StatCard value={totalInstalls} label={<LANG id="installations"/>} delay={4}/>
						</div>
						<div className="row" style={{marginTop: "1.5rem", fontSize: "1.2em"}}>
							<Reveal delay={6}>
								<a className="button shine" href="https://wgmods.net/7156/" target="_blank">
									<i className="fa-solid fa-globe"></i>
									<span>WGmods</span>
								</a>
							</Reveal>
							<Reveal delay={8}>
								<a className="button shine" href="https://github.com/SuperZombi/wot-modpack" target="_blank">
									<i className="fa-brands fa-github"></i>
									<span>GitHub</span>
								</a>
							</Reveal>
							<Reveal delay={10}>
								<a className="button shine" href="https://github.com/SuperZombi/wot-modpack/releases/latest/download/Web.Modpack.exe">
									<i className="fa-solid fa-circle-down"></i>
									<span><LANG id="download_button"/></span>
								</a>
							</Reveal>
						</div>
					</Reveal>
					<Reveal className="home_image_block">
						<img src="web/images/home_img.jpg" className="home_image" width="480" height="240" alt="Modpack preview" draggable={false}/>
					</Reveal>
				</div>
				<i className="fa-solid fa-angles-down fa-bounce"
					style={{fontSize: "2rem", marginBottom: "1rem", marginTop: "2rem"}}>
				</i>
			</div>

			<div className="container card-page" align="center">
				<ParallaxBackground mods_images={mods_images} />
				<StatCard value={mods_count} label={<LANG id="mods_count"/>} delay={1}
					className="mobile-font-size"
					style={{boxShadow: "0 0 200px rgba(100, 100, 255, 0.5)"}}
					onClick={_=>setTab("mods")}
				/>
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
const ParallaxBackground = ({ mods_images }) => {
	const LAYERS = 3
	const ITEMS_PER_LAYER = 10

	const shuffled = [...mods_images].sort(() => Math.random() - 0.5)
	const layers = Array.from({ length: LAYERS }, (_, i) =>
		shuffled.slice(i * ITEMS_PER_LAYER, (i + 1) * ITEMS_PER_LAYER)
	)
	const MAX_ROTATE = 30
	const MIN_SCALE = 0.8
	const MAX_SCALE = 1.4
	const POSITION_SPREAD = 140
	const POSITION_OFFSET = 20
	const TRANSLATE = 40

	const randomStyle = () => ({
		top: Math.random() * POSITION_SPREAD - POSITION_OFFSET + "%",
		left: Math.random() * POSITION_SPREAD - POSITION_OFFSET + "%",
		transform: `
			rotate(${Math.random() * MAX_ROTATE * 2 - MAX_ROTATE}deg)
			scale(${MIN_SCALE + Math.random() * (MAX_SCALE - MIN_SCALE)})
			translate(${Math.random() * TRANSLATE * 2 - TRANSLATE}px, ${Math.random() * TRANSLATE * 2 - TRANSLATE}px)
		`
	})
	return (
		<div className="parallax-bg">
			{layers.map((layer, layerIndex) => (
				<div
					key={layerIndex}
					className="parallax-layer"
					style={{
						animationDuration: `${60 + layerIndex * 20}s`
					}}
				>
					{layer.map((img, i) => (
						<img
							key={i}
							src={img}
							className="parallax-item"
							loading="lazy"
							style={randomStyle()}
						/>
					))}
				</div>
			))}
		</div>
	)
}
