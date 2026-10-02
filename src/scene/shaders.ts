// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT)
const noise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

const audioUniforms = /* glsl */ `
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uKick;
uniform float uIntro;
`

/** Shared displacement so tendrils, shards and sparks all breathe together. */
const displace = /* glsl */ `
vec3 displace(vec3 p) {
  float r = length(p);
  vec3 dir = p / max(r, 1e-4);
  float slow = snoise(p * 1.3 + vec3(0.0, uTime * 0.12, uTime * 0.05));
  float fine = snoise(p * 3.4 - uTime * 0.3);
  float d = slow * 0.12
          + fine * 0.04 * (0.4 + uTreble)
          + (slow * 0.5 + 0.5) * uBass * 0.25
          + uKick * 0.1;
  return (p + dir * d) * (0.82 + 0.18 * uIntro) * (1.0 + uBass * 0.035);
}
`

export const tendrilVertex = /* glsl */ `
${audioUniforms}
${noise}
${displace}
attribute float aSeed;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vCenter;
varying float vSeed;

void main() {
  vec4 world = modelMatrix * vec4(displace(position), 1.0);
  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  vSeed = aSeed;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const tendrilFragment = /* glsl */ `
${audioUniforms}
uniform vec3 uGlow;
uniform vec3 uWarm;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec3 vCenter;
varying float vSeed;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 toCore = vCenter - vWorld;
  float dist = length(toCore);

  // Light from the core: surfaces facing inward and close to the centre catch the blue
  float facing = max(dot(N, toCore / dist), 0.0);
  float near = smoothstep(1.1, 0.25, dist);
  float flicker = 0.7 + 0.3 * sin(uTime * 1.3 + vSeed * 37.0);
  float energy = (0.7 + uBass * 2.2 + uKick * 1.2) * uIntro;

  vec3 col = vec3(0.004, 0.005, 0.007);
  col += uGlow * facing * pow(near, 2.5) * energy * flicker * 2.2;

  // Very faint warm spill from the room, as in the reference — just enough to read the form
  vec3 K = normalize(vec3(-0.6, 0.65, 0.5));
  col += uWarm * pow(max(dot(N, K), 0.0), 4.0) * 0.03;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
  col += uWarm * fres * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
`

export const shardVertex = /* glsl */ `
${audioUniforms}
${noise}
${displace}
varying vec3 vNormal;
varying vec3 vView;

void main() {
  vec4 local = instanceMatrix * vec4(position, 1.0);
  vec4 world = modelMatrix * vec4(displace(local.xyz), 1.0);
  vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vView = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const shardFragment = /* glsl */ `
${audioUniforms}
uniform vec3 uGlow;
varying vec3 vNormal;
varying vec3 vView;

void main() {
  // Bright crystalline facets: hard edges catch more light
  float f = abs(dot(normalize(vNormal), vView));
  float edge = pow(1.0 - f, 2.0);
  vec3 col = uGlow * (0.5 + edge * 1.8) * (0.6 + uBass * 1.6 + uTreble * 0.6) * uIntro;
  col += vec3(0.8, 0.95, 1.0) * edge * uTreble * 0.8 * uIntro;
  gl_FragColor = vec4(col, 1.0);
}
`

export const sparkVertex = /* glsl */ `
${audioUniforms}
${noise}
${displace}
attribute float aSeed;
uniform float uPixelRatio;
varying float vAlpha;

void main() {
  vec3 p = position;
  // Each spark drifts on its own slow orbit
  float a = uTime * (0.1 + aSeed * 0.25);
  p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
  vec4 mv = modelViewMatrix * vec4(displace(p), 1.0);
  float twinkle = 0.5 + 0.5 * sin(uTime * (2.0 + aSeed * 5.0) + aSeed * 80.0);
  vAlpha = (0.25 + twinkle * 0.75) * (0.4 + uTreble * 1.2) * uIntro;
  gl_PointSize = (2.0 + aSeed * 4.0) * (1.0 + uTreble * 1.5) * uPixelRatio * (3.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

export const sparkFragment = /* glsl */ `
uniform vec3 uGlow;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(mix(uGlow, vec3(1.0), a * 0.6) * a * vAlpha, 1.0);
}
`

export const backgroundParticleVertex = /* glsl */ `
${audioUniforms}
${noise}
attribute float aSeed;
uniform float uPixelRatio;
varying float vAlpha;
varying float vDepth;

void main() {
  vec3 p = position;
  // Slow orbiting motion for depth effect
  float a = uTime * (0.05 + aSeed * 0.1) + aSeed * 100.0;
  p.xy += vec2(cos(a), sin(a)) * (0.3 + aSeed * 0.7);

  vDepth = p.z;
  vAlpha = 0.15 * (0.5 + aSeed * 0.5);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.0 + aSeed * 2.0) * uPixelRatio * (3.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

export const backgroundParticleFragment = /* glsl */ `
varying float vAlpha;
varying float vDepth;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  float depth = 0.5 + vDepth * 0.5;
  gl_FragColor = vec4(vec3(depth) * a * vAlpha, 1.0);
}
`
