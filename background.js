(() => {

    const canvas = document.getElementById("bg");
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;
    scene.add(camera);

    // subtle ambient
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    // directional light to simulate sun
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(10, 10, 10);
    scene.add(sun);

    // Earth base
    const earthRadius = 5;
    const loader = new THREE.TextureLoader();

    // Day texture (external resource)
    const earthTextureURL = "./earth_daymap.jpg";

    const earthGeometry = new THREE.SphereBufferGeometry(earthRadius, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
        map: loader.load(earthTextureURL),
        roughness: 1,
        metalness: 0
    });

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    // atmosphere glow: slightly larger sphere with additive blending
    const atmosphereGeometry = new THREE.SphereBufferGeometry(earthRadius * 1.03, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x88cfff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // starfield - point cloud
    function makeStars(count = 12000) {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // distribute in a sphere shell
            let r = 80 + Math.random() * 120;
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = 2 * Math.PI * Math.random();

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            size: 0.6,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });
        const points = new THREE.Points(g, material);
        points.rotation.x = Math.random() * Math.PI;
        points.rotation.y = Math.random() * Math.PI;
        return points;
    }

    const stars = makeStars(10000);
    scene.add(stars);

    // subtle tilt
    earthMesh.rotation.z = 0.4;

    function getFrustumCorners(camera, distance = 10) {
        const fov = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(fov / 2) * distance;
        const width = height * camera.aspect;

        return {
            left: -width / 4,
            right: width / 4,
            top: height / 1.7,
            bottom: -height / 1.7,
        };
    }

    // animate loop
    let last = performance.now();
    function animate() {
        const now = performance.now();
        const dt = (now - last) / 1000;
        last = now;

        

        // spin the earth slowly
        
        earthMesh.rotation.y += 0.08 * dt; // radians/sec
        atmosphereMesh.rotation.y += 0.09 * dt;

        // Distance from camera to Earth
        const distance = 10;

        // Compute world edges at that depth
        const edges = getFrustumCorners(camera, distance);

        // Offsets in world units (tweak until you like the position)
        const offsetX = 1.2;   // horizontal padding
        const offsetY = 1.2;   // vertical padding

        // Place Earth at bottom-left corner
        earthMesh.position.set(
            camera.position.x + edges.right + offsetX,
            camera.position.y + edges.bottom + offsetY,
            camera.position.z - distance
        );

        atmosphereMesh.position.copy(earthMesh.position);

    

        // very slow starfield drift
        stars.rotation.y += 0.00008;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // handle resize
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
})();