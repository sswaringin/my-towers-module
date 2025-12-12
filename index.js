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
  
  const makePegs = (pegCount) => {
    const pegs = [];
    for (let i = 0; i < pegCount; i++) {
      pegs.push(peg());
    }
    return pegs;
  };
  const pegs = makePegs(pegCount);

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
        error: true,
        message: "Nothing changed... Did you pick a peg with a disc?"
      }
    }

    if (sourcePegIdx === destPegIdx) {
      return {
        error: true,
        message: "Nothing changed... You just moved the disc to the same peg..."
      };
    }
    
    if(sourcePeg.discs.length === 0) {
      return {
        error: true,
        message: "Sorry. You can't move a disc that doesn't exist."
      }
    }

    if (sourceDisc?.value > destDisc?.value) {
      return {
        error: true,
        message: "Sorry. You can't move a larger disc on top of a smaller disc."
      }
    }

    return {
      error: false,
      message: `Moved disc from ${sourcePegIdx + 1} to ${destPegIdx + 1}`
    }
  }

  // move a disc from one peg to another
  const move = (sourcePeg, destinationPeg) => {
    moveCount++;

    const checkMoveResults = checkMove(sourcePeg, destinationPeg);

    if (checkMoveResults?.error) {
      return {
        message: checkMoveResults.message,
        error: true,
        board: get(),
        moveCount,
        winningState: checkWinningState()
      }
    }

    const { disc } = pegs[sourcePeg].removeDisc();
    pegs[destinationPeg].addDisc(disc.value);
    
    return {
      message: checkMoveResults.message,
      error: false,
      board: get(),
      moveCount,
      winningState: checkWinningState()
    }
  }

  const start = () => {
    for (let j = discCount; j !== 0; j--) {
      winningCondition.push({ value: j }); // build winning condition dynamically
      
      pegs[0].addDisc(j);
    }

    return {
      message: "Make a move.",
      board: get(),
      moveCount,
      winningState: checkWinningState(),
    }
  }

  return {
    getMoveCount: () => moveCount,
    resetMoveCount: () => moveCount = 0,
    checkWinningState,
    getWinningState: () => winningState,
    get,
    move,
    start
  };
};

const game = () => {
  let pegs = 3;
  let discs = 5;
  let newBoard = board(pegs, discs);
  let isRunning = false;
  let gameStart;
  let gameStop;
  let message = "Start a new game. 👾";
  let error = false;

  // consistently return without referencing stale state
  const returnState = () => {
    return {
      board: () => newBoard.get(),
      moveCount: newBoard.getMoveCount(),
      winningState: newBoard.getWinningState(),
      message,
      isRunning,
      error,
    }
  }

  const move = (sourcePegIdx, destinationPegIdx) => {
    if (!isRunning) {
      error = true;
      message = "You can't move unless the game is started.";
      return returnState()
    }
    
    const results = newBoard.move(sourcePegIdx, destinationPegIdx);
    message = results.message;
    error = results.error;

    if (results?.winningState) {
      isRunning = false;
      gameStop = new Date();
      message = "Congratulations! You won!";
    }

    return returnState();
  }
  
  const start = () => {
    gameStart = new Date();
    isRunning = true;
    newBoard = board(pegs, discs);
    const results = newBoard.start();
    message = results.message;

    return returnState();
  }

  const end = () => {
    newBoard = board(pegs, discs);
    isRunning = false;
    gameStop = new Date();
    message = "Game over";

    return returnState();
  }
  return {
    getState: returnState,
    end,
    move,
    start,
  };
}

export { game }