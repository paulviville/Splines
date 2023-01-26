import * as THREE from './CMapJS/Libs/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xEE0000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10.0);
camera.position.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.PlaneGeometry(2 * window.innerWidth / window.innerHeight, 2);
const material = new THREE.MeshBasicMaterial({color: 0xFFEEEE});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);


window.addEventListener('resize', function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

function render()
{
	renderer.render(scene, camera);
}

function mainloop()
{
    render();
    requestAnimationFrame(mainloop);
}

mainloop();