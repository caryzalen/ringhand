document.addEventListener('DOMContentLoaded', function() {
    // 建立Zappar的相機
    let camera = new Zappar.Camera();
    document.body.appendChild(camera.element);

    // 建立影像追蹤器
    let tracker = new Zappar.ImageTracker();
    tracker.load("https://yourserver.com/path/to/your-target.zpt");

    // 建立Three.js的場景
    let scene = new THREE.Scene();
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 建立光源
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // 加載3D模型
    let loader = new THREE.GLTFLoader();
    loader.load('assets/ring.glb', function(gltf) {
        scene.add(gltf.scene);
    });

    // 使相機根據追蹤器更新場景
    function animate() {
        requestAnimationFrame(animate);
        camera.updateFrame(renderer);
        renderer.render(scene, camera);
    }
    animate();
});
