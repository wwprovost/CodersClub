import { Clock } from "../../../js/clock.js";
import { getDimension } from "../../../js/layout.js";
import {
    AceAutoSaver,
    getDefaultPageID,
    Storage
  } from "../../../js/save.js";
import {
    checkFor200,
    getBasePath,
    getShadowingStatement
  } from "../../../js/utility.js";

///////////////////////////////////////////////////////////
// MODEL

//-----------------------------------------------
// Fixtures

const MASTER_SPEED = .03125; // grid units per tick
const CLOSE_ENOUGH = MASTER_SPEED / 10;

class Platform {

  constructor(x, y, len) {
    this.x = x;
    this.y = y;
    this.len = len;
  }
}

const FixtureType = {
  LADDER: "Ladder",
  CHUTE: "Chute",
  GOAL: "Goal"
};
const ANYTHING = "ANYTHING";
const EDGE = "EDGE";
let LIST_BOUNDARIES = "";
for (let type in FixtureType) {
  LIST_BOUNDARIES += type + ", ";
}
LIST_BOUNDARIES += EDGE + ", or " + ANYTHING + ".";

class Fixture {

  constructor(type, x, y, float) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.float = float;

    this.occupants = 0;
    this.moving = false;
    this.falling = false;
  }

  getBottom() {
    return this.y + this.float;
  }

  setBottom(bottom) {
    this.y = bottom - this.float;
  }
}

class Ladder extends Fixture {

  constructor(x, y, height) {
    super(FixtureType.LADDER, x, y, .34);
    this.height = height;
  }
}

class Chute extends Fixture {

  constructor(x, y, depth) {
    super(FixtureType.CHUTE, x, y, .64);
    this.depth = depth;
  }

  getBottom() {
    return super.getBottom() - this.depth;
  }

  setBottom(bottom) {
    super.setBottom(bottom + this.depth);
  }
}

class Goal extends Fixture {
  constructor(x, y) {
    super(FixtureType.GOAL, x, y);
  }
}

//-----------------------------------------------
// Player

const PlayerState = {
  STANDING: "Standing",
  RUNNING: "Running",
  PUSHING: "Pushing",
  JUMPING_UP: "JumpingUp",
  JUMPING_DOWN: "JumpingDown",
  CLIMBING: "Climbing",
  SLIDING: "Sliding",
  FALLING: "Falling"
}

/**
 * Coordinates are in grid units, (1,1) being lower-left,
 * all positions are positive numbers. Fractional positions make sense,
 * as e.g. the player runs from (1,1) to (2,1).
 */
class Player {

  constructor(puzzle, x, y, facingRight) {
    this.puzzle = puzzle;
    this.x = x;
    this.y = y;
    this.facingRight = facingRight;
    this.alive = true;
    this.state = PlayerState.STANDING;
    this.platform = null;
    this.jobs = [];

    this.speed = MASTER_SPEED;

    this.tick = this.tick.bind(this);
  }

  snapXToGrid() {
    if (Math.abs(this.x - Math.round(this.x)) < this.speed * .5) {
      this.x = Math.round(this.x);
    }
  }

  setPlatform() {
    let platform = this.puzzle.getPlayerPlatform(this);
    this.platform = platform;
  }

  queue(job) {
    this.jobs.push(job);
  }

  setOnJobDone(onJobDone) {
    this.onJobDone = onJobDone || function () {};
  }

  tick() {
    if (this.alive && this.jobs.length != 0) {
      if (this.jobs[0].tick()) {
        this.setPlatform();
        let completedJob = this.jobs.shift();
        if (this.jobs.length == 0) {
          this.onJobDone(completedJob);
        }

        if (!this.alive) {
          this.puzzle.lose();
        }
      }
    }
  }

  goUntil(type, onJobDone) {
    if (this.puzzle.goUntilEnabled) {
      this.queue(new GoUntilJob(this, this.puzzle,
          type, () => this.puzzle.isThereA(type, this)));
      this.setOnJobDone(onJobDone);
    } else {
      throw new Error("GO UNTIL jobs aren't enabled for this puzzle.");
    }
  }

  goUntilEdge(onJobDone) {
    if (this.puzzle.goUntilEnabled) {
      this.queue(new GoUntilJob(this, this.puzzle,
          EDGE, () => this.puzzle.isAtEdge(this)));
      this.setOnJobDone(onJobDone);
    } else {
      throw new Error("GO UNTIL jobs aren't enabled for this puzzle.");
    }
  }

  goUntilAnything(onJobDone) {
    if (this.puzzle.goUntilEnabled) {
      let isDone = () => this.puzzle.fixturesEncountered(this).length != 0 ||
          this.puzzle.isAtEdge(this);
      this.queue(new GoUntilJob(this, this.puzzle, ANYTHING, isDone));
      this.setOnJobDone(onJobDone);
    } else {
      throw new Error("GO UNTIL jobs aren't enabled for this puzzle.");
    }
  }

  go(onJobDone) {
    this.queue(new GoJob(this, this.puzzle));
    this.setOnJobDone(onJobDone);
  }

  turn(onJobDone) {
    this.queue(new TurnJob(this, this, this.puzzle.onPlayerAction));
    this.setOnJobDone(onJobDone);
  }

  jumpUp(onJobDone) {
    this.queue(new JumpUpJob(this, this.puzzle));
    this.setOnJobDone(onJobDone);
  }

  jumpDown(onJobDone) {
    this.queue(new JumpDownJob(this, this.puzzle));
    this.setOnJobDone(onJobDone);
  }

  push(onJobDone) {
    this.queue(new PushJob(this, this.puzzle));
    this.setOnJobDone(onJobDone);
  }
}

//-----------------------------------------------
// Jobs

class Job {

  constructor(player, puzzle) {
    this.player = player;
    this.puzzle = puzzle;

    this.ticksSoFar = 0;
  }

  queue(job) {
    this.player.queue(job);
  }

  tick() {
    ++this.ticksSoFar;

    return this.act() ? true : false; // no return value => false
  }
}

class PauseJob extends Job {
  constructor(player, puzzle, ticks) {
    super(player, puzzle);
    this.ticks = ticks;
  }

  act() {
    return this.ticksSoFar >= this.ticks;
  }
}

const GRACE_AT_EDGE = .55;
class GoUntilJob extends Job {

  constructor(player, puzzle, conditionName, isDone) {
    super(player, puzzle);
    this.conditionName = conditionName;
    this.isDone = isDone;
  }

  act() {

    if (this.player.ladder) {
      this.player.ladder.occupants--;
      delete this.player.ladder;
    }

    this.player.state = PlayerState.RUNNING;
    this.player.x += this.player.speed * (this.player.facingRight ? 1 : -1);

    this.player.snapXToGrid();

    if (this.isDone()) {
      this.player.state = PlayerState.STANDING;
      return true;
    }

    // If player has run off the edge, initiate a fall
    if (!this.player.platform ||
        this.player.facingRight &&
          this.player.x > this.player.platform.x + this.player.platform.len + GRACE_AT_EDGE ||
        !this.player.facingRight && this.player.x < this.player.platform.x - GRACE_AT_EDGE) {
      this.queue(new FallJob(this.player, this.puzzle,
          this.player.speed * (this.player.facingRight ? 1 : -1)));
      return true;
    }
  }

  toString() {
    return "GO UNTIL " + this.conditionName;
  }
}

class GoJob extends GoUntilJob {

  constructor(player, puzzle) {
    super(player, puzzle);

    player.snapXToGrid();

    let destination = player.x;
    if (destination == Math.round(destination)) {
      destination += player.facingRight ? 1 : -1;
    } else {
      destination = player.facingRight
          ? Math.ceil(destination)
          : Math.floor(destination);
    }

    this.isDone = () => {
        return player.x == destination;
      };
  }

  toString() {
    return "GO";
  }
}

const TURN_TIME = 10;
class TurnJob extends Job {

  constructor(player, puzzle) {
    super(player, puzzle);
    this.turned = false;
  }

  act() {

    if (!this.turned && this.ticksSoFar >= TURN_TIME / 2) {
      this.player.facingRight = !this.player.facingRight;
      this.turned = true;
    }

    return this.ticksSoFar >= TURN_TIME;
  }

  toString() {
    return "TURN";
  }
}

const GRAVITY = .01; // grid units per tick per tick
const JUMP_UP_SPEED = .08; // grid units per tick
const JUMP_DOWN_SPEED = .06; // grid units per tick

class JumpUpJob extends Job {

  constructor(player, puzzle) {
    super(player, puzzle);
    this.speed = JUMP_UP_SPEED;
    this.yStart = this.player.y;
    this.fixtures = this.puzzle.fixturesEncountered(player);
  }

  act() {

    if (this.player.ladder) {
      this.player.ladder.occupants--;
      delete this.player.ladder;
    }

    this.player.y += this.speed;
    this.speed -= GRAVITY;

    this.player.state = this.speed >= 0
        ? PlayerState.JUMPING_UP
        : PlayerState.JUMPING_DOWN;

    if (this.speed < GRAVITY * -5) {
      // Look for a ladder
      let ladders = this.fixtures.filter
          (fixture => fixture.type == FixtureType.LADDER && !fixture.moving);
      if (ladders.length != 0) {
        this.queue(new PauseJob(this.player, this.puzzle, 20));
        this.queue(new ClimbJob(this.player, this.puzzle, ladders[0]));
        return true;
      }
    }

    if (this.player.y <= this.yStart) {
      // Back on the platform, call it quits
      this.player.state = PlayerState.STANDING;
      this.player.y = this.yStart;
      return true;
    }
  }

  toString() {
    return "JUMP UP";
  }
}

class JumpDownJob extends Job {

  constructor(player, puzzle) {
    super(player, puzzle);
    this.speed = JUMP_DOWN_SPEED;
    this.yStart = this.player.y;
    this.fixtures = this.puzzle.fixturesEncountered(player);
  }

  act() {

    if (this.player.ladder) {
      this.player.ladder.occupants--;
      delete this.player.ladder;
    }

    this.player.y += this.speed;
    this.speed -= GRAVITY;

    this.player.state = this.speed >= 0
        ? PlayerState.JUMPING_UP
        : PlayerState.JUMPING_DOWN;

    if (this.player.y <= this.yStart) {
      // Look for a chute
      let chutes = this.fixtures.filter
          (fixture => fixture.type == FixtureType.CHUTE && !fixture.moving);
      if (chutes.length != 0) {
        this.queue(new SlideJob(this.player, this.puzzle, chutes[0]));
        return true;
      }

      this.player.y = this.yStart;
      this.player.state = PlayerState.STANDING;
      return true;
    }
  }

  toString() {
    return "JUMP UP";
  }
}

class ClimbJob extends Job {

  constructor(player, puzzle, ladder) {
    super(player, puzzle);
    this.ladder = ladder;

    this.speed = MASTER_SPEED;

    this.ladder.occupants++;
  }

  act() {
    this.player.y += this.speed;
    this.player.state = PlayerState.CLIMBING;

    if (this.player.y >= this.ladder.y + this.ladder.height - CLOSE_ENOUGH) {
      this.player.y = this.ladder.y + this.ladder.height;
      this.player.state = PlayerState.STANDING;
      this.player.ladder = this.ladder;
      return true;
    }
  }

  toString() {
    return "CLIMB LADDER";
  }
}

const SLIDE_GRAVITY = GRAVITY / 2;
const MAX_SLIDE_SPEED = MASTER_SPEED * 2;
class SlideJob extends Job {

  constructor(player, puzzle, chute) {
    super(player, puzzle);
    this.chute = chute;

    this.speed = MASTER_SPEED;

    this.chute.occupants++;
  }

  act() {
    this.player.y -= this.speed;
    this.player.state = PlayerState.SLIDING;
    this.speed += SLIDE_GRAVITY;

    if (this.player.y <= this.chute.y - this.chute.depth + .25) {
      this.queue(new FallJob(this.player, this.puzzle, 0));
      this.chute.occupants--;
      return true;
    }
  }

  toString() {
    return "SLIDE DOWN CHUTE";
  }
}

const GIVE_UP_FOR_DEAD = -.5;
class FallJob extends Job {

  constructor(player, puzzle, xSpeed) {
    super(player, puzzle);
    this.xSpeed = xSpeed;
    this.ySpeed = 0;
    this.yStart = this.player.y;
  }

  act() {
    this.player.x += this.xSpeed;
    this.player.y += this.ySpeed;
    this.player.state = PlayerState.FALLING;

    this.ySpeed -= GRAVITY;

    // Land on next platform?
    for (let platform of this.puzzle.platforms) {
      if (this.player.y < platform.y && this.player.y > platform.y - GRACE_AT_EDGE &&
          platform.y < this.yStart &&
          this.player.x >= platform.x - GRACE_AT_EDGE &&
          this.player.x <= platform.x + platform.len + GRACE_AT_EDGE) {
        this.player.y = platform.y;
        this.player.state = PlayerState.STANDING;
        return true;
      }
    }

    // Fall into the void?
    if (this.player.y < GIVE_UP_FOR_DEAD) {
      this.player.alive = false;
      return true;
    }
  }

  toString() {
    return "FREE FALL";
  }
}

class PushJob extends GoJob {

  constructor(player, puzzle) {
    super(player, puzzle);

    for (let fixture of this.puzzle.fixtures) {
      let { x, y, height, depth, occupants, moving } = fixture;
      if (occupants == 0 && !moving && fixture.pushable &&
        !this.player.facingRight && x == 9 && // only allow one push to the left
        this.player.x == x &&
        (height && this.player.y > y && this.player.y < y + height ||
          depth && this.player.y < y && this.player.y > y - depth)) {
        this.fixture = fixture;
        this.fixture.moving = true;

        let size = height || depth;
        size -= 0;
        if (size > 3) {
          size = 3;
        }

        this.player.speed = [ .028, .025, .022, .02 ][size];
      }
    }
  }

  act() {

    if (this.player.ladder) {
      this.player.ladder.occupants--;
      delete this.player.ladder;
    }

    let done = super.act();

    if (this.fixture) {
      this.player.state = PlayerState.PUSHING;
      this.fixture.x = this.player.x;
      this.fixture.y = Math.floor(this.fixture.y) + .02;
    }

    if (done) {
      this.player.speed = MASTER_SPEED;

      if (this.fixture) {
        if (this.player.jobs.length > 1 &&
            this.player.jobs[1] instanceof FallJob) {
          new FallingFixture(this.puzzle, this.fixture,
            this.player.speed * (this.player.facingRight ? 1 : -1), 0);
        } else {
          this.fixture.y = Math.floor(this.fixture.y);
          this.fixture.moving = false;
        }
      }
    }

    return done;
  }

  toString() {
    return "PUSH";
  }
}


class FallingFixture {

  constructor(puzzle, fixture, xSpeed, ySpeed) {
    this.puzzle = puzzle;
    this.fixture = fixture;
    this.yStart = fixture.getBottom();
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;

    this.fixture.falling = true;
    this.puzzle.clock.subscribe(this);
  }

  tick() {
    this.fixture.x += this.xSpeed;
    this.fixture.y += this.ySpeed;

    this.ySpeed -= GRAVITY;

    for (let platform of this.puzzle.platforms) {
      if (this.fixture.getBottom() < platform.y &&
          this.fixture.getBottom() > platform.y - GRACE_AT_EDGE &&
          platform.y < this.yStart &&
          this.fixture.x >= platform.x - GRACE_AT_EDGE &&
          this.fixture.x <= platform.x + platform.len + GRACE_AT_EDGE) {

        this.fixture.setBottom(platform.y);
        delete this.fixture.falling;
        this.puzzle.clock.unsubscribe(this);
      }
    }

    if (this.fixture.getBottom() < GIVE_UP_FOR_DEAD) {
      this.puzzle.clock.unsubscribe(this);
    }
  }
}


//-----------------------------------------------
// Puzzle

class Puzzle {

  constructor(page, clock) {
    this.fixturesEncountered = this.fixturesEncountered.bind(this);
    this.isAtEdge = this.isAtEdge.bind(this);
    this.isThereA = this.isThereA.bind(this);

    this.definition = page.definition;
    this.clock = clock;
    if (typeof this.definition != "string") {
      throw new Error("No definition.");
    }

    this.repeatsEnabled = page.repeatsEnabled;
    this.goUntilEnabled = page.goUntilEnabled;
    this.pushEnabled = page.pushEnabled;

    this.onStop = function() {};

    this.players = [];
    this.reset(1);
  }

  reset(numberOfPlayers) {
    this.platforms = [];
    this.fixtures = []
    for (let player of this.players) {
      this.clock.unsubscribe(player);
    }
    this.players = [];

    let sections = this.definition.trim().split("|").map(s => s.trim());
    for (let section of sections) {
      let [ type, specList ] = section.split(":").map(s => s.trim());
      type = type.toUpperCase();
      let specs = specList.split(",").map(s => s.trim())
          .map(set => set.split(" ").map(s => parseInt(s)));
      if ("PLATFORMS".startsWith(type)) {
        for (let [x, y, len] of specs) {
          this.platforms.push(new Platform(x, y, len));
        }
      } else if ("LADDERS".startsWith(type)) {
        for (let [x, y, height, pushable ] of specs) {
          let ladder = new Ladder(x, y, height);
          if (pushable) {
            ladder.pushable = true;
          }
          this.fixtures.push(ladder);
        }
      } else if ("CHUTES".startsWith(type)) {
        for (let [x, y, depth] of specs) {
          this.fixtures.push(new Chute(x, y, depth));
        }
      } else if ("GOAL".startsWith(type)) {
        let [ x, y ] = specs[0];
        this.fixtures.push(new Goal(x, y));
      } else if ("START".startsWith(type)) {
        let [x, y, right] = specs[0];
        for (let p = 0; p < numberOfPlayers; ++p) {
          let player = new Player(this, x, y, right != 0);
          this.players.push(player);
          this.clock.subscribe(player);
        }
      } else if ("LIMIT".startsWith(type)) {
        this.limit = specs[0][0];
      } else {
        throw new Error("Unrecognized type: " + type);
      }
    }

    for (let player of this.players) {
      player.setPlatform();
      player.setOnJobDone();
    }
  }

  getPlayerPlatform(player) {
    let { x, y } = player;
    for (let platform of this.platforms) {
      if (y == platform.y && x >= platform.x - GRACE_AT_EDGE &&
          x <= platform.x + platform.len + GRACE_AT_EDGE) {
        return platform;
      }
    }

    //throw new Error("Player not on a platform at " + x + ", " + y);
    return null;
  }

  /**
   * Returns an array of any/all features encountered at the current
   * position. Always an empty array if not currently at a whole-number
   * coordinate. Can return multiple features: ladder and chute,
   * ladder and end of platform, etc.
   */
  fixturesEncountered(player) {
    return this.fixtures.filter(fixture =>
        fixture.x == player.x && fixture.y == player.y);
  }

  isThereA(type, player) {
    return this.fixturesEncountered(player)
        .filter(fixture => fixture.type == type)
        .length != 0;
  }

  isAtEdge(player) {
    let platform = player.platform;
    return player.facingRight
      ? player.x >= platform.x + platform.len
      : player.x <= platform.x;
  }

  win(player) {
    this.onStop(true);

    for (let winner of this.players) {
      if (winner.alive) {
        winner.jumpUp();
        winner.jumpUp();
        winner.jumpUp();
      }
    }
  }

  lose() {
    this.onStop(false);
  }
}

///////////////////////////////////////////////////////////
// LANGUAGE

const PAUSE_BETWEEN_INSTRUCTIONS = 8;

class CnLSyntaxError extends Error {
  constructor(message, lineNumber) {
    super(message);
    this.lineNumber = lineNumber;
  }
}

class Instruction {
  constructor(lineNumber, context, code) {
    this.lineNumber = lineNumber;
    this.context = context;
    this.code = code;
  }

  run(onDone) {
    if (typeof this.context.onRunning == "function") {
      this.context.onRunning(this.lineNumber, this);
    }
    this.work(onDone);
  }
}

class GoUntilInstruction extends Instruction {
  constructor(lineNumber, context, type, code) {
    super(lineNumber, context, code);
    this.type = type;
  }

  work(onDone) {
    this.context.player.goUntil(this.type, onDone);
  }
}

class GoUntilEdgeInstruction extends GoUntilInstruction {
  work(onDone) {
    this.context.player.goUntilEdge(onDone);
  }
}

class GoUntilAnythingInstruction extends GoUntilInstruction {
  work(onDone) {
    this.context.player.goUntilAnything(onDone);
  }
}

class GoInstruction extends Instruction {
  work(onDone) {
    this.context.player.go(onDone);
  }
}

class TurnInstruction extends Instruction {
  work(onDone) {
    this.context.player.turn(onDone);
  }
}

class JumpInstruction extends Instruction {
}

class JumpUpInstruction extends JumpInstruction {
  work(onDone) {
    this.context.player.jumpUp(onDone);
  }
}

class JumpDownInstruction extends JumpInstruction {
  work(onDone) {
    this.context.player.jumpDown(onDone);
  }
}

class PushInstruction extends Instruction {
  work(onDone) {
    this.context.player.push(onDone);
  }
}

class Block extends Instruction {

  constructor(lines, lineNumber, context) {
    super(lineNumber, context);

    this.next = this.next.bind(this);
    this.tick = this.tick.bind(this);

    this.context = context;
    this.instructions = [];

    let block = this.instructions;
    let goUntilEnabled = this.context.puzzle.goUntilEnabled;
    let repeatsEnabled = this.context.puzzle.repeatsEnabled;
    let pushEnabled = this.context.puzzle.pushEnabled;

    for (let num = 0; num < lines.length; ++num) {
      let line = lines[num];
      ++lineNumber;

      //TODO prohibit leading whitespace

      line = line.trim().replace(/[ \t]+/g, " ");
      if (line.length != 0 && !line.startsWith("#")) {
        if (goUntilEnabled && line.startsWith("GO UNTIL")) {
          let remainder = line.substring("GO UNTIL".length);
          let thing = remainder.charAt(0) == " " ? remainder.trim() : "";
          if (thing in FixtureType) {
            block.push(new GoUntilInstruction(lineNumber, this.context, FixtureType[thing], line));
          } else if (thing == EDGE) {
            block.push(new GoUntilEdgeInstruction(lineNumber, this.context, line));
          } else if (thing == ANYTHING) {
            block.push(new GoUntilAnythingInstruction(lineNumber, this.context, line));
          } else {
            throw new CnLSyntaxError
                ("You can GO UNTIL " + LIST_BOUNDARIES, lineNumber);
          }
        } else if (line == "GO") {
          block.push(new GoInstruction(lineNumber, this.context, line));
        } else if (pushEnabled && line == "PUSH") {
          block.push(new PushInstruction(lineNumber, this.context, line));
        } else if (line == "TURN") {
          block.push(new TurnInstruction(lineNumber, this.context, line));
        } else if (line.startsWith("JUMP")) {
          let remainder = line.substring("JUMP".length);
          let direction = remainder.charAt(0) == " " ? remainder.trim() : "";
          if (direction == "UP") {
            block.push(new JumpUpInstruction(lineNumber, this.context, line));
          } else if (direction == "DOWN") {
            block.push(new JumpDownInstruction(lineNumber, this.context, line));
          } else {
            throw new CnLSyntaxError
                ("You can JUMP UP or DOWN.", lineNumber);
          }
        } else if (repeatsEnabled && line.startsWith("REPEAT UNTIL")) {
          let remainder = line.substring("REPEAT UNTIL".length);
          let what = remainder.charAt(0) == " " ? remainder.trim() : "";
          if (what in FixtureType || what == EDGE || what == ANYTHING) {
            let indented = this.gatherIndentedLines(lines, num, lineNumber);
            block.push(new RepeatUntil
                (indented, lineNumber, this.context, what));
            num += indented.length;
            lineNumber += indented.length;
          } else {
            throw new CnLSyntaxError
                ("You can REPEAT UNTIL " + LIST_BOUNDARIES, lineNumber);
          }
        } else if (repeatsEnabled && line.startsWith("REPEAT")) {
          let remainder = line.substring("REPEAT".length);
          let how = remainder.charAt(0) == " " ? remainder.trim() : "";
          if (how.endsWith("TIMES")) {
            let indented = this.gatherIndentedLines(lines, num, lineNumber);
            let middle = how.substring(0, how.length - "TIMES".length).trim();
            if (middle.length != 0) {
              let reps = -1;
              try {
                reps = parseInt(middle);
              } catch (err) {
                throw new CnLSyntaxError
                    ("REPEAT <1-9> TIMES", lineNumber);
              }

              if (reps > 0 && reps < 10) {
                block.push(new RepeatNTimes
                    (indented, lineNumber, this.context, reps));
                num += indented.length;
                lineNumber += indented.length;
              } else {
                throw new CnLSyntaxError
                    ("REPEAT <1-9> TIMES", lineNumber);
              }
            } else {
              throw new CnLSyntaxError
                  ("REPEAT <1-9> TIMES", lineNumber);
            }
          } else {
            throw new CnLSyntaxError
                ("You can REPEAT N TIMES or REPEAT UNTIL.", lineNumber);
          }
        } else {
          let catalog = "You can GO, ";
          if (goUntilEnabled) {
            catalog += "GO UNTIL, ";
          }
          catalog += "TURN, ";
          if (pushEnabled) {
            catalog += "PUSH, ";
          }
          if (repeatsEnabled) {
            catalog += "JUMP, and REPEAT.";
          } else {
            catalog += "and JUMP.";
          }

          throw new CnLSyntaxError(catalog, lineNumber);
        }
      }
    }
  }

  gatherIndentedLines(lines, startingPoint, lineNumber) {
    let indentedLines = [];
    let probe = startingPoint + 1;
    while (probe < lines.length && lines[probe].startsWith(" ")) {
      indentedLines.push(lines[probe++]);
    }

    if (indentedLines.length != 0 &&
        indentedLines.filter(line => line.trim().length != 0).length != 0) {

      let indent = "";
      let firstNonBlankLine =
          indentedLines.filter(line => line.trim().length != 0)[0];
      let found = false;
      for (let i = 0; !found && i < firstNonBlankLine.length; ++i) {
        let c = firstNonBlankLine.charAt(i);
        if (c == " ") {
          indent += " ";
        } else {
          found = true;
        }
      }

      return indentedLines.map(line => {
          if (line.startsWith(indent)) {
            return line.replace(indent, "");
          } else {
            throw new CnLSyntaxError
              ("All following lines must have the same indent", startingPoint);
          }
        });
    } else {
      throw new CnLSyntaxError
          ("There must be least one indented instruction.", startingPoint);
    }
  }

  work(onDone) {
    this.current = 0;
    this.onDone = onDone;
    this.next();
  }

  next() {
    if (this.current < this.instructions.length) {
      this.instructions[this.current].run(inst => {
          ++this.current;
          if (!this.context.canceled) {
            this.timer = PAUSE_BETWEEN_INSTRUCTIONS;
            this.context.clock.subscribe(this);
          }
        });
    } else {
      if (typeof this.onDone == "function") {
        this.onDone(this);
      }
    }
  }

  tick() {
    if (--this.timer == 0) {
      this.context.clock.unsubscribe(this);
      this.next();
    }
  }
}

class RepeatNTimes extends Block {

  constructor(lines, lineNumber, context, reps) {
    super(lines, lineNumber, context);
    this.reps = reps;
  }

  work(onDone) {
    this.completed = 0;
    this.repeat(onDone);
  }

  repeat(onDone) {
    super.work(() => {
        ++this.completed;
        if (this.completed == this.reps) {
          onDone();
        } else {
          this.repeat(onDone);
        }
      });
  }
}

class RepeatUntil extends Block {

  constructor(lines, lineNumber, context, type) {
    super(lines, lineNumber, context);
    this.type = type;
  }

  work(onDone) {
    super.work(() => {
        if (this.type in FixtureType &&
              this.context.puzzle.isThereA(FixtureType[this.type], this.context.player) ||
            this.type == EDGE &&
              this.context.puzzle.isAtEdge(this.context.player) ||
            this.type == ANYTHING &&
              this.context.puzzle.fixturesEncountered(context.player).length != 0) {
          onDone();
        } else {
          this.work(onDone);
        }
      });
  }
}

class Program extends Block {
  constructor(code, puzzle, player, clock, onRunning) {
    super(code.toUpperCase().split("\n"), 0, {
        puzzle: puzzle,
        player: player,
        clock: clock,
        onRunning: onRunning || function(line, instruction) {}
      });
  }

  run(onDone) {
    this.work(() => {
        onDone();

        // Only "win" if you find the goal at the end of your program;
        // i.e. you can't win by accident.
        if (this.context.puzzle.isThereA(FixtureType.GOAL, this.context.player)) {
          this.context.puzzle.win(this.context.player);
        } else {
          this.context.puzzle.lose();
        }
      });
  }

  cancel() {
    this.context.canceled = true;
  }
}

///////////////////////////////////////////////////////////
// UI

const MARGIN_LEFT = 120; // px -- to center of first sq.
const MARGIN_TOP = 80; // px -- to top of top platform
const GRID_WIDTH = 80; // px
const GRID_HEIGHT = 80; // px

const LADDER_RISE = GRID_HEIGHT / 4;
const CHUTE_RISE = GRID_HEIGHT / 5;

const ANIMATION_PACE = 4;

const PLAYER_Z_BASE = 1;
const FIXTURE_Z_BASE = {};
FIXTURE_Z_BASE[FixtureType.CHUTE] = 10;
FIXTURE_Z_BASE[FixtureType.LADDER] = 11;
FIXTURE_Z_BASE[FixtureType.GOAL] = 1;

const PLAYER_Z_FRONT = 100;
const FIXTURE_Z_FRONT = {};
FIXTURE_Z_FRONT[FixtureType.CHUTE] = 110;
FIXTURE_Z_FRONT[FixtureType.LADDER] = 111;
FIXTURE_Z_FRONT[FixtureType.GOAL] = 101;

const PROGRAM_ID = "program";
const NAME_ID = "name";
const CODE_ID = "code";
const ERROR_ID = "error";
const STATUS_ID = "status";
const PUZZLE_ID = "puzzle";
const RUN_ID = "run";
const CANCEL_ID = "cancel";
const RESET_ID = "reset";
const BACK_ID = "back";
const NEXT_ID = "next";

//-----------------------------------------------
// Player and Puzzle Views

function getFallingOpacity(y) {
  return "" + Math.min((y - GIVE_UP_FOR_DEAD) / (1 - GIVE_UP_FOR_DEAD), 1.0)
}

class PlayerView {

  constructor(puzzle, playerIndex, levels, offsets) {
    this.puzzle = puzzle;
    this.playerIndex = playerIndex;
    this.levels = levels;
    this.offsets = offsets;

    this.animationPace = ANIMATION_PACE;
    this.imgTimer = this.animationPace;
    this.imgNum = 1;
  }

  buildPlayer(root) {
    this.playerDiv = document.createElement("div");
    this.playerDiv.classList.add("player");
    this.playerDiv.style.backgroundSize = "30px 50px";
    root.appendChild(this.playerDiv);
  }

  getPlayer() {
    return this.puzzle.players[this.playerIndex];
  }

  getImage() {
    let state = this.getPlayer().state;
    let suffix = "";

    // Asymmetric
    if (state == PlayerState.STANDING || state == PlayerState.RUNNING) {
      suffix += this.getPlayer().facingRight ? "R" : "L";
    }

    // Animated
    if (state == PlayerState.RUNNING || state == PlayerState.CLIMBING ||
        state == PlayerState.FALLING) {
      suffix += "" + this.imgNum;
    }

    return "url('img/Player" + (this.playerIndex == 0 ? "1" : "2")  +
        "/" + state + suffix + ".png')";
  }

  update() {
    let player = this.getPlayer();

    this.playerDiv.style.top = "" + (this.offsets.y +
        GRID_HEIGHT * (this.levels - player.y) -
        getDimension(this.playerDiv, "height")) + "px";
    this.playerDiv.style.left = "" + (this.offsets.x +
        GRID_WIDTH * (player.x - 1) -
        getDimension(this.playerDiv, "width") / 2) + "px";

    this.playerDiv.style.opacity = getFallingOpacity(player.y);
    this.playerDiv.style.backgroundImage = this.getImage();
    this.playerDiv.style.zIndex =
        (player.state == PlayerState.JUMPING_DOWN ||
         player.state == PlayerState.CLIMBING ||
         player.state == PlayerState.SLIDING ||
         player.state == PlayerState.FALLING)
      ? PLAYER_Z_FRONT
      : PLAYER_Z_BASE;

    this.animationPace = player.state == PlayerState.RUNNING
      ? ANIMATION_PACE - 1
      : (player.state == PlayerState.FALLING
        ? ANIMATION_PACE + 1
        : ANIMATION_PACE);
  }

  tick() {
    this.update();

    if (--this.imgTimer == 0) {
      this.imgNum = 3 - this.imgNum;
      this.imgTimer = this.animationPace;
    }
  }
}

class PuzzleView {

  constructor(puzzle, goalImage) {

    this.resetPlayerViews = this.resetPlayerViews.bind(this);
    this.onPuzzleStop = this.onPuzzleStop.bind(this);

    this.root = document.getElementById(PUZZLE_ID);
    this.puzzle = puzzle;
    this.goalImage = goalImage;

    this.levels = 0;
    for (let platform of this.puzzle.platforms) {
      if (platform.y > this.levels) {
        this.levels = platform.y;
      }
    }

    this.offsets = this.root.getBoundingClientRect();
    this.offsets.x += MARGIN_LEFT + getDimension(this.root, "border-width");
    this.offsets.y += MARGIN_TOP + getDimension(this.root, "border-width");

    this.counter = 0;
    this.buildPuzzle();
    this.resetPlayerViews();
  }

  resetPlayerViews() {
    this.playerViews = []
    this.root.querySelectorAll(".player").forEach(elem => elem.remove());
    for (let index = this.puzzle.players.length - 1; index >= 0; --index) {
      let view = new PlayerView(this.puzzle, index, this.levels, this.offsets);
      this.playerViews.push(view);
      view.buildPlayer(this.root);
      view.update();
    }
  }

  locateFixtures() {
    for (let index = 0; index < this.fixtureDivs.length; ++index) {
      let fixture = this.puzzle.fixtures[index];
      let div = this.fixtureDivs[index];

      let top = this.offsets.y + GRID_HEIGHT * (this.levels - fixture.y);
      let height = -1;

      if (fixture instanceof Ladder) {
        top -= GRID_HEIGHT * fixture.height + LADDER_RISE;
        height = GRID_HEIGHT * (fixture.height - .1); //TODO magic
        div.style.top = "" + top + "px";
        div.style.opacity = fixture.falling ? getFallingOpacity(fixture.getBottom()) : "1.0";
      } else if (fixture instanceof Chute) {
        top -= CHUTE_RISE;
        div.style.top = "" + top + "px";
        div.style.opacity = fixture.falling ? getFallingOpacity(fixture.getBottom()) : "1.0";
      } else if (fixture instanceof Goal) {
        const floatMagnitude = 6;
        top -= (GRID_HEIGHT + getDimension(div, "height")) / 2;
        if (this.counter % 25 == 0) {
          top += floatMagnitude * Math.sin(Math.PI * this.counter / 250);
          div.style.top = "" + top + "px";
        }
      } else {
        throw new Error("Unknown fixture type:" + fixture.type);
      }

      if (height != -1) {
        div.style.height = "" + height + "px";
      }

      div.style.left = "" + (this.offsets.x +
          GRID_WIDTH * (fixture.x - 1) - (getDimension(div, "width") / 2)) + "px";

      div.style.zIndex = fixture.falling
        ? FIXTURE_Z_FRONT[fixture.type]
        : FIXTURE_Z_BASE[fixture.type];
    }

    this.counter = (this.counter + 1) % 500;
  }

  buildPuzzle() {

    for (let platform of this.puzzle.platforms) {
      let div = document.createElement("div");
      div.classList.add("platform");
      this.root.appendChild(div);

      div.style.top = "" + (this.offsets.y +
          GRID_HEIGHT * (this.levels - platform.y)) + "px";
      div.style.left = "" + (this.offsets.x +
          GRID_WIDTH * (platform.x - 1.5)) + "px";
      div.style.width = "" + GRID_WIDTH * (platform.len + 1) + "px";
    }

    this.fixtureDivs = [];
    for (let fixture of this.puzzle.fixtures) {
      let div = document.createElement("div");
      div.classList.add("fixture");
      div.classList.add(fixture.type.toLowerCase());
      if (fixture.type == FixtureType.CHUTE) {
        div.classList.add(fixture.type.toLowerCase() + fixture.depth);
      }
      this.root.appendChild(div);
      this.fixtureDivs.push(div);

      if (fixture.type == FixtureType.GOAL) {
        this.goalDiv = div;
        if (typeof this.goalImage != "undefined") {
          this.goalDiv.style.backgroundImage =
              "url('img/Puzzle/Goal/" + this.goalImage + ".png')"
        }
      }

    }

    this.locateFixtures();
  }

  tick() {
    for (let view of this.playerViews) {
      view.tick();
    }
    this.locateFixtures();
  }

  onPuzzleStop(won) {
    if (won) {
      if ("goalDiv" in this) {
        let opacity = 1.0;
        let fadeTimer = setInterval(() => {
            opacity -= .05;
            this.goalDiv.style.opacity = "" + opacity;
            if (opacity <= 0) {
              clearInterval(fadeTimer);
            }
          }, 25);
      }
    }
  }

  reset(numberOfPlayers) {
    this.puzzle.reset(numberOfPlayers);
    this.resetPlayerViews();

    if ("goalDiv" in this) {
      this.goalDiv.style.opacity = 1.0;
    }
  }
}

//-----------------------------------------------
// Editor and Program UIs

const RUN_PROGRAM_COMMAND = "RunProgram";
const CANCEL_COMMAND = "Cancel";

class EditorUI {

  constructor(puzzle, playerIndex, clock, starter, runCmd, cancelCmd) {

    this.initToSave = this.initToSave.bind(this);
    this.initToLoad = this.initToLoad.bind(this);
    this.loadTeammateCode = this.loadTeammateCode.bind(this);
    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);

    this.puzzle = puzzle;
    this.playerIndex = playerIndex;
    this.clock = clock;

    this.nthChild = function(n) {
      return document.querySelector("#" + PROGRAM_ID + (playerIndex + 1) +
        " div:nth-child(" + n + ")");
    }

    let codeDiv = this.nthChild(1);
    this.errorDiv = this.nthChild(2);
    this.statusDiv = this.nthChild(3);

    this.editor = ace.edit(codeDiv.id);

    this.editor.getSession().setUndoManager(new ace.UndoManager());
    this.editor.setTheme("ace/theme/eclipse");
    this.editor.setOptions({ fontSize: "12pt", tabSize: 2 });

    this.editor.commands.addCommand({
        name: RUN_PROGRAM_COMMAND,
        exec: runCmd,
        bindKey: {mac: "cmd-enter", win: "ctrl-enter"}
      });
    this.editor.commands.addCommand({
        name: CANCEL_COMMAND,
        exec: cancelCmd,
        bindKey: {mac: "escape", win: "escape"}
      });

    this.errorDiv.style.fontSize = this.editor.getFontSize();
    this.statusDiv.style.fontSize = this.editor.getFontSize();

    if (typeof starter == "string") {
      this.editor.setValue(starter, 1);
    }

    this.editor.session.setMode(null);
    this.editor.focus();
  }

  initToSave(saveTriggers) {
    this.autoSaver = new AceAutoSaver(this.editor, saveTriggers);
  }

  loadTeammateCode(teamCode, teammateID) {
    if (!this.running) {
      this.storage.loadTeammate(getDefaultPageID(), teamCode,
          teammateID, data => { this.editor.setValue(data, 1); });
    }
  }

  initToLoad(teamCode, teammateID) {
    this.editor.setReadOnly(true);
    this.storage = new Storage();

    this.loadTeammateCode(teamCode, teammateID);
    setInterval(() => this.loadTeammateCode(teamCode, teammateID), 5000);
  }

  showError(message, lineNumber) {
    if (typeof lineNumber == "number") {
      this.editor.gotoLine(lineNumber, Infinity);
    }

    this.errorDiv.style.display = "block";
    this.errorDiv.textContent = message;
  }

  showStatus(message) {
    this.statusDiv.style.display = "block";
    this.statusDiv.textContent = message;
  }

  select(lineNumber) {
    let range = {
        start: { row: lineNumber - 1, column: 0 },
        end: { row: lineNumber, column: 0 }
      };
    this.editor.selection.setRange(range);
  }

  deselect() {
    let range = this.editor.selection.getRange();
    range.start.row = range.end.row;
    range.start.column = range.end.column;
    this.editor.selection.setRange(range);
  }

  runProgram() {
    this.errorDiv.style.display = "none";
    this.statusDiv.style.display = "none";

    if (this.autoSaver) {
      this.autoSaver.save();
    }

    try {
      let code = this.editor.getValue();
      let count = code.split("\n")
          .filter(line => line.trim().length != 0)
          .length;
      if ("limit" in this.puzzle && count > this.puzzle.limit) {
        this.showError("There is a limit of " + this.puzzle.limit +
            " instructions for this puzzle.");
        return;
      }

      this.running = true;
      this.editor.setReadOnly(true);

      this.program = new Program(code, this.puzzle,
          this.puzzle.players[this.playerIndex], this.clock, this.select);
      this.program.run(this.deselect);
    } catch (err) {
      if (err instanceof CnLSyntaxError) {
        this.showError(err.message, err.lineNumber);
        this.kill();
      } else {
        console.log(err);
      }
    }
  }

  kill() {
    delete this.program;

    this.running = false;
    if (!this.storage) {
      this.editor.setReadOnly(false);
    }
  }

  cancel() {
    if ("program" in this) {
      this.program.cancel();
      this.kill();
      this.showStatus("Canceled.");
    }
  }
}

class ProgramUI {

  constructor(puzzle, view, clock, starters) {
    this.runProgram = this.runProgram.bind(this);
    this.cancel = this.cancel.bind(this);
    this.reset = this.reset.bind(this);
    this.onStop = this.onStop.bind(this);

    this.puzzle = puzzle;
    this.view = view;
    this.clock = clock;
    this.programs = [];

    this.runButton = document.getElementById(RUN_ID);
    this.cancelButton = document.getElementById(CANCEL_ID);
    this.resetButton = document.getElementById(RESET_ID);

    this.runButton.onclick = this.runProgram;
    this.cancelButton.onclick = this.cancel;
    this.resetButton.onclick = this.reset;

    this.puzzle.onStop = this.onStop;

    this.editorUIs = [
        new EditorUI(puzzle, 0, this.clock, null, this.runProgram, this.cancel)
      ];
    this.editorUIs[0].initToSave([ this.runButton ]);

    setInterval(() => {
        if (!this.editorUIs[0].running) {
          let shadow = sessionStorage.getItem("shadowID"); console.log(shadow);
          fetch(getBasePath() + "REST/Work/" + getDefaultPageID() + "/All" +
              (shadow ? "?shadow=" + shadow : ""))
            .then(checkFor200)
            .then(response => response.json())
            .then(allCode => { this.programs = allCode; })
            .catch(console.log);
        }
      }, 5000);
  }

  runProgram() {
    this.view.reset(this.programs.length + 1);

    for (let editorUI of this.editorUIs) {
      editorUI.runProgram();
    }

    this.runningPrograms = [];
    for (let p = 0; p < this.programs.length; ++p) {
      try {
        let runningProgram = new Program(this.programs[p],
          this.puzzle, this.puzzle.players[p + 1], this.clock, () => {});
        runningProgram.run(() => {});
        this.runningPrograms.push(runningProgram);
      } catch (err) {
        console.log(err);
      }
    }
  }

  cancel() {
    for (let editorUI of this.editorUIs) {
      editorUI.cancel();
    }
  }

  reset() {
    this.cancel();
    this.view.reset(this.programs.length + 1);
  }

  onStop(won) {
    for (let editorUI of this.editorUIs) {
      editorUI.kill();
    }

    this.view.onPuzzleStop(won);
  }
}

///////////////////////////////////////////////////////////
// PAGES

const page = {
    name: "Puzzle11.html",
    definition: "plat: 1 1 9, 1 2 8, 1 3 2, 5 3 4, 1 4 2, 5 4 0, 7 4 2, 1 5 8, 11 5 0, 2 6 6, 2 7 6, 2 8 7, 1 9 9 | " +
                "lad: 2 1 1, 8 1 3, 2 2 1, 5 2 2, 2 3 1, 2 4 1, 8 4 3, 2 6 1, 6 6 3, 2 7 1, 9 7 2 1 | " +
                "chu: 1 2 1, 1 3 1, 1 4 1, 9 4 3, 1 5 1, 4 5 1, 6 5 1, 3 6 1, 5 6 2, 7 6 1, 4 9 3, 1 9 1, 10 9 1 | " +
                "start: 5 1 0",
    repeatsEnabled: true,
    goUntilEnabled: true,
    pushEnabled: true
  };

export class Page {
  constructor() {
    window.onload = function() {

        let clock = new Clock(25);
        let puzzle = new Puzzle(page, clock);

        let statement = getShadowingStatement();
        if (statement) {
          let title = document.querySelector("h2 span");
          title.textContent = title.textContent + " -- " + statement;
        }

        let view = new PuzzleView(puzzle, page.goal);
        clock.subscribeView(view);

        new ProgramUI(puzzle, view, clock, page.examples);
        window.onresize();

        if (sessionStorage.getItem("tracking")) {
          pollAndFollow();
        }
      };

    window.onresize = function() {
        const MARGIN = 20;

        let height = document.body.clientHeight;

        let h2 = document.querySelector("h2");
        let headerHeight = getDimension(h2, "height") +
            getDimension(h2, "borderWidth") + getDimension(h2, "margin");

        for (let n = 1; n < 10; ++n) { // 9 players seems a reasonable max
          let program = document.getElementById(PROGRAM_ID + n);
          if (program) {
            program.style.height = "" + (height - headerHeight -
                getDimension(program, "borderWidth") * 2 - MARGIN) + "px";
          }
        }
      };
  }
}
