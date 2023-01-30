import * as THREE from './CMapJS/Libs/three.module.js';
import Graph from './CMapJS/CMap/Graph.js';
import Renderer from './CMapJS/Rendering/Renderer.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10.0);
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-aspect/2, aspect/2, 1/2, -1/2, 0, 100)
camera.position.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
const material = new THREE.MeshBasicMaterial({color: 0xAAAAAA, wireframe: true});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);


window.addEventListener('resize', function() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -aspect/2; 
    camera.right = aspect/2; 
    camera.top = 1/2;
    camera.bottom = -1/2;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});


const graph = new Graph;
const graphPositions = graph.addAttribute(graph.vertex, "position");
graph.createEmbedding(graph.vertex);
const graphRenderer = new Renderer(graph);
graphRenderer.vertices.create();
graphRenderer.vertices.addTo(scene);
graphRenderer.edges.create({color: 0x00FFFF});
graphRenderer.edges.addTo(scene);
let previousVertex = null;

const light = new THREE.PointLight(0xFFFFFF, 1, 100);
light.position.set(5, 5, 5);
scene.add(light);

const spheres = [];
let selectedSphere = null;
const selectedSphereMaterial = new THREE.MeshLambertMaterial({color: 0x00FF00});
const sphereMaterial = new THREE.MeshLambertMaterial({color: 0xFFFF00});
const sphereGeometry = new THREE.SphereGeometry(0.01, 16, 16);


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('mousedown', onCanvasMouseDown, false);

function onCanvasMouseDown(event) {
    event.preventDefault();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);
    if(intersects.length == 0){    
        const target = new THREE.Vector3;
        raycaster.ray.at(1, target);
    
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(target);
        scene.add(sphere);

        spheres.push(sphere);

        let vd = graph.addVertex();
        graphPositions[graph.cell(graph.vertex, vd)] = target.clone();
        graphRenderer.vertices.update();
        if(previousVertex != null) {
            graph.connectVertices(vd, previousVertex);
            graphRenderer.edges.update()
        }
        previousVertex = vd;

    }
    else {
        selectedSphere = intersects[0].object;
        selectedSphere.material = selectedSphereMaterial;
        document.addEventListener('mousemove', onCanvasMouseMove, false);
        document.addEventListener('mouseup', onCanvasMouseUp, false);
    }
}


function onCanvasMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const target = new THREE.Vector3;
    raycaster.ray.at(1, target);
    selectedSphere.position.copy(target);
  }
  
  function onCanvasMouseUp(event) {
    event.preventDefault();
    document.removeEventListener('mousemove', onCanvasMouseMove, false);
    document.removeEventListener('mouseup', onCanvasMouseUp, false);
    selectedSphere.material = sphereMaterial;
    selectedSphere = null;
  }
  
function deCasteljau (samples) {
    // const samples = 50;
    const step  = 1 / samples;
    const points = spheres.map(s => s.position);
    const bezier = [];
    // console.log(points);

    for(let t = 0; t < samples; ++t){
        const pointsT = points.map(p => p.clone());
        for (let i = 1; i < points.length; i++) {
            for (let j = 0; j < points.length - i; j++) {
                // points[j].addScaledVectors()
                pointsT[j].x = (1 - t*step) * pointsT[j].x + t*step * pointsT[j + 1].x;
                pointsT[j].y = (1 - t*step) * pointsT[j].y + t*step * pointsT[j + 1].y;
            }
        }
        bezier.push(pointsT[0].clone());
    }

    console.log(bezier);
    for(let s = 0; s < samples; ++s){
        const sphereMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000});
        const sphereGeometry = new THREE.SphereGeometry(0.005, 16, 16);
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.copy(bezier[s]);
        scene.add(sphere);
    }
}

window.deCasteljau = deCasteljau;

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