import { useEffect, useRef } from "react";
import * as THREE from "three";

// Realistic textured globe with graticule, orbital paths, satellites and thermal points.
const MAP_URL = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const BUMP_URL = "https://unpkg.com/three-globe/example/img/earth-topology.png";

const SITES = [
  [22.34, 69.86, 1.0],
  [24.09, 82.67, 0.92],
  [21.19, 81.35, 0.74],
  [20.29, 85.82, 0.82],
  [26.85, 80.95, 0.6],
  [19.07, 72.87, 0.55],
  [13.08, 80.27, 0.5],
  [23.25, 77.41, 0.46],
  [28.61, 77.21, 0.42],
  [17.38, 78.48, 0.62],
  [22.57, 88.36, 0.52],
  [30.9, 75.85, 0.4],
  [-33.86, 151.21, 0.34],
  [-1.29, 36.82, 0.32],
  [51.5, -0.12, 0.26],
  [35.68, 139.69, 0.3],
  [-23.55, -46.63, 0.28],
  [40.71, -74.0, 0.22],
];

const RADIUS = 1.6;

function latLngToVec3(lat, lng, r) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.22, "rgba(255,255,255,0.72)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.18)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function EarthScene() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300);
    camera.position.set(0, 0.08, 7.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    host.appendChild(canvas);

    const disposables = [];

    // --- planet -------------------------------------------------------------
    const world = new THREE.Group();
    world.rotation.z = -0.22;
    world.rotation.x = 0.1;
    scene.add(world);

    const spin = new THREE.Group();
    world.add(spin);

    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x93a9cc,
      roughness: 0.94,
      metalness: 0.05,
      emissive: 0x0a1526,
      emissiveIntensity: 1,
    });
    const globeGeometry = new THREE.SphereGeometry(RADIUS, 96, 96);
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    spin.add(globe);
    disposables.push(globeGeometry, globeMaterial);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      MAP_URL,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        globeMaterial.map = texture;
        globeMaterial.needsUpdate = true;
        disposables.push(texture);
      },
      undefined,
      () => {},
    );
    loader.load(
      BUMP_URL,
      (texture) => {
        globeMaterial.bumpMap = texture;
        globeMaterial.bumpScale = 0.02;
        globeMaterial.needsUpdate = true;
        disposables.push(texture);
      },
      undefined,
      () => {},
    );

    // --- lighting -----------------------------------------------------------
    scene.add(new THREE.AmbientLight(0x2c4668, 1.15));
    const key = new THREE.DirectionalLight(0xffeed4, 2.3);
    key.position.set(-3.6, 2.3, 3.4);
    scene.add(key);
    const fill = new THREE.PointLight(0x2789e8, 16, 18);
    fill.position.set(3.6, -1.4, 2.6);
    scene.add(fill);
    const ember = new THREE.PointLight(0xe98545, 8, 14);
    ember.position.set(1.4, 2.8, -3.6);
    scene.add(ember);

    // --- atmosphere ---------------------------------------------------------
    const atmoMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uColor: { value: new THREE.Color(0x3f93e6) },
        uPower: { value: 2.7 },
        uStrength: { value: 0.95 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uPower;
        uniform float uStrength;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float rim = pow(1.0 - abs(dot(vNormal, vView)), uPower);
          gl_FragColor = vec4(uColor, rim * uStrength);
        }
      `,
    });
    const atmoGeometry = new THREE.SphereGeometry(RADIUS * 1.045, 64, 64);
    const atmo = new THREE.Mesh(atmoGeometry, atmoMaterial);
    world.add(atmo);
    disposables.push(atmoGeometry, atmoMaterial);

    // --- graticule ----------------------------------------------------------
    const gridPositions = [];
    for (let lat = -75; lat <= 75; lat += 15) {
      const rad = THREE.MathUtils.degToRad(lat);
      const ringRadius = RADIUS * 1.002 * Math.cos(rad);
      const y = RADIUS * 1.002 * Math.sin(rad);
      for (let i = 0; i < 120; i += 1) {
        const a1 = (i / 120) * Math.PI * 2;
        const a2 = ((i + 1) / 120) * Math.PI * 2;
        gridPositions.push(Math.cos(a1) * ringRadius, y, Math.sin(a1) * ringRadius);
        gridPositions.push(Math.cos(a2) * ringRadius, y, Math.sin(a2) * ringRadius);
      }
    }
    for (let lon = 0; lon < 360; lon += 15) {
      const theta = THREE.MathUtils.degToRad(lon);
      for (let i = 0; i < 90; i += 1) {
        const p1 = -Math.PI / 2 + (i / 90) * Math.PI;
        const p2 = -Math.PI / 2 + ((i + 1) / 90) * Math.PI;
        const r = RADIUS * 1.002;
        gridPositions.push(r * Math.cos(p1) * Math.cos(theta), r * Math.sin(p1), r * Math.cos(p1) * Math.sin(theta));
        gridPositions.push(r * Math.cos(p2) * Math.cos(theta), r * Math.sin(p2), r * Math.cos(p2) * Math.sin(theta));
      }
    }
    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x7ba0cc, transparent: true, opacity: 0.17 });
    spin.add(new THREE.LineSegments(gridGeometry, gridMaterial));
    disposables.push(gridGeometry, gridMaterial);

    // --- thermal observation points -----------------------------------------
    const glowTexture = makeGlowTexture();
    disposables.push(glowTexture);
    const thermalPoints = [];
    SITES.forEach(([lat, lng, intensity], index) => {
      const position = latLngToVec3(lat, lng, RADIUS * 1.005);
      const hot = intensity > 0.65;
      const dotColor = hot ? 0xff5c3d : 0xffa14d;
      const dotGeometry = new THREE.SphereGeometry(0.011 + intensity * 0.009, 12, 12);
      const dotMaterial = new THREE.MeshBasicMaterial({ color: dotColor });
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.copy(position);
      spin.add(dot);
      disposables.push(dotGeometry, dotMaterial);

      const spriteMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: dotColor,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.copy(position.clone().multiplyScalar(1.008));
      const base = 0.32 * (0.6 + intensity);
      sprite.scale.setScalar(base);
      spin.add(sprite);
      disposables.push(spriteMaterial);
      thermalPoints.push({ sprite, base, phase: index * 0.7 });
    });

    // --- orbits + satellites ------------------------------------------------
    const orbits = [];
    const addOrbit = (radius, tiltX, tiltZ, color, opacity, speed, satColor) => {
      const group = new THREE.Group();
      group.rotation.x = tiltX;
      group.rotation.z = tiltZ;

      const ringGeometry = new THREE.TorusGeometry(radius, 0.0032, 6, 220);
      const ringMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      group.add(new THREE.Mesh(ringGeometry, ringMaterial));
      disposables.push(ringGeometry, ringMaterial);

      const satGeometry = new THREE.SphereGeometry(0.021, 14, 14);
      const satMaterial = new THREE.MeshStandardMaterial({
        color: satColor,
        emissive: satColor,
        emissiveIntensity: 1.6,
        roughness: 0.4,
      });
      const sat = new THREE.Mesh(satGeometry, satMaterial);
      const satGlowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: satColor,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const satGlow = new THREE.Sprite(satGlowMaterial);
      satGlow.scale.setScalar(0.15);
      sat.add(satGlow);
      group.add(sat);
      world.add(group);
      disposables.push(satGeometry, satMaterial, satGlowMaterial);

      orbits.push({ sat, radius, speed, angle: Math.random() * Math.PI * 2 });
    };

    addOrbit(1.98, 0.92, 0.28, 0xe9dfc8, 0.3, 0.16, 0xe9dfc8);
    addOrbit(2.2, -0.6, -0.34, 0x2789e8, 0.22, -0.11, 0x7cc4ff);
    addOrbit(2.42, 0.28, 0.94, 0x3d5a80, 0.32, 0.07, 0xe98545);

    // --- star field ---------------------------------------------------------
    const starCount = 520;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const r = 9 + Math.random() * 16;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xdfe8f6,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    disposables.push(starGeometry, starMaterial);

    // --- loop ---------------------------------------------------------------
    const clock = new THREE.Clock();
    let frame = 0;

    const render = () => {
      const t = clock.getElapsedTime();
      spin.rotation.y = -0.65 + t * 0.05;

      orbits.forEach((orbit) => {
        orbit.angle += orbit.speed * 0.008;
        orbit.sat.position.set(Math.cos(orbit.angle) * orbit.radius, Math.sin(orbit.angle) * orbit.radius, 0);
      });

      thermalPoints.forEach((point) => {
        const pulse = 0.72 + Math.sin(t * 1.5 + point.phase) * 0.28;
        point.sprite.scale.setScalar(point.base * pulse * 1.5);
        point.sprite.material.opacity = 0.4 + pulse * 0.45;
      });

      starField.rotation.y = t * 0.004;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      disposables.forEach((item) => item.dispose?.());
      renderer.dispose();
      if (canvas.parentNode === host) host.removeChild(canvas);
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" aria-hidden="true" />;
}
