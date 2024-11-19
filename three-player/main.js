import * as THREE from './three.js';
import { TrackballControls } from './TrackballControls.js';
import {CSS3DObject} from "./CSS3DRenderer.js";
import {CSS3DRenderer} from "./CSS3DRenderer.js";

let camera, scene, renderer;
let controls;
let selected_frames;
let collage_save = {};

var group

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
	camera.position.set( 0, 0, 100);
	selected_frames = [];

	scene = new THREE.Scene();

	renderer = new CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	group = new THREE.Group();

	document.addEventListener('paste', function(e) {
		e.preventDefault(); // Prevent default copy behavior
	});
	

	scene.add( group );

	window.addEventListener( 'resize', onWindowResize );

	window.addEventListener('keydown', onCtrlV);
	window.addEventListener('keydown', translate);
	window.addEventListener('keyup', stop_translate);

	// Block iframe events when dragging camera

	const blocker = document.getElementById( 'blocker' );
	blocker.style.display = 'none';



	let keysPressed = {};
	let translate_scale = 10;
	let rotate_scale = 1;

	async function translate(event){
		keysPressed[event.key] = true;
		// rotation:
		if (keysPressed['r'] && keysPressed['x'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(translate_scale, 0, 0, rotate_scale, 0, 0);
		}
		else if (keysPressed['r'] && keysPressed['x'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(-translate_scale, 0, 0, -rotate_scale, 0, 0);
		}
		else if (keysPressed['r'] && keysPressed['y'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, translate_scale, 0, 0, rotate_scale, 0);
		}
		else if (keysPressed['r'] && keysPressed['y'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, -translate_scale, 0, 0, -rotate_scale, 0);
		}
		else if (keysPressed['r'] && keysPressed['z'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, 0, translate_scale, 0, 0, rotate_scale);
		}
		else if (keysPressed['r'] && keysPressed['z'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, 0, -translate_scale, 0, 0, -rotate_scale);
		}

		// translation:
		else if (keysPressed['x'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(translate_scale, 0, 0, 0, 0, 0);
		}
		else if (keysPressed['x'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(-translate_scale, 0, 0, 0, 0, 0);
		}
		else if (keysPressed['y'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, translate_scale, 0, 0, 0, 0);
		}
		else if (keysPressed['y'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, -translate_scale, 0, 0, 0, 0);
		}

		// scaling:
		else if (keysPressed['s'] && keysPressed["ArrowRight"]){
			selected_frame_modifier(0, 0, translate_scale, 0, 0, 0);
		}
		else if (keysPressed['s'] && keysPressed["ArrowLeft"]){
			selected_frame_modifier(0, 0, -translate_scale, 0, 0, 0);
		} 
		
		else if (keysPressed['p']){
			
			
			for (var i = 0; i < group.children.length; i++){
				collage_save[i]['pos-rot'] = {
					"x": group.children[i].position.x,
					"y": group.children[i].position.y,
					"s": group.children[i].position.z,
					"s": group.children[i].position.z,
					"rx": group.children[i].rotation.x,
					"ry": group.children[i].rotation.y,
					"rz": group.children[i].rotation.y
				}
			}
			const jsonString = JSON.stringify(collage_save, null, 2);

            // Create a Blob
            const blob = new Blob([jsonString], { type: 'application/json' });

            // Create a download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'myData.json';
            
            // Trigger download
            link.click();

            // Clean up
            URL.revokeObjectURL(link.href);
		}
		
		

	}

	// helper function to translate
	function selected_frame_modifier(x, y, scale, rx, ry, rz){
		for (let i = 0; i < selected_frames.length; i++){
			let x0 = selected_frames[i].position.x;
			let y0 = selected_frames[i].position.y;
			let scale0 = selected_frames[i].position.z;
			let rx0 = selected_frames[i].rotation.x;
			let ry0 = selected_frames[i].rotation.y;
			let rz0 = selected_frames[i].rotation.z;
			
			selected_frames[i].position.set(x0 + x, y0 + y, scale0 + scale);
			selected_frames[i].rotation.set(rx0 + rx, ry0 + ry, rz0 + rz);
		}
	}

	async function stop_translate(event){
		delete keysPressed[event.key];
	}

	async function onCtrlV(event){
		if (event.ctrlKey && event.key == "v"){
			var jsonString = await navigator.clipboard.readText();
			var jsonObject = JSON.parse(jsonString);
			var width = jsonObject.width;
			var height = jsonObject.height;
			var src = jsonObject.src;
			var clip_path = jsonObject.clip_path;
			collage_save[group.children.length] = jsonObject
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
		var frame_bg_color = element.element.children[0].style.backgroundColor
		console.log(selected_frames);
		if (frame_bg_color == 'transparent'){
			element.element.children[0].style.backgroundColor = 'rgba(255, 255, 0, 0.5)';
			selected_frames.push(element);
			
		}
		else{
			element.element.children[0].style.backgroundColor = 'transparent';
			let element_idx = selected_frames.indexOf(element);
			console.log(element_idx);
			selected_frames.splice(element_idx, 1);
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
	//controls.update();
	renderer.render( scene, camera );

}


