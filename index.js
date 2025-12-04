/**
 * Base config: 3 pegs and 5 discs
 * pegs
 * pegCount
 * disc
 * discCount
 * moveCount
 * winningState
 * 
 * Example board
 * {
 *   pegs: [
 *     { discs: [ { value: 5 }, { value: 4 }, { value: 3 }, { value: 2 }, { value: 1 } ] },
 *     { discs: [] },
 *     { discs: [] }
 *   ]
 * }
 * 
 * Example game
 * start
 * end
 * restart
 * hasActiveGame (boolean)
 * instance of a board?
 * need to be able to pass in a number of pegs and discs to start a board
 */

const disc = (value) => {
  return { value };
}

const peg = () => {
  const discs = [];

  const getDiscs = () => {
    return {
      discs: discs.map(disc => disc.value )
    }
  }

  const addDisc = (value) => {
    discs.push(disc(value));
  }

  const removeDisc = () => {
    return {
      disc: discs.pop()
    }
  }

  const checkDiscOrder = (winningCondition) => {
    const results = discs.map((disc, idx) => {
      let result;
      if (disc.value === winningCondition?.[idx].value) {
        result = true;
      } else {
        result = false;
      }
      return result;
    });
    if (!results.includes(false)) {
      return true;
    }

    return false;
  }
  
  return {
    discs,
    addDisc,
    getDiscs,
    removeDisc,
    checkDiscOrder
  };
};

const board = (pegCount, discCount) => {
  let moveCount = 0;
  let winningState = false;
  const winningCondition = [];
  const pegs = [];

  const getPotentialPeg = () => {
    // Get a sub-array of pegs excluding peg1.
    const otherPegs = pegs.slice(1);

    // Find if a peg has all of the discs.
    const filteredPegs = otherPegs.filter(peg => peg.discs.length === discCount);
    
    return filteredPegs?.[0];
  }

  const checkWinningState = () => {
    let hasCorrectOrder = false; // Assume false unless proven otherwise.
    const isPeg1Empty = pegs[0].discs.length === 0;
    const potentialPeg = getPotentialPeg();
    
    // Check if the peg has the correct order or discs
    if (potentialPeg) {
      hasCorrectOrder = potentialPeg.checkDiscOrder(winningCondition);
    }
    
    if (potentialPeg && isPeg1Empty && hasCorrectOrder) {
      winningState = true;
      return winningState;
    }
    return false;
  }

  // Display the current state of the board.
  const get = () => {
    return {
      pegs: pegs.map(peg => peg.getDiscs())
    };
  };

  const checkMove = (sourcePegIdx, destPegIdx) => {
    const sourcePeg = pegs[sourcePegIdx];
    const sourceDisc = sourcePeg.discs[sourcePeg.discs.length - 1];
    const destinationPeg = pegs[destPegIdx];
    const destDisc = destinationPeg.discs[destinationPeg.discs.length - 1];

    if (!sourceDisc) {
      return {
        error: "Nothing changed... Did you pick a peg with a disc?"
      }
    }

    if (sourcePegIdx === destPegIdx) {
      return {
        error: "Nothing changed... You just moved the disc to the same peg..."
      };
    }
    
    if(sourcePeg.discs.length === 0) {
      return {
        error: "Sorry. You can't move a disc that doesn't exist."
      }
    }

    if (sourceDisc?.value > destDisc?.value) {
      return {
        error: "Sorry. You can't move a larger disc on top of a smaller disc."
      }
    }

    return {
      message: `Moving disc from ${sourcePegIdx + 1} to ${destPegIdx + 1}`
    }
  }

  // move a disc from one peg to another
  const move = (sourcePeg, destinationPeg) => {
    moveCount++;

    const checkMoveResults = checkMove(sourcePeg, destinationPeg);

    if (checkMoveResults?.error) {
      return {
        message: checkMoveResults.error,
        board: get(),
        moveCount,
        winningState: checkWinningState()
      }
    }

    const { disc } = pegs[sourcePeg].removeDisc();
    pegs[destinationPeg].addDisc(disc.value);
    
    return {
      message: checkMoveResults.message,
      board: get(),
      moveCount,
      winningState: checkWinningState()
    }
  }

  const start = () => {
    for (let i = 0; i < pegCount; i++) {
      pegs.push(peg());
      
      if (i === 0) {
        for (let j = discCount; j !== 0; j--) {
          winningCondition.push({ value: j }); // build winning condition dynamically
          
          pegs[i].addDisc(j);
        }
      }
    }

    return {
      message: "Starting a new game. 👾",
      board: get(),
      moveCount,
      winningState: checkWinningState(),
    }
  }

  return {
    getMoveCount: () => moveCount,
    checkWinningState,
    getWinningState: () => winningState,
    get,
    move,
    start
  };
};

const game = () => {
  let newBoard;
  let isRunning = true;
  let winCount = 0;
  let gameStart;
  let gameStop;

  const move = (sourcePegIdx, destinationPegIdx) => {
    if (!isRunning) {
      return { message: 'No more moves. The game is over!'}; // future prompt to start new game
    }
    
    const results = newBoard.move(sourcePegIdx, destinationPegIdx);

    if (results?.winningState) {
      winCount++;
      isRunning = false;
      gameStop = new Date();
    }

    return {
      ...results
    }
  }
  // potentially get and set for peg and disc count?
  // If the game is over because of a winning condition or exiting, how does that work?
  
  const start = (pegs, discs) => {
    gameStart = new Date();
    newBoard = board(pegs, discs);
    const results = newBoard.start();

    return {
      ...results
    }
  }

  const end = () => {
    newBoard = null;
    isRunning = false;
    gameStop = new Date();

    return {
      message: "game over",
      duration: {gameStop, gameStart},
    }
  }

  return {
    end,
    getWinCount: () => winCount,
    isRunning: () => isRunning,
    move,
    start,
  };
}

let totalWins = 0;

// Example win
const winningGame = () => {
  const game1 = game();
  game1.start(3, 5);
  game1.move(0,0);
  game1.move(0,1);
  game1.move(0,1);
  game1.move(0,2);
  game1.move(1,2);
  game1.move(0,1);
  game1.move(2,0);
  game1.move(2,1);
  game1.move(0,1);
  game1.move(0,2);
  game1.move(1,2);
  game1.move(1,0);
  game1.move(2,0);
  game1.move(1,2);
  game1.move(0,1);
  game1.move(0,2);
  game1.move(1,2);
  game1.move(0,1);
  game1.move(2,1);
  game1.move(2,0);
  game1.move(1,2);
  game1.move(0,1);
  game1.move(2,1);
  game1.move(2,0);
  game1.move(1,2);
  game1.move(1,0);
  game1.move(2,0);
  game1.move(2,1);
  game1.move(0,1);
  game1.move(0,2);
  game1.move(1,2);
  game1.move(0,1);
  game1.move(2,0);
  game1.move(2,1);
  game1.move(0,1);
}
winningGame();

// game loop
// If !game.isRunning(), return;
// if game1.getWinCount() totalWins++;

// Potential option for running in the Node REPL
// import repl from 'node:repl';

// function byThePowerOfTwo(number) {
//   return number * number;
// }

// function myEval(code, context, replResourceName, callback) {
//   if (isNaN(code)) {
//     callback(new Error(`${code.trim()} is not a number`));
//   } else {
//     callback(null, byThePowerOfTwo(code));
//   }
// }

// repl.start({ prompt: 'Enter a number: ', eval: myEval });

export { totalWins, game }