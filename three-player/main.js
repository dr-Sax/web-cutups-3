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
	const iframe = document.createElement( 'iframe' );
	iframe.style.width = width;
	iframe.style.height = height;
	iframe.style.border = '0px';
	iframe.style.clipPath = clip_path;
	iframe.src = src
	iframe.allow = 'autoplay';
	div.appendChild( iframe );

	const object = new CSS3DObject( div );
	object.position.set( x, y, z );
	object.rotation.y = ry;
	object.rotation.x = rx
	object.rotation.x = rz
	
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
	//var src = 'https://en.wikipedia.org/wiki/Horror_film';
	//var src2 = 'https://www.youtube.com/embed/AGKcM1bXlXA?autoplay=1&mute=1';
	//group.add( new Element(0, 0, 240, 0, 0, 0, true, src2) );

	document.addEventListener('paste', function(e) {
		e.preventDefault(); // Prevent default copy behavior
	});

	//group.add( new Element( 'aHZdDmYFZN0', 0, 0, 240, Math.PI/2, 0, 0, false, src2) );
	//group.add( new Element( 'pQM0Q2eNoOg', 0, 0, 240, 0, Math.PI/2, 0, true, src2) );
	//group.add( new Element( 'aHZdDmYFZN0', 0, 0, 240, Math.PI/2, Math.PI/2, 0, false, src) );
	

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

	
	
	if (navigator.requestMIDIAccess){
		navigator.requestMIDIAccess().then(success, failure);
	}
	
	function success(midiAccess){
		midiAccess.addEventListener('statechange', updateDevices)
	
		const inputs = midiAccess.inputs;
		inputs.forEach((input) => {
			console.log(input);
			input.onmidimessage = handleInput;
		});
	
	}
	
	function handleInput(event){
		var val = event.data[2];
		
		group.children.forEach((element) => {
			var pre_val = element.position.x;
			console.log(val, pre_val);
			if (val > pre_val)
				element.rotation.x += .01;
			else
				element.rotation.x -= .01;
				
		});
	}
	
	function updateDevices(event){
		console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
		
	}
	
	function failure(){
		console.log('Could not connect MIDI');
	}

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