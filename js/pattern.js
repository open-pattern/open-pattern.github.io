// import { CubeReflectionMapping } from "./three";

// Add a rectangle with a position & dimensions to a scene & return the mesh object.
function addBox(scene, position, dims){
  var geometry = new THREE.BoxGeometry( dims.x, dims.y , dims.z );
  var material = new THREE.MeshBasicMaterial( {color: 0xcccccc} ); // Fixed color for now
  var cube = new THREE.Mesh( geometry, material );
  cube.position.x = position.x 
  cube.position.y = position.y 
  cube.position.z = position.z
  scene.add( cube );

  return cube;
}

// This is where
var scene, camera;
var hoverObject; 

// This is where our hover effects come in.
function onDocumentMouseMove( event ) 
{
    var mouse = new THREE.Vector2();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );

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

  camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
  // scene.add( camera );
  // var camera = new THREE.PerspectiveCamera( 45, width / height, 1, 500 );
  camera.position.y = 100;
  camera.position.z = 100;
  camera.position.x = 100;
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
  _size = 50
  cube = addBox(scene,{x:0, y:0, z:0},{x:_size, y: _size, z:_size});


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
    cube.position.y += 0.1;

    // Update HUD graphics.
    hudBitmap.clearRect(0, 0, width, height);
    _x = Math.round(cube.position.x);
    _y = Math.round(cube.position.y);
    _z = Math.round(cube.position.z);
    hudBitmap.fillText("[x:"+_x+", y:"+_y+", z:"+_z+"]" , width / 2, height / 2);
    hudTexture.needsUpdate = true;
    
    renderer.render(scene, camera);
    renderer.render(sceneHUD, cameraHUD);
    //update(scene, camera);
    requestAnimationFrame(animate);
    
  };

  // Start animation.
  animate();



  });