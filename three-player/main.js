import * as THREE from './three.js';
import { TrackballControls } from './TrackballControls.js';
import {CSS3DObject} from "./CSS3DRenderer.js";
import {CSS3DRenderer} from "./CSS3DRenderer.js";

let camera, scene, renderer;
let controls;

//https://www.youtube.com/watch?v=KRm_GICiPIQ

function Element(x, y, z, rx, ry, rz, width, height, src, clip_path) {

	const div = document.createElement( 'div' );
	div.style.width = width;
	div.style.height = height;

	const overlayDiv = document.createElement('div');
	overlayDiv.style.position = 'absolute';
	overlayDiv.style.top = '0';
	overlayDiv.style.left = '0';
	overlayDiv.style.width = '100%';
	overlayDiv.style.height = '100%';
	overlayDiv.style.backgroundColor = 'transparent';
	overlayDiv.style.pointerEvents = 'none';
	overlayDiv.style.zIndex = '1';
	overlayDiv.style.transition = 'background-color 0.3s';
	overlayDiv.style.clipPath = clip_path;
	div.appendChild(overlayDiv);

	const iframe = document.createElement( 'iframe' );
	iframe.style.width = width;
	iframe.style.height = height;
	iframe.style.border = '0px';
	iframe.style.clipPath = clip_path;

	if (src.includes('youtube')){
		// console.log(src);
		// console.log(src.split('='));
		iframe.src = src + '?autoplay=1'


	}
	else{
		iframe.src = src;
	}


	iframe.allow = 'autoplay';
	
	div.appendChild( iframe );
	

	const object = new CSS3DObject( div );
	object.position.set( x, y, z );
	object.rotation.y = ry;
	object.rotation.x = rx
	object.rotation.x = rz
	object.src = src;
	
	
	
	return object;

}

init();
animate();

function init() {

	const container = document.getElementById( 'container' );
	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
	camera.position.set( 500, 350, 750 );

	scene = new THREE.Scene();

	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	const group = new THREE.Group();

	document.addEventListener('paste', function(e) {
		e.preventDefault(); // Prevent default copy behavior
	});
	

	scene.add( group );

	controls = new TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 4;

	window.addEventListener( 'resize', onWindowResize );

	window.addEventListener('keydown', onCtrlV);

	// Block iframe events when dragging camera

	const blocker = document.getElementById( 'blocker' );
	blocker.style.display = 'none';

	controls.addEventListener( 'start', function () {

		blocker.style.display = '';

	} );

	controls.addEventListener( 'end', function () {

		blocker.style.display = 'none';

	} );

	async function onCtrlV(event){
		if (event.ctrlKey && event.key == "v"){
			var jsonString = await navigator.clipboard.readText();
			var jsonObject = JSON.parse(jsonString);
			var width = jsonObject.width;
			var height = jsonObject.height;
			var src = jsonObject.src;
			var clip_path = jsonObject.clip_path;
			group.add( new Element(0, 0, 0, 0, 0, 0, width, height, src, clip_path));
		}
	}

	document.addEventListener('keydown', handleNumberPress);

	// Function to handle number press
	function handleNumberPress(event) {
	// Check if the pressed key is a number
	if (isNumber(event.key)) {
		console.log(`You pressed the number: ${event.key}`);
		// Add your custom logic here
		performNumberPressActions(event.key);
	}
	}

	// Helper function to check if a string is a number
	function isNumber(str) {
	return !isNaN(str) && !isNaN(parseFloat(str));
	}

	// Example function to perform actions on number press
	function performNumberPressActions(number) {
		var element = group.children[number - 1];
		element.element.children[0].style.backgroundColor = 'rgba(255, 0, 0, 0.3)';


	}

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );

}


