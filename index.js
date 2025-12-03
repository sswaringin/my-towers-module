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
  
  return {
    discs,
    addDisc,
    getDiscs,
    removeDisc
  };
};

const board = (pegCount, discCount) => {
  const winningState = false;
  const winningCondition = [];
  const pegs = [];


  const getWinningState = () => {
    return winningState;
  };

  const checkWinningState = () => {
    console.log('checking winning state')
    let hasCorrectOrder = false; // Assume false unless proven otherwise.

    const isPeg1Empty = pegs[0].discs.length === 0;

    // Get a sub-array of pegs excluding peg1.
    const otherPegs = pegs.slice(1);

    const checkDiscOrder = (discs) => {
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

    // Find if a peg has all of the discs.
    const filteredPegs = otherPegs.filter(peg => peg.discs.length === discCount);
    const potentialPeg = filteredPegs?.[0]?.discs || [];
    
    // Check if the peg has the correct order or discs
    if (potentialPeg.length > 0) {
      hasCorrectOrder = checkDiscOrder(potentialPeg);
    }
    
    if (filteredPegs.length > 0 && isPeg1Empty && hasCorrectOrder) {
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

  // move a disc from one peg to another
  const move = (sourcePeg, destinationPeg) => {
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
          // build winning condition dynamically
          winningCondition.push({ value: j });
          
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
  // var for moveCount on each move
  // var for game timer
  // var for win count
  // potentially get and set for peg and disc count?
  
  const start = (pegs, discs) => {
    console.log('Starting a new game.')
    newBoard = board(pegs, discs);
    newBoard.start();
    newBoard.move(0,1);
    newBoard.move(0,1);
    newBoard.move(0,1);
    newBoard.move(0,1);
    newBoard.move(0,1);
  }

  return {
    // get: newBoard.get(),
    // move: newBoard.move(),
    start
  };
}

const game1 = game();

game1.start(3, 5);


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