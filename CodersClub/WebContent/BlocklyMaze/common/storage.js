/**
 * Really junky hack to mock localStorage and pipe it
 * to Coders'-Club server-side storage:
 * ONLY use this with the embedded Blockly Maze game,
 * because this code doesn't cover the full Storage interface --
 * only the [] get/set usage in the game's code.
 *
 * @author Will Provost
 */

import { Storage } from "../../js/save.js";

(function() {
  var storage = new Storage();
  var baseID = "BlocklyMaze:";

  var handler =
  {
    get: function(target, ID, receiver)
      {
        return storage.loadNow(baseID + ID, null);
      },
    set: function(target, ID, value, receiver)
      {
        return storage.save(baseID + ID, value);
      }
  };

  localStorage.__proto__ = new Proxy({}, handler);
})();
