const Gallery = () => {
	const [currentImage, setCurrentImage] = React.useState(null)
	const [visible, setVisible] = React.useState(false)

	function getImages() {
		let arr = [
			"https://eu-wotp.wgcdn.co/dcont/fb/image/leopard-1-wallpaper-1920x1280.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/t95-1920x1280.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/lowe-wallpaper-1920x1280.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/sherman-wallpaper-1920x1280.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/m4a3e8-fury-1224-1920x900.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/stb-1-wallpaper-1920x1280.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/1920x900_ujQDtiL.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/strv-k-banner-1920x900.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/m54_renegade_and_vk_75_1920x900.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/autumn-marathon-wallpaper-1920x1080.jpg",
			"https://eu-wotp.wgcdn.co/dcont/fb/image/ukrainian-independence-day-wallpaper-1920x1080.jpg",
		]
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr
	}
	async function fetchURL(url) {
		try {
			const response = await fetch(url)
			if (!response.ok) throw new Error(`HTTP error! ${response.status}`)
			const blob = await response.blob()
			return URL.createObjectURL(blob)
		} catch (err) {
			console.error(url)
		}
	}
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	React.useEffect(() => {
		let running = true;
		(async () => {
			let images = getImages()
			let i = 0;
			while (running) {
				let url = images[i]
				let image = await fetchURL(url)
				if (image) {
					setCurrentImage(image)
					setVisible(true)
					await sleep(10000)
					setVisible(false)
					await sleep(3000)
				}
				i = (i + 1) % images.length;
			}
		})()
		return () => running = false
	}, [])

	return (
		<div className={`gallery ${visible ? "show" : ""}`}>
			<img src={currentImage} draggable={false} />
		</div>
	)
}
