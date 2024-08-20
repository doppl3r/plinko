import { Loop } from './Loop';
import { Graphics } from './Graphics.js';
import { AssetLoader } from './loaders/AssetLoader.js';
import { LightFactory } from './factories/LightFactory.js';
import { Physics } from './Physics.js';

class Game {
  constructor() {
    
  }

  init(canvas) {
    // Initialize core game engine
    this.loop = new Loop();
    this.graphics = new Graphics(canvas);

    // Initialize components
    this.physics = new Physics();

    // Load public assets with callbacks (onLoad, onProgress, onError)
    this.assets = new AssetLoader(this.onLoad.bind(this), this.onProgress.bind(this));
    this.assets.load('./json/');
  }

  update(data) {
    // Update world physics
    this.physics.update(data.delta, data.alpha);
  }

  render(data) {
    this.physics.render(data.delta, data.alpha);

    // Render graphics
    this.graphics.render();
  }

  onLoad() {
    // Initialize entity manager
    this.physics.init();
    this.physics.setFrequency(30);
    this.physics.setScene(this.graphics.scene);

    
    setInterval(function() {
      // Add initial sphere
      this.addSingleSphere();
    }.bind(this), 750);

    // Create upside down pyramid
    var rows = 10;
    var spacing = 1.125;
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < row; col++) {
        // Create sphere entity

        if (row > 2) {
          var sphereEntity = this.physics.create({
            class: 'Sphere',
            position: { x: -(col * spacing) + (row * spacing / 2) - (spacing / 2), y: (-row * spacing) + (rows / 2), z: 0 },
            radius: 0.25,
            type: 'Fixed'
          });
          
          // Add entities to scene
          this.physics.add(sphereEntity);
        }
      }
    }

    // Update camera
    this.graphics.camera.position.set(0, 0, 15);

    // Add lights
    var light_hemisphere = LightFactory.create('ambient');
    light_hemisphere.position.set(0, 1, 0);
    this.graphics.scene.add(light_hemisphere);
    this.graphics.setShadows(true);

    // Add game loops
    this.loop.add(this.update.bind(this), 30); // Physics
    this.loop.add(this.render.bind(this), -1); // Render
    this.loop.start();
  }

  addSingleSphere() {
    // Create sphere entity
    var sphereEntity = this.physics.create({
      class: 'Sphere',
      color: '#ff00ff',
      position: { x: 0.125, y: 3, z: 0 },
      radius: 0.25
    });
    
    // Add entities to scene
    this.physics.add(sphereEntity);
  }

  onProgress(url, itemsLoaded, itemsTotal) {
    // Emit loader progress to global window object
    var percent = Math.ceil((itemsLoaded / itemsTotal) * 100);
    window.dispatchEvent(new CustomEvent('updateLoading', { detail: { url: url, itemsLoaded: itemsLoaded, itemsTotal: itemsTotal, percent: percent }}));
  }
}

export { Game };