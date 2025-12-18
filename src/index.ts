interface Disc {
  value: number;
}

interface Peg {
  discs: Disc[];
  addDisc: (value: number) => void;
  getDiscs: () => { discs: number[] };
  removeDisc: () => { disc: Disc | undefined };
  checkDiscOrder: (winningCondition: Disc[]) => boolean;
}

interface BoardState {
  message: string;
  board: () => { pegs: { discs: number[] }[] };
  moveCount: number;
  winningState: boolean;
  error: boolean;
}

interface Board {
  getMoveCount: () => number;
  checkWinningState: () => boolean;
  resetMoveCount: () => void;
  getWinningState: () => boolean;
  start: () => BoardState;
  move: (sourcePeg: number, destinationPeg: number) => BoardState;
  get: () => { pegs: { discs: number[] }[] };
}

type GameState = BoardState & {
  isRunning: boolean;
  gameStart: Date;
  gameStop: Date;
};

interface Game {
  getState: () => GameState;
  start: () => GameState;
  end: () => GameState;
  move: (sourcePegIdx: number, destinationPegIdx: number) => GameState;
}

const disc = (value: number): Disc => {
  return { value };
};

const peg = (): Peg => {
  const discs: Disc[] = [];

  const getDiscs = (): { discs: number[] } => {
    return {
      discs: discs.map((disc) => disc.value),
    };
  };

  const addDisc = (value: number): void => {
    discs.push(disc(value));
  };

  const removeDisc = (): { disc: Disc | undefined } => {
    return {
      disc: discs.pop(),
    };
  };

  const checkDiscOrder = (winningCondition: Disc[]): boolean => {
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
  };

  return {
    discs,
    addDisc,
    getDiscs,
    removeDisc,
    checkDiscOrder,
  };
};

const board = (pegCount: number, discCount: number): Board => {
  let moveCount: number = 0;
  let winningState: boolean = false;
  const winningCondition: Disc[] = [];

  const makePegs = (pegCount: number): Peg[] => {
    const pegs = [];
    for (let i = 0; i < pegCount; i++) {
      pegs.push(peg());
    }
    return pegs;
  };
  const pegs: Peg[] = makePegs(pegCount);

  const getPotentialPeg = (): Peg | undefined => {
    // Get a sub-array of pegs excluding peg1.
    const otherPegs = pegs.slice(1);

    // Find if a peg has all of the discs.
    const filteredPegs = otherPegs.filter(
      (peg) => peg.discs.length === discCount
    );

    return filteredPegs?.[0];
  };

  const checkWinningState = (): boolean => {
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
  };

  // Display the current state of the board.
  const get = (): { pegs: { discs: number[] }[] } => {
    return {
      pegs: pegs.map((peg) => peg.getDiscs()),
    };
  };

  const checkMove = (
    sourcePegIdx: number,
    destPegIdx: number
  ): { error: boolean; message: string } => {
    const sourcePeg: Peg = pegs[sourcePegIdx];
    const sourceDisc: Disc = sourcePeg.discs[sourcePeg.discs.length - 1];
    const destinationPeg: Peg = pegs[destPegIdx];
    const destDisc: Disc =
      destinationPeg.discs[destinationPeg.discs.length - 1];

    if (!sourceDisc) {
      return {
        error: true,
        message: "Nothing changed... Did you pick a peg with a disc?",
      };
    }

    if (sourcePegIdx === destPegIdx) {
      return {
        error: true,
        message:
          "Nothing changed... You just moved the disc to the same peg...",
      };
    }

    if (sourcePeg.discs.length === 0) {
      return {
        error: true,
        message: "Sorry. You can't move a disc that doesn't exist.",
      };
    }

    if (sourceDisc?.value > destDisc?.value) {
      return {
        error: true,
        message:
          "Sorry. You can't move a larger disc on top of a smaller disc.",
      };
    }

    return {
      error: false,
      message: `Moved disc from ${sourcePegIdx + 1} to ${destPegIdx + 1}`,
    };
  };

  // move a disc from one peg to another
  const move = (sourcePeg: number, destinationPeg: number): BoardState => {
    moveCount++;

    const checkMoveResults = checkMove(sourcePeg, destinationPeg);

    if (checkMoveResults?.error) {
      return {
        message: checkMoveResults.message,
        error: true,
        board: () => get(),
        moveCount,
        winningState: checkWinningState(),
      };
    }

    const { disc } = pegs[sourcePeg].removeDisc();

    if (disc?.value) {
      pegs[destinationPeg].addDisc(disc.value);
    }

    return {
      message: checkMoveResults.message,
      error: false,
      board: () => get(),
      moveCount,
      winningState: checkWinningState(),
    };
  };

  const start = (): BoardState => {
    for (let j = discCount; j !== 0; j--) {
      winningCondition.push({ value: j }); // build winning condition dynamically

      pegs[0].addDisc(j);
    }

    return {
      message: "Make a move.",
      error: false,
      board: () => get(),
      moveCount,
      winningState: checkWinningState(),
    };
  };

  return {
    getMoveCount: () => moveCount,
    resetMoveCount: () => (moveCount = 0),
    checkWinningState,
    getWinningState: () => winningState,
    get,
    move,
    start,
  };
};

const game = (): Game => {
  const pegsCount: number = 3;
  const discCount: number = 5;
  let newBoard: Board = board(pegsCount, discCount);
  let isRunning: boolean = false;
  let gameStart: Date;
  let gameStop: Date;
  let message: string = "Start a new game. 👾";
  let error: boolean = false;

  // consistently return without referencing stale state
  const returnState = (): GameState => {
    return {
      board: () => newBoard.get(),
      moveCount: newBoard.getMoveCount(),
      winningState: newBoard.getWinningState(),
      message,
      isRunning,
      error,
      gameStart,
      gameStop,
    };
  };

  const move = (sourcePegIdx: number, destinationPegIdx: number): GameState => {
    if (!isRunning) {
      error = true;
      message = "You can't move unless the game is started.";
      return returnState();
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
  };

  const start = (): GameState => {
    gameStart = new Date();
    isRunning = true;
    newBoard = board(pegsCount, discCount);
    const results = newBoard.start();
    message = results.message;

    return returnState();
  };

  const end = (): GameState => {
    // newBoard = board(pegsCount, discCount);
    isRunning = false;
    gameStop = new Date();
    message = "Game over";

    return returnState();
  };
  return {
    getState: returnState,
    end,
    move,
    start,
  };
};

export { game };
