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

const board = () => {
  const pegs = [];

  const addPeg = () => {
    pegs.push(peg());
  };

  return {
    pegs,
    addPeg
  };
};

const game = () => {
  let newBoard = board();
  // var for moveCount on each move
  // var for game timer
  // potentially get and set for peg and disc count?
  
  const start = (pegs, discs) => {
    console.log('Starting a new game.')
    for (let i = 0; i < pegs; i++) {
      newBoard.addPeg();

      if (i === 0) {
        for (let j = discs; j !== 0; j--) {
          newBoard.pegs[i].addDisc(j);
        }
      }
    }
  }
  
  const get = () => {
    console.log('Getting the current state of the board.')
    for (const peg in newBoard.pegs) {
      const { discs } = newBoard.pegs[peg].getDiscs();
      console.log(discs);
    }
  };

  const move = (sourcePeg, destinationPeg) => {
    console.log(`Moving a disc from ${sourcePeg} to ${destinationPeg}`)
    const { disc } = newBoard.pegs[sourcePeg].removeDisc();
    newBoard.pegs[destinationPeg].addDisc(disc.value);
  }

  return {
    get,
    move,
    start
  };
}

const game1 = game();

game1.start(3, 5);
game1.move(0,1);
game1.get();
game1.move(0,2);
game1.get();

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