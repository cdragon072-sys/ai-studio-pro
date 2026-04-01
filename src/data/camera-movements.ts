import type { CameraMovement } from '../types';

// ========================================
// L1 基础运镜 — 16 种基础运镜手法
// ========================================
export const L1_MOVEMENTS: CameraMovement[] = [
  { id: 'push-in', name: '推', nameEN: 'Push In', description: '镜头向前推进，强调主体', category: 'push', level: 1, prompt: 'camera pushes in slowly' },
  { id: 'pull-out', name: '拉', nameEN: 'Pull Out', description: '镜头向后拉远，展示环境', category: 'pull', level: 1, prompt: 'camera pulls back slowly' },
  { id: 'pan-left', name: '左摇', nameEN: 'Pan Left', description: '镜头水平向左转动', category: 'pan', level: 1, prompt: 'camera pans left' },
  { id: 'pan-right', name: '右摇', nameEN: 'Pan Right', description: '镜头水平向右转动', category: 'pan', level: 1, prompt: 'camera pans right' },
  { id: 'tilt-up', name: '仰', nameEN: 'Tilt Up', description: '镜头向上仰拍', category: 'tilt', level: 1, prompt: 'camera tilts up' },
  { id: 'tilt-down', name: '俯', nameEN: 'Tilt Down', description: '镜头向下俯拍', category: 'tilt', level: 1, prompt: 'camera tilts down' },
  { id: 'dolly-left', name: '左移', nameEN: 'Dolly Left', description: '镜头水平向左移动', category: 'dolly', level: 1, prompt: 'camera dollies left' },
  { id: 'dolly-right', name: '右移', nameEN: 'Dolly Right', description: '镜头水平向右移动', category: 'dolly', level: 1, prompt: 'camera dollies right' },
  { id: 'crane-up', name: '升', nameEN: 'Crane Up', description: '镜头垂直向上升起', category: 'crane', level: 1, prompt: 'camera cranes up' },
  { id: 'crane-down', name: '降', nameEN: 'Crane Down', description: '镜头垂直向下降落', category: 'crane', level: 1, prompt: 'camera cranes down' },
  { id: 'rotate-cw', name: '顺时针旋转', nameEN: 'Rotate CW', description: '镜头顺时针旋转', category: 'rotate', level: 1, prompt: 'camera rotates clockwise' },
  { id: 'rotate-ccw', name: '逆时针旋转', nameEN: 'Rotate CCW', description: '镜头逆时针旋转', category: 'rotate', level: 1, prompt: 'camera rotates counter-clockwise' },
  { id: 'zoom-in', name: '变焦推', nameEN: 'Zoom In', description: '镜头变焦推近', category: 'zoom', level: 1, prompt: 'camera zooms in' },
  { id: 'zoom-out', name: '变焦拉', nameEN: 'Zoom Out', description: '镜头变焦拉远', category: 'zoom', level: 1, prompt: 'camera zooms out' },
  { id: 'follow', name: '跟拍', nameEN: 'Follow', description: '镜头跟随主体移动', category: 'track', level: 1, prompt: 'camera follows the subject' },
  { id: 'static', name: '固定', nameEN: 'Static', description: '固定机位不动', category: 'track', level: 1, prompt: 'static camera, fixed position' },
];

// ========================================
// L2 组合运镜 — 常见两两/三三组合
// ========================================
export const L2_MOVEMENTS: CameraMovement[] = [
  { id: 'push-tilt-up', name: '推+仰', nameEN: 'Push + Tilt Up', description: '推进并向上仰拍', category: 'combined', level: 2, prompt: 'camera pushes in while tilting up' },
  { id: 'pull-crane-up', name: '拉+升', nameEN: 'Pull + Crane Up', description: '后拉并升起，展示全景', category: 'combined', level: 2, prompt: 'camera pulls back while craning up to reveal the scene' },
  { id: 'dolly-pan', name: '移+摇', nameEN: 'Dolly + Pan', description: '横向移动同时摇向主体', category: 'combined', level: 2, prompt: 'camera dollies sideways while panning to follow the subject' },
  { id: 'push-rotate', name: '推+旋转', nameEN: 'Push + Rotate', description: '推进并旋转，紧张感', category: 'combined', level: 2, prompt: 'camera pushes in while slowly rotating' },
  { id: 'crane-pan', name: '升+摇', nameEN: 'Crane + Pan', description: '升起并水平摇摄', category: 'combined', level: 2, prompt: 'camera cranes up while panning across the scene' },
  { id: 'follow-tilt', name: '跟+仰', nameEN: 'Follow + Tilt', description: '跟拍并仰视，英雄角度', category: 'combined', level: 2, prompt: 'camera follows the subject from a low angle, tilting up' },
  { id: 'pull-pan', name: '拉+摇', nameEN: 'Pull + Pan', description: '后拉同时水平转向', category: 'combined', level: 2, prompt: 'camera pulls back while panning to reveal surroundings' },
  { id: 'dolly-zoom', name: '滑变焦', nameEN: 'Dolly Zoom', description: '前推同时变焦拉远，眩晕效果', category: 'combined', level: 2, prompt: 'dolly zoom effect, camera moves forward while zooming out' },
  { id: 'handheld-follow', name: '手持跟拍', nameEN: 'Handheld Follow', description: '手持跟踪拍摄，纪实感', category: 'combined', level: 2, prompt: 'handheld camera following the subject with slight shake' },
];

// ========================================
// L3 大师运镜 — 经典电影运镜手法
// ========================================
export const L3_MOVEMENTS: CameraMovement[] = [
  { id: 'hitchcock-zoom', name: '希区柯克变焦', nameEN: 'Hitchcock Zoom', description: '经典眩晕变焦：推进+变焦拉远', category: 'master', level: 3, prompt: 'Hitchcock vertigo effect, dolly in while zooming out simultaneously, creating disorienting spatial distortion' },
  { id: 'spielberg-oner', name: '斯皮尔伯格长镜头', nameEN: 'Spielberg Oner', description: '流畅的长镜头场景漫游', category: 'master', level: 3, prompt: 'long take, camera smoothly moves through the scene in one continuous shot, following the action fluidly' },
  { id: 'kubrick-symmetry', name: '库布里克对称', nameEN: 'Kubrick Symmetry', description: '完美对称构图缓慢推进', category: 'master', level: 3, prompt: 'perfectly symmetrical composition, camera slowly pushes forward through a symmetrical corridor' },
  { id: 'wes-anderson-pan', name: '韦斯安德森横摇', nameEN: 'Wes Anderson Pan', description: '快速横摇切换对称构图', category: 'master', level: 3, prompt: 'quick whip pan between centered, symmetrically framed compositions' },
  { id: 'nolan-imax', name: '诺兰IMAX航拍', nameEN: 'Nolan IMAX Aerial', description: '壮阔的IMAX航拍全景', category: 'master', level: 3, prompt: 'expansive IMAX-style aerial shot, sweeping over vast landscape with dramatic scale' },
  { id: 'wong-karwai-slow', name: '王家卫慢镜头', nameEN: 'Wong Kar-wai Slow Mo', description: '慢动作+摇晃手持，迷幻氛围', category: 'master', level: 3, prompt: 'slow motion with handheld camera movement, dreamy and atmospheric, neon-lit environment' },
  { id: 'fincher-top-down', name: '芬奇俯拍', nameEN: 'Fincher Top Down', description: '完美的头顶俯拍镜头', category: 'master', level: 3, prompt: 'precise top-down overhead shot looking straight down, clinical and controlled movement' },
  { id: 'tarantino-low', name: '昆汀低角度', nameEN: 'Tarantino Low Angle', description: '经典昆汀仰拍+跟踪', category: 'master', level: 3, prompt: 'extreme low angle shot looking up at the subject, camera tracking forward from below' },
  { id: 'circular-orbit', name: '环绕轨道', nameEN: 'Circular Orbit', description: '360度环绕主体运行', category: 'master', level: 3, prompt: 'camera orbits 360 degrees around the subject in a smooth circular motion' },
];

export const ALL_MOVEMENTS = [...L1_MOVEMENTS, ...L2_MOVEMENTS, ...L3_MOVEMENTS];

export function getMovementsByLevel(level: 1 | 2 | 3): CameraMovement[] {
  switch (level) {
    case 1: return L1_MOVEMENTS;
    case 2: return L2_MOVEMENTS;
    case 3: return L3_MOVEMENTS;
  }
}

export function getMovementById(id: string): CameraMovement | undefined {
  return ALL_MOVEMENTS.find(m => m.id === id);
}
