// 初始化 MediaPipe Hands 和相机工具
const videoElement = document.createElement('video');
videoElement.style.display = 'none'; // 隐藏视频元素
document.body.appendChild(videoElement);

const canvasElement = document.getElementById('outputCanvas');
const canvasCtx = canvasElement.getContext('2d');

// 初始化Three.js渲染器
const renderer = new THREE.WebGLRenderer({ canvas: canvasElement });
renderer.setSize(window.innerWidth, window.innerHeight);

// 设置相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 创建场景
const scene = new THREE.Scene();

// 添加一些基础光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.5);
camera.add(pointLight);
scene.add(camera);

// 加载3D模型
const loader = new THREE.GLTFLoader();
let ringMesh;
loader.load('path_to_3D_ring_model.glb', function (gltf) {
    ringMesh = gltf.scene;
    scene.add(ringMesh);
    ringMesh.position.set(0, 0, 0); // 初始位置
});

// 配置 MediaPipe 手部追踪
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults((results) => {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks && ringMesh) {
        for (const landmarks of results.multiHandLandmarks) {
            const indexFingerTip = landmarks[8]; // 索引指尖的位置
            // 转换坐标以适配 Three.js
            const x = (indexFingerTip.x - 0.5) * 2;
            const y = (indexFingerTip.y - 0.5) * -2;
            const z = (indexFingerTip.z - 0.5) * 2;
            ringMesh.position.set(x, y, z);
        }
    }
    canvasCtx.restore();
    renderer.render(scene, camera);
});

const cameraUtils = new CameraUtils(videoElement);
cameraUtils.start().then(() => {
    function onFrame() {
        hands.send({ image: videoElement });
        requestAnimationFrame(onFrame);
    }
    onFrame();
});
