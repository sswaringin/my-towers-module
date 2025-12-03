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

// let hasActiveGame = false;

// const start = () => {
//   hasActiveGame = true;

//   while(hasActiveGame) {
//     console.log('The game is active.');
//   }
// }

// const end = () => {
//   console.log('Ending game.');
//   hasActiveGame = false;
// }
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
  const winningState = false;
  const winningCondition = [];
  const pegs = [];

  const getWinningState = () => {
    return winningState;
  };

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
      console.log('YOU HAVE WON!');
      return;
    }
    console.log('You have not yet won.');
  }

  // Display the current state of the board.
  const get = () => {
    for (const peg in pegs) {
      const { discs } = pegs[peg].getDiscs();
      console.log(discs);
    }
  };

  const checkMove = (sourcePegIdx, destPegIdx) => {
    const sourcePeg = pegs[sourcePegIdx];
    const sourceDisc = sourcePeg.discs[sourcePeg.discs.length - 1];
    const destinationPeg = pegs[destPegIdx];
    const destDisc = destinationPeg.discs[destinationPeg.discs.length - 1];

    if (!sourceDisc) {
      return {
        error: "\nNothing changed... Did you pick a peg with a disc?\n"
      }
    }

    if (sourcePegIdx === destPegIdx) {
      return {
        error: "\nNothing changed... You just moved the disc to the same peg...\n"
      };
    }
    
    if(sourcePeg.discs.length === 0) {
      return {
        error: "\nSorry. You can't move a disc that doesn't exist.\n"
      }
    }

    if (sourceDisc?.value > destDisc?.value) {
      return {
        error: "\nSorry. You can't move a larger disc on top of a smaller disc.\n"
      }
    }

    return {
      message: `\nMoving disc from ${sourcePegIdx + 1} to ${destPegIdx + 1}\n`
    }
  }

  // move a disc from one peg to another
  const move = (sourcePeg, destinationPeg) => {
    const checkMoveResults = checkMove(sourcePeg, destinationPeg);

    if (checkMoveResults?.error) {
      console.error(checkMoveResults.error);
      get();
      return;
    }

    console.log(checkMoveResults.message);
    const { disc } = pegs[sourcePeg].removeDisc();
    pegs[destinationPeg].addDisc(disc.value);
    
    get();
    checkWinningState();
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
  }

  return {
    getWinningState,
    checkWinningState,
    get,
    move,
    start
  };
};

const game = () => {
  let newBoard;
  const isRunning = true;
  let moveCount = 0;

  const getMoveCount = () => {
    return moveCount;
  }

  const move = (sourcePegIdx, destinationPegIdx) => {
    moveCount++;
    newBoard.move(sourcePegIdx, destinationPegIdx);
    console.log('Number of moves:', moveCount);
  }
  // var for game timer
  // var for win count
  // potentially get and set for peg and disc count?
  
  const start = (pegs, discs) => {
    console.log('Starting a new game.')
    newBoard = board(pegs, discs);
    newBoard.start();
  }

  return {
    getMoveCount,
    move,
    start
  };
}

const game1 = game();

// Example win
// game1.start(3, 5);
// game1.move(1,1);
// game1.move(0,0);
// game1.move(0,1);
// game1.move(0,1);
// game1.move(0,2);
// game1.move(1,2);
// game1.move(0,1);
// game1.move(2,0);
// game1.move(2,1);
// game1.move(0,1);
// game1.move(0,2);
// game1.move(1,2);
// game1.move(1,0);
// game1.move(2,0);
// game1.move(1,2);
// game1.move(0,1);
// game1.move(0,2);
// game1.move(1,2);
// game1.move(0,1);
// game1.move(2,1);
// game1.move(2,0);
// game1.move(1,2);
// game1.move(0,1);
// game1.move(2,1);
// game1.move(2,0);
// game1.move(1,2);
// game1.move(1,0);
// game1.move(2,0);
// game1.move(2,1);
// game1.move(0,1);
// game1.move(0,2);
// game1.move(1,2);
// game1.move(0,1);
// game1.move(2,0);
// game1.move(2,1);
// game1.move(0,1);

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