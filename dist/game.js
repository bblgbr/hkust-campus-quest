const sceneList = window.OFFICIAL_SCENES;
const scenes = Object.fromEntries(sceneList.map(scene => [scene.id, {
  ...scene,
  subtitle: scene.category + ' · HKUST Clear Water Bay'
}]));
const ids = sceneList.map(scene => scene.id);
// Official tour arrows remain attached to their panoramas. The walking graph also
// includes their reverse exits and a few short links at the map coordinates.
const walkingLinks = [
  ['piazza_north', 'piazza'],
  ['library', 'lawn'],
  ['cwb-20', 'cwb-38'],
  ['cwb-20', 'cwb-41'],
  ['cwb-19', 'cwb-40'],
  ['cwb-24', 'cwb-50'],
  ['cwb-54', 'cwb-56']
];
const walkGraph = Object.fromEntries(ids.map(id => [id, new Map()]));
sceneList.forEach(scene => scene.exits.forEach(exit => {
  walkGraph[scene.id].set(exit.to, { to: exit.to, kind: 'official' });
  if (!walkGraph[exit.to].has(scene.id)) walkGraph[exit.to].set(scene.id, { to: scene.id, kind: 'return' });
}));
walkingLinks.forEach(([a, b]) => {
  if (!walkGraph[a].has(b)) walkGraph[a].set(b, { to: b, kind: 'walk' });
  if (!walkGraph[b].has(a)) walkGraph[b].set(a, { to: a, kind: 'walk' });
});
function shortestPath(from, to) {
  if (!scenes[to]) return null;
  const remaining = new Set(ids), distance = new Map(ids.map(id => [id, Infinity]));
  const previous = new Map([[from, null]]);
  distance.set(from, 0);
  while (remaining.size) {
    let id = null;
    for (const candidate of remaining) {
      if (id === null || distance.get(candidate) < distance.get(id)) id = candidate;
    }
    if (id === to || distance.get(id) === Infinity) break;
    remaining.delete(id);
    for (const next of walkGraph[id].keys()) {
      if (!remaining.has(next)) continue;
      const a = scenes[id].map, b = scenes[next].map;
      const length = Math.max(8, Math.hypot(a[0] - b[0], a[1] - b[1]));
      const candidate = distance.get(id) + length;
      if (candidate < distance.get(next)) {
        distance.set(next, candidate);
        previous.set(next, id);
      }
    }
  }
  if (!previous.has(to)) return null;
  const path = [];
  for (let id = to; id !== null; id = previous.get(id)) path.unshift(id);
  return path;
}

// One small welcome-card piece in each of nine widely separated official panoramas.
const glyphs = [
  { scene: 'north', char: 'W', yaw: 224, y: 57, hint: 'arrival' },
  { scene: 'piazza', char: 'E', yaw: 71, y: 41, hint: 'time' },
  { scene: 'library', char: 'L', yaw: 297, y: 59, hint: 'quiet' },
  { scene: 'fountain', char: 'C', yaw: 138, y: 39, hint: 'ripples' },
  { scene: 'cwb-20', char: 'O', yaw: 249, y: 55, hint: 'tides' },
  { scene: 'cwb-35', char: 'M', yaw: 46, y: 44, hint: 'motion' },
  { scene: 'cwb-17', char: 'E', yaw: 315, y: 60, hint: 'curiosity' },
  { scene: 'cwb-21', char: 'TO', yaw: 112, y: 43, hint: 'echo' },
  { scene: 'cwb-32', char: 'HKUST', yaw: 281, y: 56, hint: 'departure' }
];
const inventoryOrder = [4, 1, 7, 0, 5, 2, 8, 3, 6];
const phrase = 'WELCOME TO HKUST';
const welcomePieceOrder = glyphs.map(g => g.char).join('|');
// Map saved pieces from the earlier Chinese version back to their original scenes.
const legacyGlyphScenes = {
  '\u9999': 'north', '\u6e2f': 'piazza', '\u79d1': 'library', '\u6280': 'fountain',
  '\u5927': 'cwb-20', '\u5b78': 'cwb-35', '\u5b66': 'cwb-35',
  '\u6b61': 'cwb-17', '\u6b22': 'cwb-17', '\u8fce': 'cwb-21', '\u4f60': 'cwb-32'
};
const dayTasks = [
  { time: '09:00–11:30', scene: 'cwb-50', title: 'New Student Orientation', question: 'In which year was HKUST established?', choices: ['1990', '1991', '1992', '1993'], correct: [1] },
  { time: '11:30–12:30', scene: 'cwb-11', title: 'Lunch at LG1', question: 'Which HKUST canteen serves the best food?', choices: ['LG1', 'LG7', 'LSK', 'None of them'], correct: [3] },
  { time: '12:30–16:30', scene: 'cwb-51', title: 'Library Study & Course Registration', question: 'Which AMC course is most recommended?', choices: ['AMCC 5120', 'AMCC 5140', 'AMCC 5160', 'AMCC 5180'], correct: [2] },
  { time: '16:30–17:30', scene: 'cwb-36', title: 'Workout at LG4', question: 'Which HKUST sports facilities are free for students and staff?', choices: ['Badminton courts', 'Squash courts', 'Fitness center', 'All of the above'], correct: [3] },
  { time: '17:30–18:30', scene: 'cwb-13', title: 'Dinner at LSK', question: 'What is the best dish at LSK Canteen?', choices: ['Three-dish rice', 'Roast meats', 'Mala tang', 'Cart noodles'], correct: [0, 1, 2, 3], success: 'The best choice is the one you enjoy most!' },
  { time: '18:30–20:30', scene: 'cwb-54', title: 'Welcome Party', question: 'At the welcome party, someone claiming to be HKUST staff asks for your SMS one-time password (OTP) to claim a prize. What should you do?', choices: ['Share the code immediately', 'Enter it on the link they send', 'Refuse and verify through official HKUST channels', 'Ask a classmate to share it for you'], correct: [2] },
  { time: '20:30', scene: 'cwb-32', title: 'Depart from South Entrance', question: 'Which bus route is not available at the South Entrance?', choices: ['91', '104', '11', '11M'], correct: [3] }
];
const chapters = [
  { title: 'The Missing Welcome Card', short: 'The Greeting', description: 'Search the panoramas for nine hidden pieces and rebuild the campus greeting.', image: 'assets/piazza-official.jpg' },
  { title: "A New Student's First Day", short: "A New Student's First Day", description: 'Start at North Entrance and walk to seven scenes in order to complete your first day.', image: 'assets/cwb-94.jpg' },
  { title: 'Exploring 3D world in HKUST', short: '3D World', description: 'A new campus exploration chapter is in development.', image: 'assets/fountain-official.jpg', inDevelopment: true }
];
const levelTitles = chapters.map(chapter => chapter.short);
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const normalize = a => ((a % 360) + 360) % 360;
const progressKey = 'campusQuestFiveLevelsV1';
function savedObject(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; }
}
const saved = savedObject(progressKey);
const savedLevel = Number.isInteger(saved.level) ? Math.min(3, Math.max(1, saved.level)) : 1;
const savedDayTaskIndex = Number.isInteger(saved.dayTaskIndex) ? Math.min(dayTasks.length, Math.max(0, saved.dayTaskIndex)) : 0;
const progress = {
  level: savedLevel > 2 && savedDayTaskIndex < dayTasks.length ? 2 : savedLevel,
  found: Array.isArray(saved.found) ? saved.found.filter(id => glyphs.some(g => g.scene === id)) : [],
  hintScene: glyphs.some(g => g.scene === saved.hintScene) ? saved.hintScene : null,
  assembled: Array.isArray(saved.assembled) ? [...new Set(saved.assembled.map(piece =>
    glyphs.some(g => g.scene === piece) ? piece : legacyGlyphScenes[piece]
  ).filter(Boolean))] : [],
  dayTaskIndex: savedDayTaskIndex,
  dayStarted: saved.dayStarted === true
};
if (progress.found.includes(progress.hintScene)) progress.hintScene = null;
let selectedLevel = Math.min(progress.level, 2);
let currentScreen = 'home';
const state = {
  scene: 'north', yaw: 180, zoom: 1, visited: savedObject('campusQuestVisited'),
  previousScene: null, destination: null, dragging: false, startX: 0, startYaw: 180
};
const viewport = $('viewport'), panorama = $('panorama'), layer = $('hotspotLayer'), dialog = $('gameDialog'), taskDialog = $('taskDialog');
let activeHotspots = [], worldWidth = 0, toastTimer, taskAnswered = false;
function nearestUnfoundGlyph() {
  let closest = null, shortestWalk = Infinity;
  for (const glyph of glyphs) {
    if (progress.found.includes(glyph.scene)) continue;
    const path = shortestPath(state.scene, glyph.scene);
    const distance = path ? path.slice(1).reduce((total, id, i) => {
      const from = scenes[path[i]].map, to = scenes[id].map;
      return total + Math.max(8, Math.hypot(from[0] - to[0], from[1] - to[1]));
    }, 0) : Infinity;
    if (distance < shortestWalk) {
      closest = glyph.scene;
      shortestWalk = distance;
    }
  }
  return closest || glyphs.find(g => !progress.found.includes(g.scene))?.scene || null;
}
function save() {
  localStorage.setItem(progressKey, JSON.stringify(progress));
  localStorage.setItem('campusQuestVisited', JSON.stringify(state.visited));
}
function renderChapters() {
  const grid = $('chapterGrid');
  grid.innerHTML = '';
  $('chapterProgress').textContent = pad(Math.min(progress.level, 2)) + ' / 03 PLAYABLE';
  chapters.forEach((chapter, index) => {
    const number = index + 1;
    const upcoming = chapter.inDevelopment === true;
    const locked = !upcoming && number > progress.level;
    const completed = number < progress.level;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'chapter-card ' + (upcoming ? 'upcoming' : locked ? 'locked' : completed ? 'completed' : 'available');
    card.disabled = locked || upcoming;
    card.style.setProperty('--chapter-image', 'url("' + chapter.image + '")');
    card.setAttribute('aria-label', 'Chapter ' + number + ': ' + chapter.title + '. ' + (upcoming ? 'In development, unavailable' : locked ? 'Locked' : completed ? 'Completed, revisit' : 'Available, enter chapter'));
    card.innerHTML = '<div class="chapter-art"><span>CHAPTER ' + pad(number) + '</span><strong>' + (upcoming ? '…' : locked ? '○' : completed ? '✓' : '↗') + '</strong></div>' +
      '<div class="chapter-copy"><span class="chapter-state">' + (upcoming ? 'IN DEVELOPMENT' : locked ? 'LOCKED' : completed ? 'COMPLETED' : 'READY TO PLAY') + '</span><h2>' + chapter.title + '</h2><p>' + chapter.description + '</p><span class="chapter-action">' + (upcoming ? 'Coming soon' : locked ? 'Complete the previous chapter' : completed ? 'Revisit chapter ↗' : 'Enter chapter ↗') + '</span></div>';
    if (!locked && !upcoming) card.addEventListener('click', () => { window.location.hash = '#/level-' + number; });
    grid.appendChild(card);
  });
}
function showRoute() {
  const route = window.location.hash.replace(/^#\/?/, '');
  const match = /^level-([1-2])$/.exec(route);
  if ((route.startsWith('level-') && !match) || (match && Number(match[1]) > progress.level)) {
    window.location.hash = '#/levels';
    return;
  }
  currentScreen = match ? 'game' : route === 'levels' ? 'levels' : 'home';
  $('homeScreen').hidden = currentScreen !== 'home';
  $('levelsScreen').hidden = currentScreen !== 'levels';
  $('gameScreen').hidden = currentScreen !== 'game';
  if (currentScreen === 'levels') {
    renderChapters();
    document.title = 'Choose a Chapter · HKUST Campus Quest';
  } else if (currentScreen === 'game') {
    selectedLevel = Number(match[1]);
    if (selectedLevel === 2 && progress.dayTaskIndex === dayTasks.length && progress.level === 2) {
      completeLevel(2);
      return;
    }
    if (selectedLevel === 2 && progress.dayTaskIndex === 0 && !progress.dayStarted) {
      state.scene = 'north';
      state.previousScene = null;
      state.yaw = 180;
      progress.dayStarted = true;
    }
    if (selectedLevel === 2 && progress.dayTaskIndex < dayTasks.length) {
      const target = dayTasks[progress.dayTaskIndex].scene;
      state.destination = target === state.scene ? null : target;
    }
    state.visited[state.scene] = true;
    save();
    renderScene();
    document.title = chapters[selectedLevel - 1].title + ' · HKUST Campus Quest';
  } else {
    document.title = 'Campus Quest · HKUST';
  }
  window.scrollTo(0, 0);
}
function renderMap() {
  const points = $('mapPoints'), route = $('mapRoute');
  points.innerHTML = '';
  route.innerHTML = '';
  const query = $('sceneSearch').value.trim().toLocaleLowerCase();
  const category = $('categoryFilter').value;
  const filtered = ids.filter(id => {
    const scene = scenes[id];
    return (category === 'all' || category === scene.category) &&
      (!query || (scene.title + ' ' + scene.officialName + ' ' + scene.category).toLocaleLowerCase().includes(query));
  });
  ids.forEach(id => {
    const scene = scenes[id], i = ids.indexOf(id);
    const pin = document.createElement('button');
    pin.className = 'map-point';
    pin.dataset.scene = id;
    pin.style.setProperty('--x', (scene.map[0] / 340 * 100) + '%');
    pin.style.setProperty('--y', (scene.map[1] / 324 * 100) + '%');
    const circle = document.createElement('span');
    circle.className = 'point-pin';
    circle.textContent = i + 1;
    pin.appendChild(circle);
    points.appendChild(pin);
  });
  filtered.forEach(id => {
    const scene = scenes[id], i = ids.indexOf(id);
    const item = document.createElement('button');
    item.className = 'route-item';
    item.dataset.scene = id;
    item.textContent = pad(i + 1) + ' ' + scene.title;
    item.title = scene.officialName;
    route.appendChild(item);
  });
  $('visibleCount').textContent = filtered.length + ' / ' + ids.length + ' scenes';
  if (!filtered.length) route.innerHTML = '<p class="empty-results">No matching scenes. Try another search or category.</p>';
  syncMapState();
}
function syncMapState() {
  document.querySelectorAll('.map-point,.route-item').forEach(btn => {
    const id = btn.dataset.scene, isExit = walkGraph[state.scene].has(id);
    btn.classList.toggle('active', id === state.scene);
    btn.classList.toggle('exit', isExit);
    btn.classList.toggle('destination', id === state.destination);
    btn.classList.toggle('visited', !!state.visited[id]);
    btn.setAttribute('aria-label', (id === state.scene ? 'Current location: ' : isExit ? 'Walk to ' : 'Plan route to ') + scenes[id].title);
    btn.title = isExit ? 'Connected exit to ' + scenes[id].title : id === state.scene ? 'Current location' : 'Plan a walking route to ' + scenes[id].title;
  });
  const svg = $('mapLinks');
  svg.innerHTML = '';
  const line = (a, b, kind) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    el.setAttribute('x1', scenes[a].map[0]); el.setAttribute('y1', scenes[a].map[1]);
    el.setAttribute('x2', scenes[b].map[0]); el.setAttribute('y2', scenes[b].map[1]);
    el.setAttribute('class', kind);
    svg.appendChild(el);
  };
  walkGraph[state.scene].forEach((_, to) => line(state.scene, to, 'map-link'));
  const path = state.destination ? shortestPath(state.scene, state.destination) : null;
  if (path && path.length > 1) {
    for (let i = 0; i < path.length - 1; i++) line(path[i], path[i + 1], 'map-route-line');
    $('mapGuideText').textContent = 'To ' + scenes[state.destination].title + ': ' + (path.length - 1) +
      ' connected step' + (path.length === 2 ? '' : 's') + '. Next: ' + scenes[path[1]].title + '.';
    $('walkNextBtn').hidden = false;
    $('walkNextBtn').textContent = 'Walk to ' + scenes[path[1]].title + ' ↗';
  } else {
    $('mapGuideText').textContent = 'Highlighted pins are exits you can walk to now. Select another place to plan a route.';
    $('walkNextBtn').hidden = true;
  }
}
function sceneHotspots(id) {
  const result = [];
  const glyph = selectedLevel === 1 && progress.level === 1 && glyphs.find(g => g.scene === id && !progress.found.includes(id));
  if (glyph) result.push({ ...glyph, id: id + '-glyph', type: 'glyph', label: 'Collect hidden welcome-card piece' });
  const task = selectedLevel === 2 && progress.dayTaskIndex < dayTasks.length && dayTasks[progress.dayTaskIndex];
  if (task && task.scene === id) result.push({ id: id + '-task', type: 'task', yaw: 180, y: 32, label: 'Start task: ' + task.title });
  scenes[id].exits.forEach((exit, i) => result.push({
    id: id + '-exit-' + i, type: 'portal', to: exit.to, official: !!exit.official,
    yaw: normalize(180 + exit.ath),
    y: Math.max(22, Math.min(79, 50 + exit.atv / 180 * 100)),
    label: 'Go to ' + scenes[exit.to].title
  }));
  return result;
}
function renderPanorama() {
  const w = viewport.clientWidth, h = viewport.clientHeight;
  worldWidth = Math.max(w * 1.6, h * 3.6) * state.zoom;
  panorama.style.backgroundSize = worldWidth + 'px auto';
  panorama.style.backgroundPositionX = (w / 2 - state.yaw / 360 * worldWidth) + 'px';
  panorama.style.backgroundPositionY = '50%';
  layer.querySelectorAll('.hotspot').forEach(el => {
    const hotspot = activeHotspots.find(hot => hot.id === el.dataset.id);
    if (!hotspot) return;
    const delta = ((hotspot.yaw - state.yaw + 540) % 360) - 180;
    const x = w / 2 + delta / 360 * worldWidth;
    const y = Math.max(13, Math.min(84, 50 + (hotspot.y - 50) * worldWidth / (h * 2)));
    el.style.left = x + 'px';
    el.style.top = y + '%';
    el.classList.toggle('hidden', x < -65 || x > w + 65);
  });
  $('compassBearing').textContent = Math.round(state.yaw) + '°';
  $('zoomLevel').textContent = 'ZOOM ' + Math.round(state.zoom * 100) + '%';
}
function renderExits() {
  const list = $('sceneExitList');
  list.innerHTML = '';
  const exits = [...walkGraph[state.scene].values()].sort((a, b) => {
    if (a.to === state.previousScene) return -1;
    if (b.to === state.previousScene) return 1;
    const distance = id => (scenes[id].map[0] - scenes[state.scene].map[0]) ** 2 +
      (scenes[id].map[1] - scenes[state.scene].map[1]) ** 2;
    return distance(a.to) - distance(b.to);
  });
  exits.forEach(exit => {
    const button = document.createElement('button');
    button.className = 'scene-exit-button' + (exit.kind === 'official' ? '' : ' secondary');
    button.type = 'button';
    button.dataset.scene = exit.to;
    button.innerHTML = '<span class="exit-arrow"></span><span></span>';
    button.firstElementChild.textContent = exit.to === state.previousScene ? '↶' : '↗';
    button.lastElementChild.textContent = (exit.kind === 'return' ? 'Return · ' : exit.kind === 'walk' ? 'Walk · ' : '') + scenes[exit.to].title;
    button.addEventListener('click', () => switchScene(exit.to, exit.kind));
    list.appendChild(button);
  });
  $('exitCount').textContent = exits.length + ' connected exit' + (exits.length === 1 ? '' : 's');
}
function renderScene() {
  const scene = scenes[state.scene], index = ids.indexOf(state.scene) + 1;
  $('gameChapterLabel').textContent = 'CHAPTER ' + pad(selectedLevel);
  $('gameHeading').textContent = chapters[selectedLevel - 1].title;
  $('gameChapterIntro').textContent = chapters[selectedLevel - 1].description;
  panorama.style.backgroundImage = "url('" + scene.image + "')";
  $('sceneKicker').textContent = 'LOCATION ' + pad(index) + ' / ' + pad(ids.length);
  $('sceneTitle').textContent = scene.title;
  $('sceneSubtitle').textContent = scene.subtitle;
  $('sceneHint').textContent = selectedLevel < progress.level && !(selectedLevel === 2 && progress.dayTaskIndex < dayTasks.length) ? 'This chapter is complete. Explore the official tour at your own pace.'
    : selectedLevel === 1
    ? 'Look closely while you explore. Tiny welcome-card pieces can be found in nine panoramas.'
    : 'Walk to the next stop and select the gold task marker to answer a question.';
  $('sceneNumber').textContent = pad(index);
  $('sceneTotal').textContent = pad(ids.length);
  activeHotspots = sceneHotspots(state.scene);
  layer.innerHTML = '';
  activeHotspots.forEach(h => {
    const btn = document.createElement('button');
    btn.className = 'hotspot ' + h.type;
    btn.dataset.id = h.id;
    btn.setAttribute('aria-label', h.label);
    btn.innerHTML = h.type === 'glyph'
      ? '<span class="glyph-mark" aria-hidden="true">✶</span>'
      : '<span class="hotspot-orbit"></span><span class="hotspot-label"></span>';
    if (h.type === 'portal') btn.querySelector('.hotspot-label').textContent = h.label;
    if (h.type === 'task') btn.querySelector('.hotspot-label').textContent = 'START TASK ↗';
    btn.addEventListener('click', () => openHotspot(h));
    layer.appendChild(btn);
  });
  $('sceneProgress').textContent = selectedLevel === 2 && progress.dayTaskIndex < dayTasks.length ? 'TASK ' + (progress.dayTaskIndex + 1) + ' / ' + dayTasks.length : selectedLevel < progress.level ? 'CHAPTER COMPLETE' : 'LEVEL ' + selectedLevel;
  syncMapState();
  renderExits();
  renderPanorama();
  renderMission();
  scene.exits.forEach(exit => { const img = new Image(); img.src = scenes[exit.to].image; });
}
function renderMission() {
  const level = selectedLevel;
  const completed = level < progress.level && !(level === 2 && progress.dayTaskIndex < dayTasks.length);
  $('progressText').textContent = completed ? 'CHAPTER ' + level + ' COMPLETE' : 'LEVEL ' + level + ' / 3';
  $('progressDots').innerHTML = chapters.map((_, i) => '<i class="' + (i < progress.level - 1 ? 'on' : '') + '"></i>').join('');
  $('levelStatus').textContent = completed ? 'COMPLETED' : pad(level) + ' / 03';
  $('levelTrack').innerHTML = levelTitles.map((title, i) => {
    const status = chapters[i].inDevelopment ? 'upcoming' : i < progress.level - 1 ? 'done' : i === progress.level - 1 ? 'current' : 'locked';
    return '<div class="level-node ' + status + (i === level - 1 ? ' selected' : '') + '" title="' + chapters[i].title + '" aria-label="Level ' + (i + 1) + ': ' + chapters[i].title + ', ' + status + '">' +
      (status === 'done' ? '✓' : status === 'upcoming' ? '…' : status === 'locked' ? '·' : i + 1) + '</div>';
  }).join('');
  $('levelKicker').textContent = 'CHAPTER ' + pad(level);
  $('levelTitle').textContent = chapters[level - 1].title;
  const content = $('levelContent');
  content.innerHTML = '';
  if (completed) {
    $('levelDescription').textContent = 'Chapter complete. You can revisit the campus scenes and connected paths.';
    content.innerHTML = '<div class="completion-greeting">' + (level === 1 ? phrase : '✓ Chapter complete') + '</div><p class="mission-detail">Return to Chapters to continue your journey.</p>';
  } else if (level === 1) {
    $('levelDescription').textContent = 'Nine tiny welcome-card pieces are scattered across the campus. Find them in the panoramas, then arrange the greeting.';
    const count = progress.found.length;
    content.innerHTML = '<div class="quest-meter"><span>Pieces found</span><strong>' + count + ' / 9</strong></div>' +
      (count < glyphs.length ? '<div class="quest-hint" id="questHint"></div>' : '') +
      '<div class="glyph-inventory" id="glyphInventory"></div>' +
      '<div class="assembled-line" id="assembledLine"></div><button type="button" class="mission-button subtle" id="clearAssembly">Clear selection</button>';
    if (count < glyphs.length) {
      const hint = $('questHint');
      if (progress.hintScene) {
        const word = document.createElement('strong');
        word.className = 'hint-word';
        word.textContent = glyphs.find(g => g.scene === progress.hintScene).hint;
        word.setAttribute('aria-label', 'One-word hint: ' + word.textContent);
        hint.appendChild(word);
      } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'hint-button';
        button.textContent = 'Need a hint?';
        button.addEventListener('click', () => {
          progress.hintScene = nearestUnfoundGlyph();
          save();
          renderMission();
        });
        hint.appendChild(button);
      }
    }
    inventoryOrder.map(i => glyphs[i]).filter(g => progress.found.includes(g.scene)).forEach(g => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'inventory-glyph' + (progress.assembled.includes(g.scene) ? ' selected' : '');
      button.textContent = g.char;
      button.disabled = progress.assembled.includes(g.scene);
      button.setAttribute('aria-label', 'Add piece ' + g.char);
      button.addEventListener('click', () => {
        progress.assembled.push(g.scene);
        if (progress.assembled.length === 9) {
          if (progress.assembled.map(id => glyphs.find(g => g.scene === id)?.char).join('|') === welcomePieceOrder) {
            completeLevel(1);
            return;
          }
          progress.assembled = [];
          toast('The greeting is out of order. Try again.');
        }
        save();
        renderMission();
      });
      $('glyphInventory').appendChild(button);
    });
    $('assembledLine').textContent = progress.assembled.map(id => glyphs.find(g => g.scene === id)?.char).join(' ') || 'Select collected pieces in order';
    $('clearAssembly').addEventListener('click', () => { progress.assembled = []; save(); renderMission(); });
  } else if (level === 2) {
    const task = dayTasks[progress.dayTaskIndex];
    const atDestination = state.scene === task.scene;
    $('levelDescription').textContent = 'Start at North Entrance. Visit each stop in time order, select its gold task marker, and answer correctly to continue.';
    content.innerHTML = '<div class="quest-meter"><span>Tasks completed</span><strong>' + progress.dayTaskIndex + ' / ' + dayTasks.length + '</strong></div>' +
      '<div class="day-steps" aria-label="Progress through seven tasks">' + dayTasks.map((_, i) => '<span class="' + (i < progress.dayTaskIndex ? 'done' : i === progress.dayTaskIndex ? 'current' : '') + '" title="Task ' + (i + 1) + '">' + (i < progress.dayTaskIndex ? '✓' : i + 1) + '</span>').join('') + '</div>' +
      '<div class="day-task-card"><span class="day-task-time">' + task.time + ' · TASK ' + pad(progress.dayTaskIndex + 1) + '</span><h3>' + task.title + '</h3><p>Go to ' + pad(ids.indexOf(task.scene) + 1) + ' · ' + scenes[task.scene].title + '</p><span>' + (atDestination ? 'You are here. Select the gold task marker in the panorama.' : 'Walk through connected exits to reach this stop.') + '</span></div>' +
      '<button type="button" class="mission-button" id="dayRoute">' + (atDestination ? 'Show current location' : 'Show walking route ↗') + '</button>';
    $('dayRoute').addEventListener('click', () => planRoute(task.scene));
  }
}
function completeLevel(expected) {
  if (expected !== 1 && expected !== 2) return;
  if (selectedLevel !== expected) return;
  if (progress.level !== expected) return;
  progress.level = expected + 1;
  save();
  const next = expected === 2 ? 'Chapter 2 complete. Chapter 3 is in development.' : 'Level 1 complete. Level 2 unlocked.';
  window.location.hash = '#/levels';
  toast(next);
}
function switchScene(id, source = 'map') {
  if (!scenes[id]) return;
  if (state.scene === id && source !== 'initial') return;
  if (source !== 'initial' && !walkGraph[state.scene].has(id)) {
    planRoute(id);
    return;
  }
  if (state.scene !== id) state.previousScene = state.scene;
  state.scene = id;
  if (state.destination === id) state.destination = null;
  state.yaw = 180;
  state.zoom = 1;
  state.visited[id] = true;
  save();
  renderScene();
  $('viewHint').classList.remove('dismissed');
  if (window.innerWidth <= 720) viewport.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function turn(delta) {
  state.yaw = normalize(state.yaw + delta);
  renderPanorama();
  $('viewHint').classList.add('dismissed');
}
function changeZoom(delta) {
  state.zoom = Math.max(0.65, Math.min(1.7, Math.round((state.zoom + delta) * 100) / 100));
  renderPanorama();
  $('viewHint').classList.add('dismissed');
}
function dialogBase(kicker, symbol, title, body) {
  $('dialogKicker').textContent = kicker;
  $('dialogSymbol').textContent = symbol;
  $('dialogTitle').textContent = title;
  $('dialogBody').textContent = body;
  $('dialogChoices').innerHTML = '';
  $('dialogFeedback').textContent = '';
  $('dialogAction').textContent = 'Continue exploring →';
  $('dialogAction').classList.remove('show');
  dialog.showModal();
}
function openTaskDialog() {
  const index = progress.dayTaskIndex;
  const task = dayTasks[index];
  if (selectedLevel !== 2 || !task || state.scene !== task.scene) return;
  taskAnswered = false;
  $('taskKicker').textContent = task.time + ' · TASK ' + pad(index + 1) + ' / ' + pad(dayTasks.length);
  $('taskDialogTitle').textContent = task.title;
  $('taskQuestion').textContent = task.question;
  $('taskFeedback').textContent = '';
  $('taskFeedback').className = 'dialog-feedback';
  $('taskContinue').classList.remove('show');
  const choices = $('taskChoices');
  choices.innerHTML = '';
  task.choices.forEach((choice, optionIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = choice;
    button.addEventListener('click', () => {
      if (taskAnswered) return;
      choices.querySelectorAll('button').forEach(item => item.classList.remove('wrong'));
      if (!task.correct.includes(optionIndex)) {
        button.classList.add('wrong');
        $('taskFeedback').textContent = 'Not quite. Try again.';
        $('taskFeedback').className = 'dialog-feedback wrong';
        return;
      }
      taskAnswered = true;
      progress.dayTaskIndex++;
      save();
      button.classList.add('correct');
      choices.querySelectorAll('button').forEach(item => { item.disabled = true; });
      $('taskFeedback').textContent = task.success || 'Correct! Task complete.';
      $('taskFeedback').className = 'dialog-feedback correct';
      $('taskContinue').textContent = progress.dayTaskIndex === dayTasks.length ? 'Finish the day →' : 'Continue to next stop →';
      $('taskContinue').classList.add('show');
    });
    choices.appendChild(button);
  });
  taskDialog.showModal();
}
function openHotspot(h) {
  if (h.type === 'portal') { switchScene(h.to, h.official ? 'official' : 'walk'); return; }
  if (h.type === 'task') { openTaskDialog(); return; }
  if (h.type !== 'glyph' || selectedLevel !== 1 || progress.level !== 1 || progress.found.includes(h.scene)) return;
  progress.found.push(h.scene);
  if (progress.hintScene === h.scene) progress.hintScene = null;
  state.visited[h.scene] = true;
  save();
  renderScene();
  toast('Piece ' + h.char + ' collected · ' + progress.found.length + ' / 9');
}
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function planRoute(id) {
  if (!scenes[id]) return;
  state.destination = id === state.scene ? null : id;
  syncMapState();
  if (state.destination) toast('Walking route to ' + scenes[id].title + ' is marked on the map.');
  else toast('You are already at ' + scenes[id].title + '.');
  document.querySelector('.map-card').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
document.querySelector('.map-card').addEventListener('click', event => {
  const btn = event.target.closest('[data-scene]');
  if (!btn) return;
  const id = btn.dataset.scene;
  if (walkGraph[state.scene].has(id)) switchScene(id, walkGraph[state.scene].get(id).kind);
  else planRoute(id);
});
$('walkNextBtn').addEventListener('click', () => {
  const path = state.destination && shortestPath(state.scene, state.destination);
  if (path && path[1]) switchScene(path[1], walkGraph[state.scene].get(path[1]).kind);
});
$('sceneSearch').addEventListener('input', renderMap);
$('categoryFilter').addEventListener('change', renderMap);
$('leftBtn').addEventListener('click', () => turn(-24));
$('rightBtn').addEventListener('click', () => turn(24));
viewport.addEventListener('pointerdown', event => {
  if (event.target.closest('button')) return;
  state.dragging = true;
  state.startX = event.clientX;
  state.startYaw = state.yaw;
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove', event => {
  if (!state.dragging) return;
  const dx = event.clientX - state.startX;
  state.yaw = normalize(state.startYaw - dx / worldWidth * 360);
  renderPanorama();
  if (Math.abs(dx) > 4) $('viewHint').classList.add('dismissed');
});
function endDrag() { state.dragging = false; viewport.classList.remove('dragging'); }
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
document.addEventListener('keydown', event => {
  if (currentScreen !== 'game' || dialog.open || taskDialog.open || (event.target instanceof Element && event.target.closest('input, select, textarea'))) return;
  if (event.key === 'ArrowLeft') { event.preventDefault(); turn(-12); }
  if (event.key === 'ArrowRight') { event.preventDefault(); turn(12); }
  if (event.key === 'ArrowUp') { event.preventDefault(); changeZoom(0.12); }
  if (event.key === 'ArrowDown') { event.preventDefault(); changeZoom(-0.12); }
});
window.addEventListener('resize', renderPanorama);
$('helpBtn').addEventListener('click', () => {
  dialogBase('HOW TO PLAY', '?', 'Explore the campus',
    'Explore the first two chapters in order. Chapter 3 is in development. Green map pins and the exit list move one connected scene at a time. Select a farther place to show a walking route, then follow it step by step. Find nine small welcome-card pieces and complete seven first-day tasks at their panoramas. Drag to look around, press ← → to turn, and ↑ ↓ to zoom.');
  $('dialogAction').classList.add('show');
});
$('dialogAction').addEventListener('click', () => { if (dialog.open) dialog.close(); });
$('taskDialogClose').addEventListener('click', () => taskDialog.close());
$('taskContinue').addEventListener('click', () => taskDialog.close());
taskDialog.addEventListener('close', () => {
  if (!taskAnswered) return;
  taskAnswered = false;
  if (progress.dayTaskIndex === dayTasks.length) {
    completeLevel(2);
    return;
  }
  const next = dayTasks[progress.dayTaskIndex];
  state.destination = next.scene;
  renderScene();
  toast('Task complete! Next stop: ' + scenes[next.scene].title);
});
$('startGameBtn').addEventListener('click', () => { window.location.hash = '#/levels'; });
$('homeBackBtn').addEventListener('click', () => { window.location.hash = '#/home'; });
$('levelsBackBtn').addEventListener('click', () => { window.location.hash = '#/levels'; });
window.addEventListener('hashchange', showRoute);
renderMap();
showRoute();
