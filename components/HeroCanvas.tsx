'use client';
import { useEffect, useRef } from 'react';

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `uniform float uT;varying vec3 vN;varying vec3 vV;varying float vD;${NOISE}
void main(){
  float d=snoise(normal*1.2+vec3(uT*.25))*.24+snoise(normal*3.-uT*.15)*.05;
  vD=d;vN=normalize(normalMatrix*normal);
  vec4 mv=modelViewMatrix*vec4(position+normal*d,1.);
  vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;
}`;

const FRAG = /* glsl */ `uniform vec3 uA;uniform vec3 uB;uniform float uT;varying vec3 vN;varying vec3 vV;varying float vD;
void main(){
  float f=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),2.2);
  vec3 c=mix(vec3(.02,.02,.035),mix(uA,uB,smoothstep(-.2,.25,vD)),f);
  c+=.55*pow(f,6.);
  c+=uA*(sin(vD*40.+uT)*.5+.5)*.05;
  gl_FragColor=vec4(c,1.);
}`;

/** Shader blob + particle shell. Falls back to a CSS orb without WebGL or with reduced motion. */
export function HeroCanvas({ onFallback }: { onFallback: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef(onFallback);
  fallbackRef.current = onFallback;

  useEffect(() => {
    const onFallback = () => fallbackRef.current();
    const canvas = ref.current!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return onFallback();
    let disposed = false;
    let cleanup = () => {};

    import('three').then((THREE) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return onFallback();
      }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.z = 7;

      const uniforms = { uT: { value: 0 }, uA: { value: new THREE.Color('#5e6ad2') }, uB: { value: new THREE.Color('#c084fc') } };
      const blobGeo = new THREE.IcosahedronGeometry(1.5, 48);
      const blobMat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG });
      const blob = new THREE.Mesh(blobGeo, blobMat);

      const n = 1400, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const r = 2.4 + Math.random() * 2.6, t = Math.random() * Math.PI * 2, u = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(u) * Math.cos(t), r * Math.sin(u) * Math.sin(t), r * Math.cos(u)], i * 3);
      }
      const ptsGeo = new THREE.BufferGeometry();
      ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const ptsMat = new THREE.PointsMaterial({ size: 0.02, color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
      const pts = new THREE.Points(ptsGeo, ptsMat);

      const group = new THREE.Group();
      group.add(blob, pts);
      scene.add(group);

      const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const wide = w > 900;
        group.position.set(wide ? 1.9 : 0, wide ? 0 : 0.75, 0);
        group.scale.setScalar(wide ? 1 : 0.62);
      };
      resize();

      const m = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMove = (e: PointerEvent) => {
        m.tx = e.clientX / innerWidth - 0.5;
        m.ty = e.clientY / innerHeight - 0.5;
      };

      let running = true, t = 0, last = performance.now(), frame = 0;
      const loop = (now: number) => {
        if (!running || disposed) return;
        t += Math.min((now - last) / 1000, 0.05);
        last = now;
        m.x += (m.tx - m.x) * 0.05;
        m.y += (m.ty - m.y) * 0.05;
        uniforms.uT.value = t;
        blob.rotation.set(m.y * 0.5, t * 0.12 + m.x * 0.8, 0);
        pts.rotation.set(m.y * 0.2, t * 0.03 + m.x * 0.3, 0);
        blob.scale.setScalar(1 - Math.min(scrollY / innerHeight, 1) * 0.3);
        renderer.render(scene, camera);
        frame = requestAnimationFrame(loop);
      };
      // Pause rendering while the hero is off screen.
      const io = new IntersectionObserver(([e]) => {
        running = e.isIntersecting;
        cancelAnimationFrame(frame);
        if (running) {
          last = performance.now();
          frame = requestAnimationFrame(loop);
        }
      });
      io.observe(canvas);
      addEventListener('resize', resize);
      addEventListener('pointermove', onMove);

      cleanup = () => {
        cancelAnimationFrame(frame);
        io.disconnect();
        removeEventListener('resize', resize);
        removeEventListener('pointermove', onMove);
        blobGeo.dispose(); blobMat.dispose(); ptsGeo.dispose(); ptsMat.dispose();
        renderer.dispose();
      };
    }).catch(onFallback);

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas id="gl" ref={ref} aria-hidden="true" />;
}
