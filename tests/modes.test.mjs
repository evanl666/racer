// Every mode is driven end to end headlessly: the run must terminate, produce a
// sane score, and never throw. Modes with distinctive rules get extra assertions.
//
//   node scripts/build.mjs && node tests/modes.test.mjs

import { createGame, reporter, touch } from './harness.mjs';

const { game, step, fire } = createGame();
const { check, finish } = reporter();

const THROTTLE = touch(1, 303, 774);
const LEFT_BTN = touch(2, 58, 774);

/** Drives a mode with the throttle down, weaving, until it ends or time runs out. */
function playMode(modeId, seconds, { weave = true } = {}) {
  game.startMode(modeId);
  fire('start', [THROTTLE]);
  let played = 0;
  const slice = 0.5;
  while (played < seconds && game.app.screen === 'PLAYING') {
    step(slice);
    played += slice;
    if (weave && Math.round(played / slice) % 6 === 0) {
      fire('start', [LEFT_BTN]);
      fire('end', [LEFT_BTN]);
    }
  }
  fire('cancel', [THROTTLE, LEFT_BTN]);
  return played;
}

check('boots into the mode menu', game.app.screen === 'MENU', game.app.screen);
check('sixteen modes are registered', game.MODES.length === 16, `${game.MODES.length} modes`);

const seenIds = new Set(game.MODES.map((mode) => mode.id));
check('every mode id is unique', seenIds.size === game.MODES.length);

// --- every mode runs to a terminal state ----------------------------------
for (const mode of game.MODES) {
  let threw = null;
  // Untimed modes (Speed Monkey, Endurance) end on a crash; give them room.
  const budget = Number.isFinite(mode.timeLimit) ? mode.timeLimit + 3 : 120;
  try {
    playMode(mode.id, budget);
  } catch (error) {
    threw = error;
  }

  check(`${mode.name}: runs without throwing`, threw === null, threw ? String(threw) : '');
  if (threw) continue;

  check(
    `${mode.name}: reaches a result`,
    game.app.screen === 'RESULT',
    `screen=${game.app.screen} outcome=${game.run.outcome}`
  );
  check(
    `${mode.name}: score is a finite number`,
    Number.isFinite(game.run.score) && game.run.score >= 0,
    `score=${game.run.score}`
  );
}

// --- mode-specific rules ---------------------------------------------------

// Death Race arms the car permanently, so contact must destroy rather than crash.
game.startMode('death-race');
fire('start', [THROTTLE]);
step(25);
fire('cancel', [THROTTLE]);
check('Death Race destroys cars on contact', game.run.destroyed > 0, `destroyed=${game.run.destroyed}`);
check('Death Race never crashes the player', game.run.crashes === 0, `crashes=${game.run.crashes}`);

// Sunday Drivers slows the field down; the player should lap it easily.
game.startMode('sunday-drivers');
const slowSpeeds = game.aiCars.map((car) => car.baseSpeed);
game.startMode('speed-monkey');
const normalSpeeds = game.aiCars.map((car) => car.baseSpeed);
check(
  'Sunday Drivers slows the traffic down',
  slowSpeeds[0] < normalSpeeds[0] * 0.6,
  `${slowSpeeds[0].toFixed(1)} vs ${normalSpeeds[0].toFixed(1)}`
);

// Difficulty scales both the player and the traffic.
game.app.difficulty = 'normal';
game.startMode('speed-monkey');
const normalPlayer = game.player.speed;
const normalTraffic = game.aiCars[0].baseSpeed;
game.app.difficulty = 'master';
game.startMode('speed-monkey');
check(
  'Master raises the player cruise speed',
  game.player.speed > normalPlayer * 1.4,
  `${normalPlayer.toFixed(0)} -> ${game.player.speed.toFixed(0)}`
);
check(
  'Master raises the traffic speed',
  game.aiCars[0].baseSpeed > normalTraffic * 1.4,
  `${normalTraffic.toFixed(0)} -> ${game.aiCars[0].baseSpeed.toFixed(0)}`
);
game.app.difficulty = 'normal';

// Difficulty is more than speed: the field size changes too.
const counts = {};
for (const difficulty of ['normal', 'turbo', 'master']) {
  game.app.difficulty = difficulty;
  game.startMode('speed-monkey');
  counts[difficulty] = game.aiCars.length;
}
check(
  'each difficulty puts a different amount of traffic on track',
  counts.normal < counts.turbo && counts.turbo < counts.master,
  `${counts.normal} / ${counts.turbo} / ${counts.master}`
);
check('Normal is no longer the old 18-car field', counts.normal >= 24, `cars=${counts.normal}`);
check('every car sits in a valid lane', game.aiCars.every((car) => car.lane >= 0 && car.lane < 6));
game.app.difficulty = 'normal';

// Hot Rods heats the engine while the throttle is held.
game.startMode('hot-rods');
fire('start', [THROTTLE]);
step(1.5);
const heat = game.player.heat;
fire('cancel', [THROTTLE]);
check('Hot Rods builds heat under throttle', heat > 0.2, `heat=${heat.toFixed(2)}`);
step(2.5);
check('Hot Rods cools off when released', game.player.heat < heat, `heat=${game.player.heat.toFixed(2)}`);

// In The Zone marks a subset of the field.
game.startMode('in-the-zone');
const zoned = game.aiCars.filter((car) => car.hasZone).length;
check('In The Zone marks six cars', zoned === 6, `marked=${zoned}`);

// --- menu, results and persistence ----------------------------------------
game.openMenu();
check('menu is reachable again', game.app.screen === 'MENU');

// Tapping the first mode row starts it. Rows begin at y=146 with 41px pitch.
fire('start', [touch(9, 195, 166)]);
fire('end', [touch(9, 195, 166)]);
check('tapping a mode row starts that mode', game.app.screen === 'PLAYING', `screen=${game.app.screen}`);

// Tapping a difficulty pill switches difficulty.
game.openMenu();
fire('start', [touch(10, 300, 109)]);
fire('end', [touch(10, 300, 109)]);
check('tapping a difficulty pill switches it', game.app.difficulty === 'master', game.app.difficulty);
game.app.difficulty = 'normal';

// Scores persist per mode and difficulty.
game.startMode('sunday-drivers');
fire('start', [THROTTLE]);
step(62);
fire('cancel', [THROTTLE]);
const best = game.bestScore('sunday-drivers', 'normal');
check('a completed run records a personal best', typeof best === 'number' && best > 0, `best=${best}`);
check('career points include that best', game.careerPoints() >= best, `career=${game.careerPoints()}`);

finish();
