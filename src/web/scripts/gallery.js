async function Gallery(root){
	if (root.getAttribute("init")){return}
	root.setAttribute("init", true)
	let images = getImages();
	let i = 0;
	while (true) {
		let url = images[i];
		let image = await fetchURL(url);
		if (image) {
			createImage(root, image);
			await sleep(100);
			root.classList.add("show");
			await sleep(10000);
			root.classList.remove("show");
			await sleep(3000);
		}
		i = (i + 1) % images.length;
	}
}

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
function createImage(parent, image){
	let img = parent.querySelector("img")
	if (!img){
		img = document.createElement("img")
		parent.appendChild(img)	
	}
	img.src = image
}
async function fetchURL(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const blob = await response.blob();
		const objectURL = URL.createObjectURL(blob);
		return objectURL;
	} catch (error) {
		console.error(url);
	}
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
