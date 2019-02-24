// import { CubeReflectionMapping } from "./three";

// This is where
var scene, camera;
var hoverObject; 

function addLine(scene, v1, v2){
  
  var geometry = new THREE.Geometry();
  geometry.vertices.push(v1);
  geometry.vertices.push(v2);

  var line = new MeshLine();
  line.setGeometry( geometry, function( p ) { return 2; }); // makes width 2 * lineWidth

  var material = new MeshLineMaterial({ color:new THREE.Color(50.5,0,0) });
  var line = new THREE.Mesh( line.geometry , material );
  scene.add( line );
  return line;
}


// Add a rectangle with a position & dimensions to a scene & return the mesh object.
function addBox(scene, position, dims){
  let _x = position.x; let _y = position.y; let _z = position.z;
  let e = 0.2; // Render occlusion
  var geometry = new THREE.BoxGeometry( dims.x - e, dims.y - e , dims.z - e);

  var fill = new THREE.MeshBasicMaterial( {color: 0xcccccc} ); // Fixed color for now

	var base = new THREE.Mesh( geometry, fill );
  base.position.set(_x - e + dims.x / 2,_y - e  + dims.y / 2,_z - e + dims.z / 2);
	scene.add( base );	

  dims.x = Math.round(dims.x);
  dims.y = Math.round(dims.y);
  dims.z = Math.round(dims.z);

  var v1 = new THREE.Vector3( _x + dims.x, _y         , _z);
  var v2 = new THREE.Vector3( _x + dims.x, _y + dims.y, _z); 
  var v3 = new THREE.Vector3( _x + dims.x, _y         , _z + dims.z); 
  var v4 = new THREE.Vector3( _x + dims.x, _y + dims.y, _z + dims.z); 
  var v5 = new THREE.Vector3( _x         , _y + dims.y, _z); 
  var v6 = new THREE.Vector3( _x         , _y         , _z + dims.z);
  var v7 = new THREE.Vector3( _x         , _y + dims.y, _z + dims.z);

  addLine(scene,v1,v2);
  addLine(scene,v2,v5);
  addLine(scene,v1,v3);
  addLine(scene,v3,v4);
  addLine(scene,v2,v4);
  addLine(scene,v4,v7);
  addLine(scene,v3,v6);
  addLine(scene,v6,v7);
  addLine(scene,v7,v5);

  return base;
}

function addLines(scene){
  let numBlocks = 4;
  let variation = 25;
  let base_size = 30;
  let px = 0; let py = 0; let pz = 0;
  let bx = base_size; let by = base_size; let bz = base_size;
  
  var boxes = [];
  
  for (var i = 0; i < numBlocks; i++){
    let dx = bx + Math.random() * variation;
    let dy = by + Math.random() * variation;
    let dz = bz + Math.random() * variation;

    boxes.push(addBox(scene,{x: px, y: py, z: pz},{x: dx, y: dy, z: dz}));
    px += dx;
  }
  
  return boxes;
}


// This is where our hover effects come in.
function onDocumentMouseMove( event ) 
{
  var mouse = new THREE.Vector2();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( mouse, camera );
    if ( boxes ){
    var intersects = raycaster.intersectObjects( boxes );

    if(intersects.length > 0) {
      if (intersects[0].object != hoverObject){
        if (hoverObject){
          hoverObject.material.color.setHex( hoverObject.currentHex );
        }
        hoverObject = intersects[0].object; 
        hoverObject.currentHex = hoverObject.material.color.getHex();
        hoverObject.material.color.setHex( 0x00ff00 );
      }
    } else { 
      if (hoverObject){
        hoverObject.material.color.setHex( hoverObject.currentHex );
        hoverObject = undefined;
      }
    }
  }
}




window.addEventListener( 'mousemove', onDocumentMouseMove, false );

// Main function
document.addEventListener("DOMContentLoaded", function() {
      
  // 3D CONTEXT //

  // Create scene for 3D content.
  scene = new THREE.Scene(); // Default position: 0,0,0

  // Create shortcuts for window size.
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Create camera and move it a bit further. Make it to look to origin.

  // camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 400 );
  // scene.add( camera );
  camera = new THREE.PerspectiveCamera( 45, width / height, 1, 500 );
  camera.position.set( 200, 200, 200 );
  camera.lookAt( 0, 0, 0 );
  camera.lookAt(scene.position);

  // Create renderer.
  var renderer = new THREE.WebGLRenderer({antialias: false});
  renderer.setSize( width, height );
  renderer.autoClear = false;
  document.body.appendChild(renderer.domElement);

  // Define scene light. 
  // var light = new THREE.DirectionalLight( 0xffffff, 1 );
  // light.position.set( 50, 50, 50 );
  // scene.add(light);

  // And the box.
  boxes = addLines(scene);
  console.log(boxes)
  cube = boxes[0];
  // cube = addBox(scene,{x:0, y:0, z:0},{x:_size, y: _size, z:_size});


  // HUD CONTEXT 
  // Separate scene rendered on top, use a dynamic texture to render the HUD.
  // (In order to perform updates)

  // We will use 2D canvas element to render our HUD.  
  var hudCanvas = document.createElement('canvas');

  // Again, set dimensions to fit the screen.
  hudCanvas.width = width;
  hudCanvas.height = height;

  // Get 2D context and draw something supercool.
  var hudBitmap = hudCanvas.getContext('2d');
  hudBitmap.font = "Normal 40px Arial";
  hudBitmap.textAlign = 'center';
  hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
  hudBitmap.fillText('Initializing...', width / 2, height / 2);
    
  // Create the camera and set the viewport to match the screen dimensions.
  var cameraHUD = new THREE.OrthographicCamera(-width/2, width/2, height/2, -height/2, 0, 30 );

  // Create also a custom scene for HUD.
  sceneHUD = new THREE.Scene();

  // Create texture from rendered graphics.
  var hudTexture = new THREE.Texture(hudCanvas) 
  hudTexture.needsUpdate = true;

  // Create HUD material.
  var material = new THREE.MeshBasicMaterial( {map: hudTexture} );
  material.transparent = true;

  // Create plane to render the HUD. This plane fill the whole screen.
  var planeGeometry = new THREE.PlaneGeometry( width, height );
  var plane = new THREE.Mesh( planeGeometry, material );
  sceneHUD.add( plane );

  // Render loop
  function animate() {
    
    // Move cube.
    // cube.position.y += 0.1;

    // Update HUD graphics.
    hudBitmap.clearRect(0, 0, width, height);
    let _x = Math.round(cube.position.x);
    let _y = Math.round(cube.position.y);
    let _z = Math.round(cube.position.z);
    hudBitmap.fillText("[x:"+_x+", y:"+_y+", z:"+_z+"]" , width / 2, 7 * height / 8 );
    hudTexture.needsUpdate = true;
    
    renderer.render(scene, camera);
    renderer.render(sceneHUD, cameraHUD);
    //update(scene, camera);
    requestAnimationFrame(animate);
    
  };

  // Start animation.
  animate();



  });