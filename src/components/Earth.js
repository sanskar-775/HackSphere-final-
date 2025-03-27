"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Float32BufferAttribute } from "three";

// Function to dynamically load GLSL shaders
async function loadShader(path) {
  const response = await fetch(path);
  return await response.text();
}

export default function Earth() {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    if (rendererRef.current) return; // Prevent multiple instances

    let animationFrameId;

    async function init() {
      const vertexShader = await loadShader("/shaders/vertex.glsl");
      const fragmentShader = await loadShader("/shaders/fragment.glsl");
      const atmosphereVertexShader = await loadShader("/shaders/atmosphereVertex.glsl");
      const atmosphereFragmentShader = await loadShader("/shaders/atmosphereFragment.glsl");

      // Initialize Scene, Camera, Renderer
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = window.innerWidth < 768 ? 6 : 5; // Adjust for mobile view

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      
      if (canvasRef.current) {
        canvasRef.current.innerHTML = ""; // Clear existing canvas before appending
        canvasRef.current.appendChild(renderer.domElement);
      }

      rendererRef.current = renderer; // Store renderer reference

      // Load Textures
      const loader = new THREE.TextureLoader();
      const earthTexture = loader.load("/globe.jpg");

      // Create Earth Material
      const earthMaterial = new THREE.ShaderMaterial({
        uniforms: { globeTexture: { value: earthTexture } },
        vertexShader,
        fragmentShader,
      });

      // Create Atmosphere Material
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });

      // Create Sphere Geometry
      const geometry = new THREE.SphereGeometry(window.innerWidth < 768 ? 2 : 2.75, 100, 100);
      const earth = new THREE.Mesh(geometry, earthMaterial);

      const atmosphere = new THREE.Mesh(geometry, atmosphereMaterial);
      atmosphere.scale.set(1.1, 1.1, 1.1);
      scene.add(atmosphere);

      const group = new THREE.Group();
      group.add(earth);
      scene.add(group);

      // Add Stars
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3,
        sizeAttenuation: true,
      });

      const starVertices = [];
      for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = -Math.random() * 2000;
        starVertices.push(x, y, z);
      }

      starGeometry.setAttribute("position", new Float32BufferAttribute(starVertices, 3));
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      const clock = new THREE.Clock();
      const mouse = { x: undefined, y: undefined };

      function animate() {
        animationFrameId = requestAnimationFrame(animate);
        earth.rotation.y = clock.getElapsedTime() / 8;
        gsap.to(group.rotation, {
          x: mouse.y ? -mouse.y * 0.3 : 0,
          y: mouse.x ? mouse.x * 0.5 : 0,
          duration: 2,
        });
        renderer.render(scene, camera);
      }

      animate();
      animationFrameIdRef.current = animationFrameId;

      // Resize Handler
      const onResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener("resize", onResize);

      // Mouse move event listener
      const onMouseMove = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = (e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener("mousemove", onMouseMove);

      // Cleanup on unmount
      return () => {
        cancelAnimationFrame(animationFrameIdRef.current);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);

        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }

        if (canvasRef.current) {
          canvasRef.current.innerHTML = ""; // Ensure no duplicate canvas
        }
      };
    }

    init();
  }, []);

  return <div ref={canvasRef} className="w-full h-[50vh] md:h-[75vh]"></div>;
}
