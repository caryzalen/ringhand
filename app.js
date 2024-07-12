// 初始化视频元素和Canvas
const videoElement = document.createElement('video');
videoElement.style.display = 'none'; // 隐藏视频元素，因为我们只需要捕捉视频帧
document.body.appendChild(videoElement);

const canvasElement = document.getElementById('outputCanvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvasElement });
renderer.setSize(window.innerWidth, window.innerHeight);

// 创建Three.js场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 环境光
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5); // 点光源
camera.add(pointLight);
scene.add(camera);

// 加载3D戒指模型
const loader = new THREE.GLTFLoader();
let ringMesh;
loader.load('ring.glb', function (gltf) {
    ringMesh = gltf.scene;
    scene.add(ringMesh);
});

// 设置MediaPipe手部追踪
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 处理手部追踪结果
hands.onResults((results) => {
    renderer.render(scene, camera); // 渲染Three.js场景
    if (results.multiHandLandmarks) {
        const landmarks = results.multiHandLandmarks[0];
        const indexFingerTip = landmarks[8]; // 索引指尖位置

        if (ringMesh) {
            ringMesh.position.x = (indexFingerTip.x - 0.5) * 2;
            ringMesh.position.y = -(indexFingerTip.y - 0.5) * 2;
            ringMesh.position.z = (indexFingerTip.z - 0.5) * 2;
        }
    }
});

// 初始化和开始视频捕捉
const cameraUtils = new CameraUtils(videoElement);
cameraUtils.start().then(() => {
    function animate() {
        hands.send({ image: videoElement });
        requestAnimationFrame(animate); // 循环调用animate以持续追踪
    }
    animate();
});
