const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');

// Three.js场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvasElement});
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// 加载3D模型
const loader = new THREE.GLTFLoader();
let ringMesh;

loader.load('assets/ring.glb', function (gltf) {
    ringMesh = gltf.scene;
    scene.add(ringMesh);
    ringMesh.position.set(0, 0, 0);
    ringMesh.scale.set(0.1, 0.1, 0.1);
    camera.position.z = 5;
});

// MediaPipe手部追踪设置
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(results => {
    if (results.multiHandLandmarks && ringMesh) {
        const indexFingerTip = results.multiHandLandmarks[0][8]; // 中指尖端的索引
        const x = indexFingerTip.x * window.innerWidth;
        const y = window.innerHeight - indexFingerTip.y * window.innerHeight;

        ringMesh.position.x = (x - window.innerWidth / 2) * 0.005;
        ringMesh.position.y = -(y - window.innerHeight / 2) * 0.005;
    }

    renderer.render(scene, camera);
});

const cameraOptions = {
    video: {
        facingMode: "environment"
    }
};

// 开启摄像头并将其连接到MediaPipe
const mediaCamera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
}, cameraOptions);

mediaCamera.start();
