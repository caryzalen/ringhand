// 导入必要的库和模块
import * as THREE from 'three';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// 创建 Three.js 场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new GLTFLoader();
let ringMesh;

// 加载戒指模型
loader.load('path/to/your/ring.gltf', function(gltf) {
    ringMesh = gltf.scene;
    scene.add(ringMesh);
    ringMesh.scale.set(0.01, 0.01, 0.01); // 根据需要调整戒指大小
});

// MediaPipe 手部模型设置
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 手部追踪结果处理
hands.onResults(onResults);

// 初始化摄像头
const videoElement = document.createElement('video');
const cameraUtils = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
cameraUtils.start();

// 处理追踪数据并更新戒指位置
function onResults(results) {
    if (results.multiHandLandmarks) {
        const landmarks = results.multiHandLandmarks[0];
        const ringFingerTip = landmarks[12]; // 使用无名指的尖端作为参考
        const x = ringFingerTip.x - 0.5;
        const y = -(ringFingerTip.y - 0.5);
        if (ringMesh) {
            ringMesh.position.set(x * 10, y * 10, -ringFingerTip.z * 10 + camera.position.z);
        }
    }
}

// 动画循环，渲染场景
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
