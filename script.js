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
}, undefined, function (error) {
	console.error(error);
});

const floader = new FontLoader();
var text;
const font = floader.load(
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

		window.addEventListener('click', onPointerDown);
		render();
	},
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	}
);

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
									window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
								})
						})
				})
		})
	}
}
// #endregion

var ImgsGroup;
var imgs = [
    "https://media.discordapp.net/attachments/1080351232570433567/1239615693238833213/Appicons_20211230143951.png?ex=66498054&is=66482ed4&hm=bd1595f26b5af6904444ce1cec5466f00b908b8e878c4ad4e2fe21a2b412eb2c&",
    "https://media.discordapp.net/attachments/1080351232570433567/1241178579484803182/TotemOfAnni_20240517190014.png?ex=66494121&is=6647efa1&hm=fb52ace20734261f3e2919e7352ea5dd89ffdcb5c8711b36e70d3562b3a6fc63&",
    "https://media.discordapp.net/attachments/960756578838011904/1234289282936737842/SampleEmotes_20240428184353.png?ex=66493d79&is=6647ebf9&hm=2fbf8684bb314bac97673baa2419db6aa581ea565121b3cb268ecb7d687ba370&",
    "https://media.discordapp.net/attachments/1080351232570433567/1224522976712724481/PFPS_20240401173424.png?ex=66494e64&is=6647fce4&hm=f3ef3e96921b56fbe74e2f3735cf5be62f08556edc28cb6147ee3993b9336de7&",
    "https://media.discordapp.net/attachments/1080351232570433567/1221726586433306644/Untitled554_20240325021356.png?ex=6649ae0c&is=66485c8c&hm=f610289704be286e2bc29ae23b818b8c5a663dc7cebb37ecc83bf50037586650&",
    "https://media.discordapp.net/attachments/960756578838011904/1210821497170432011/Sketches_20240223232457.png?ex=66498ee4&is=66483d64&hm=448a7ca707726af8c50185fafd3345e88c5c73cba302952a2fb0acdb501e2929&",
    "https://media.discordapp.net/attachments/1080351232570433567/1208606922136227890/PFPS_20240217203716.png?ex=66496969&is=664817e9&hm=a2ed8f0c00648653392a465b128ff5399cb58e6f955dd4e36da31fb7880bd0a5&",
    "https://media.discordapp.net/attachments/960756578838011904/1192583755680989326/Kikocord3_20240104153939.png?ex=6649c96c&is=664877ec&hm=07dfe2af733c1aa676f631b0e05100a3df5afdfd848b2b079ce43a11ec80c411&",
    "https://media.discordapp.net/attachments/960756578838011904/1192257876773834772/Kikocord3_20240103180521.png?ex=664942ac&is=6647f12c&hm=fbea4e40d37cab38570ab4de850f7ead3718abf1f8862ea9fb1c2e4c5addec11&",
];

function loadimages(){
	ImgsGroup = new THREE.Group();
	ImgsGroup.position.set(0, -2, 0)
	// load images from folder imgs/x.png
	// make the images go around the gift in a circle with radius of 6
	// make the images rotate in a circle with radius of 6
	const textureloader = new THREE.TextureLoader();
	for (let i = 0; i < imgs.length; i++){
		textureloader.load(imgs[i], function (texture) {
			const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
			
			// plane
			//const geometry = new THREE.PlaneGeometry(7, 7);
			const geometry = RoundedRectangle(7,7,2,5)
			const mesh = new THREE.Mesh(geometry, material);
			
			mesh.position.set(Math.cos(i * (Math.PI * 2 / imgs.length)) * 25, 0, Math.sin(i * (Math.PI * 2 / imgs.length)) * 25);
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