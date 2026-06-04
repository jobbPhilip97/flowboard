import {
  Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone
} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-hero-scene',
  standalone: true,
  template: `<canvas #canvas class="hero-canvas"></canvas>`,
  styles: [`
    .hero-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      opacity: 0.45;
    }
  `]
})
export class HeroSceneComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animationId = 0;
  private mouse = new THREE.Vector2(0, 0);
  private meshes: THREE.Mesh[] = [];
  private lines: THREE.LineSegments[] = [];

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.initScene());
  }

  private initScene() {
    const canvas = this.canvasRef.nativeElement;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 10);

    // Floating icosahedra
    const geoIco = new THREE.IcosahedronGeometry(0.6, 0);
    const matWire = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });

    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(geoIco, matWire.clone());
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 6
      );
      mesh.position.copy(pos);
      mesh.userData['speed'] = 0.003 + Math.random() * 0.005;
      mesh.userData['offset'] = Math.random() * Math.PI * 2;
      this.scene.add(mesh);
      this.meshes.push(mesh);
      positions.push(pos);
    }

    // Connecting lines between nearby nodes
    const lineGeo = new THREE.BufferGeometry();
    const lineVerts: number[] = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i].distanceTo(positions[j]) < 7) {
          lineVerts.push(positions[i].x, positions[i].y, positions[i].z);
          lineVerts.push(positions[j].x, positions[j].y, positions[j].z);
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVerts, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.2
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    this.scene.add(lines);

    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);

    this.animate();
  }

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  };

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    const t = performance.now() * 0.001;

    this.meshes.forEach(mesh => {
      const s = mesh.userData['speed'];
      const o = mesh.userData['offset'];
      mesh.rotation.x = t * s + o;
      mesh.rotation.y = t * s * 0.7 + o;
      mesh.position.y += Math.sin(t * s + o) * 0.002;
    });

    // Subtle parallax on camera
    this.camera.position.x += (this.mouse.x * 0.8 - this.camera.position.x) * 0.04;
    this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.04;

    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
