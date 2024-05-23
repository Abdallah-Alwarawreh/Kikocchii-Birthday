import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TWEEN } from 'https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffbabb);
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );

const loader = new GLTFLoader();
const floader = new FontLoader();
var text;
var gift, giftTween;
loader.load('models/gift.glb', function (gltf) {
	gltf.scene.traverse( function( node ) {
		if (node.isMesh) {
			node.geometry.center();
		}
	});
	gift = gltf.scene;
	scene.add(gltf.scene);

	gift.scale.set(0.7, 0.7, 0.7)
	// camera.lookAt(gift.position);

	// Rotate gift on the y axis repeatedly 
	/*giftTween = new TWEEN.Tween(gift.rotation)
		.to({ y: Math.PI * 2 }, 5000)
		.repeat(Infinity)
		.start();
	*/
	
	floader.load(
		'fonts/Roboto_Regular.json',
		function ( font ) {
			const geometry = new TextGeometry('Open me!', {
				font: font,
				size: 0.7, 
				depth: 0.2,
				curveSegments: 12,
				bevelEnabled: true,
				bevelThickness: 0.01,
				bevelSize: 0.01,
				bevelOffset: 0,
				bevelSegments: 5
			});
			
			geometry.center();
			text = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
			text.position.set(0, 3, 0);
			text.rotation.set(0, 0, 0);
			text.scale.set(0, 0, 0)
			scene.add(text);
			text.parent = scene
	
			new TWEEN.Tween(text.scale)
				.to({ x: 1, y: 1, z: 1 }, 1000)
				.easing(TWEEN.Easing.Quadratic.Out)
				.start();
			// Bounce up and dowm
			const bounce = () => {
				new TWEEN.Tween(text.position)
					.to({ y: 4 }, 500)
					.easing(TWEEN.Easing.Quadratic.Out)
					.start()
					.onComplete(() => {
						new TWEEN.Tween(text.position)
							.to({ y: 3 }, 500)
							.easing(TWEEN.Easing.Quadratic.In)
							.start();
					})
			}
	
			setInterval(bounce, 1000)
			bounce()
	
			loadimages()
			document.getElementById("loading").style.opacity = 0;
			setTimeout(function(){
				document.getElementById("loading").style.display = "none";
			}, 1000)
	
			const listener = new THREE.AudioListener();
			camera.add( listener );
			
			// create a global audio source
			const sound = new THREE.Audio( listener );
	
			// load a sound and set it as the Audio object's buffer
			const audioLoader = new THREE.AudioLoader();
			audioLoader.load( 'music.mp3', function( buffer ) {
				sound.setBuffer( buffer );
				sound.setLoop( true );
				sound.setVolume( 0.5 );
				sound.play();
			});
	
			window.addEventListener('click', onPointerDown);
			render();
		},
		function ( xhr ) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
		}
	);
	
}, undefined, function (error) {
	console.error(error);
});


// #region Light
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 5 );
scene.add( light );
// #endregion

camera.position.z = 10;
camera.position.y = 7;

controls.enablePan = false;
controls.autoRotate = false;
controls.enableZoom = false;
controls.update();


// #region mouse
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let clicked = false;
function onPointerDown(event) {
	if (clicked) return;
	
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects(scene.children);
	if (intersects.length > 0){
		// remove any intersections if their parents names don't start with gift
		let filtered = intersects.filter((intersect) => {
			return intersect.object.parent.name.startsWith('gift');
		})

		// remove duplication
		let filteredUnique = [...new Set(filtered)];
		
		filteredUnique.forEach((intersect) => {
			clicked = true;

			scene.remove(text);

			new TWEEN.Tween(intersect.object.scale)
				.to({ x: 1.2, y: 1.2, z: 1.2 }, 100)
				.easing(TWEEN.Easing.Cubic.InOut)
				.start()
				.onComplete(() => {
					new TWEEN.Tween(intersect.object.scale)
						.to({ x: 1, y: 1, z: 1 }, 100)
						.easing(TWEEN.Easing.Cubic.InOut)
						.start()

					
					// keep scaling down then print done
					new TWEEN.Tween(intersect.object.scale)
						.to({ x: 0, y: 0, z: 0 }, 5000)
						.easing(TWEEN.Easing.Cubic.InOut)
						.start()
						.onComplete(() => {
							// quickly size up
							document.getElementById("WhiteScreen").style.opacity = 1;
							new TWEEN.Tween(intersect.object.scale)
								.to({ x: 10, y: 10, z: 10 }, 1500)
								.easing(TWEEN.Easing.Cubic.InOut) 
								.start()
								.onComplete(() => {
									// redierct to gift
									window.location.href = "https://abdallah-alwarawreh.github.io/Kikocchii-Birthday/imgs/final_kiko_collage.png";
								})
						})
				})
		})
	}
}
// #endregion

var ImgsGroup;
var imgs = []
var amount = 23;

for (let i = 1; i <= amount; i++)
	imgs.push("https://abdallah-alwarawreh.github.io/Kikocchii-Birthday/imgs/" + i + ".png")

function loadimages(){
	ImgsGroup = new THREE.Group();
	ImgsGroup.position.set(0, -2, 0)
	// load images from folder imgs/x.png
	const textureloader = new THREE.TextureLoader();
	for (let i = 0; i < imgs.length; i++){
		textureloader.load(imgs[i], function (texture) {
			const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
			
			// plane
			//const geometry = new THREE.PlaneGeometry(7, 7);
			const geometry = RoundedRectangle(7,7,2,5)
			const mesh = new THREE.Mesh(geometry, material);
			
			mesh.position.set(Math.cos(i * (Math.PI * 2 / imgs.length)) * 30, 0, Math.sin(i * (Math.PI * 2 / imgs.length)) * 30);
			mesh.rotation.set(0, 0, Math.PI * 2 / imgs.length);
			mesh.lookAt(gift.position);
			
			ImgsGroup.add(mesh);
			
		}, function ( xhr ) {
			console.log( (xhr.loaded / xhr.total * 100) + '% loaded ' + imgs[i]);
		}, function ( error ) {
			console.error(error);
		});
	}
	scene.add(ImgsGroup);
	console.log(ImgsGroup)

	const video = document.createElement('video');
	video.style.display = 'none';
	video.muted = true;
	video.autoplay = true;
	video.loop =  true;
	video.setAttribute('playsinline', true);

	const source = document.createElement('source');
	source.setAttribute('src', 'imgs/secret.mp4');

	video.appendChild(source);
	document.body.appendChild(video);
  video.play()
	const videoTexture01 = new THREE.VideoTexture(video);
	videoTexture01.minFilter = THREE.LinearFilter;
	videoTexture01.magFilter = THREE.LinearFilter;
	videoTexture01.format = THREE.RGBFormat;
	const material = new THREE.MeshBasicMaterial({ map: videoTexture01, transparent: true, side: THREE.DoubleSide });
			
	const geometry = RoundedRectangle(7,7,2,5)
	const mesh = new THREE.Mesh(geometry, material);
	
	mesh.position.set(0, -25, 0);
	mesh.rotation.set(0, 0, 0);
	mesh.lookAt(gift.position);
	scene.add(mesh)
}

var m = 5;
function render() {
	requestAnimationFrame(render);

	if (text) {
		text.lookAt(camera.position);
	}

	if (gift) gift.rotation.y += 0.05 * (clicked ? m : 1)
	if (clicked) m+= 0.01
	if (ImgsGroup) ImgsGroup.rotation.y -= 0.001; 
	
	renderer.render(scene, camera);
	TWEEN.update();
};




// non indexed BufferGeometry

function RoundedRectangle( w, h, r, s ) { // width, height, radius corner, smoothness  
	
	// helper const's
	const wi = w / 2 - r;		// inner width
	const hi = h / 2 - r;		// inner height
	const w2 = w / 2;			// half width
	const h2 = h / 2;			// half height
	const ul = r / w;			// u left
	const ur = ( w - r ) / w;	// u right
	const vl = r / h;			// v low
	const vh = ( h - r ) / h;	// v high
	
	let positions = [
	
		-wi, -h2, 0,  wi, -h2, 0,  wi, h2, 0,
		-wi, -h2, 0,  wi,  h2, 0, -wi, h2, 0,
		-w2, -hi, 0, -wi, -hi, 0, -wi, hi, 0,
		-w2, -hi, 0, -wi,  hi, 0, -w2, hi, 0,
		 wi, -hi, 0,  w2, -hi, 0,  w2, hi, 0,
		 wi, -hi, 0,  w2,  hi, 0,  wi, hi, 0
		
	];
	
	let uvs = [
		
		ul,  0, ur,  0, ur,  1,
		ul,  0, ur,  1, ul,  1,
		 0, vl, ul, vl, ul, vh,
		 0, vl, ul, vh,  0, vh,
		ur, vl,  1, vl,  1, vh,
		ur, vl,  1, vh,	ur, vh 
		
	];
	
	let phia = 0; 
	let phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;
	
	for ( let i = 0; i < s * 4; i ++ ) {
	
		phib = Math.PI * 2 * ( i + 1 ) / ( 4 * s );
		
		cosa = Math.cos( phia );
		sina = Math.sin( phia );
		cosb = Math.cos( phib );
		sinb = Math.sin( phib );
		
		xc = i < s || i >= 3 * s ? wi : - wi;
		yc = i < 2 * s ? hi : -hi;
	
		positions.push( xc, yc, 0, xc + r * cosa, yc + r * sina, 0,  xc + r * cosb, yc + r * sinb, 0 );
		
		uc =  i < s || i >= 3 * s ? ur : ul;
		vc = i < 2 * s ? vh : vl;
		
		uvs.push( uc, vc, uc + ul * cosa, vc + vl * sina, uc + ul * cosb, vc + vl * sinb );
		
		phia = phib;
			
	}
	
	const geometry = new THREE.BufferGeometry( );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
	geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
	
	return geometry;
	
}
