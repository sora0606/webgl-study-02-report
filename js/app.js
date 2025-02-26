import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import vertex from "./shader/vertex.glsl"
import fragment from "./shader/fragment.glsl"

import vertexSun from "./shaderSun/vertex.glsl"
import fragmentSun from "./shaderSun/fragment.glsl"

import vertexAround from "./shaderAround/vertex.glsl"
import fragmentAround from "./shaderAround/fragment.glsl"

import dat from "dat.gui";

export default class Sketch {
    constructor(opstions) {
        this.scene = new THREE.Scene();

        this.container = opstions.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor(0x000000, 1);

        this.container.appendChild(this.renderer.domElement);


        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.001,
            1000.0
        );
        this.camera.position.set(0.0, 0.0, 2.0);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.time = 0;

        this.isPlaying = true;

        this.addAround();
        this.addTexture();
        this.addObjects();
        this.resize();
        this.render();
        this.setupResize();
        // this.settings();
    }

    settings() {
        let that = this;
        this.settings = {
            progress: 0,
        };

        this.gui = new dat.GUI();
        this.gui.add(this.settings, "progress", 0.0, 1.0, 0.01);
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;

        this.camera.updateProjectionMatrix();
    }

    addAround() {
        this.materialAround = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.BackSide,
            uniforms: {
                time: { value: 0 },
                uPerlin: { value: null },
                resolution: { value: new THREE.Vector4() },
            },
            transparent: true,
            vertexShader: vertexAround,
            fragmentShader: fragmentAround,
        });

        this.geometryAround = new THREE.SphereGeometry(1.13, 64.0, 32.0);

        this.sunAround = new THREE.Mesh(this.geometryAround, this.materialAround);
        this.scene.add(this.sunAround);
    }

    addTexture() {
        this.scene1 = new THREE.Scene();
        this.cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBAFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipMapLinearFilter,
            encoding: THREE.sRGBEncoding,
        });

        this.cubeCamera1 = new THREE.CubeCamera(0.1, 10.0, this.cubeRenderTarget1);

        this.materialPerlin = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                resolution: { value: new THREE.Vector4() },
            },
            // wireframe: true,
            // transparent: true,
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.geometryPerlin = new THREE.SphereGeometry(1.0, 64.0, 32.0);

        this.perlin = new THREE.Mesh(this.geometryPerlin, this.materialPerlin);
        this.scene1.add(this.perlin);
    }

    addObjects() {
        this.materialSun = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: { value: 0 },
                uPerlin: { value: null },
                resolution: { value: new THREE.Vector4() },
            },
            vertexShader: vertexSun,
            fragmentShader: fragmentSun,
        });

        this.geometrySun = new THREE.SphereGeometry(1.0, 64.0, 32.0);

        this.sun = new THREE.Mesh(this.geometrySun, this.materialSun);
        this.scene.add(this.sun);
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.render();
        }
    }

    render() {
        if (!this.isPlaying) return;

        this.cubeCamera1.update(this.renderer, this.scene1);
        this.materialSun.uniforms.uPerlin.value = this.cubeRenderTarget1.texture;

        this.time += 0.05;
        this.materialSun.uniforms.time.value = this.time;
        this.materialPerlin.uniforms.time.value = this.time;

        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}

new Sketch({
    dom: document.getElementById("container")
});