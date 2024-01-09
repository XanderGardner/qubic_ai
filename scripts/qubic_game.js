
// represent a qubic game 
export class QubicGame {
  
  constructor(game_mode) {
    // "1" or "2" for player turn, "-1" or "-2" for complete game, "0" for tie
    this.state = 1;
    // represent the board in a string
    this.board = "0".repeat(64);
    // store winning positions
    this.dirs = this.constructDirs();
    // game mode
    this.game_mode = game_mode
  }

  getlendirs() {
    return this.dirs.length;
  }


  // check if cordinate move is valid
  validMove(x, y, z) {
    // check valid input
    if (x < 0 || x > 3 || y < 0 || y > 3 || z < 0 || z > 3) {
      return false;
    }

    // check game not already done
    if (this.state <= 0) {
      return false;
    }

    // check not occupied
    let i = this.get2dCoord(x, y, z);
    if (this.board.charAt(i) !== "0") {
      return false;
    }

    return true;
  }
  
  // makes the move, updates the game state
  // no action on invalid input
  makeMove(x, y, z) {
    if (!this.validMove(x, y, z)) {
      return;
    }
    
    let i = this.get2dCoord(x, y, z);
    this.board = this.board.substring(0,i) + this.state + this.board.substring(i+1);
    this.state = this.getBoardState(this.board);
  }

  // get the winning coordinates of the 4 points if the game is won
  getWinningCoords() {
    for (let i = 0; i < this.dirs.length; i++) {
      let [a,b,c,d] = this.dirs[i];
      if (this.board.charAt(a) !== "0" && this.board.charAt(a) === this.board.charAt(b)
          && this.board.charAt(b) === this.board.charAt(c) && this.board.charAt(c) === this.board.charAt(d)) {
        return [this.get3dCoord(a), this.get3dCoord(b), this.get3dCoord(c), this.get3dCoord(d)];
      }
    }
    return []
  }

  // for a given board, turn, and depth to look, 
  // return the number of the player who wins if forceable (else 0) and the best move to make (i)
  makeAIMoveHelper(board_arr, turn, depth) {
    // base case: no depth or board won
    let board_state = this.checkWinner(board_arr)
    if (depth === 0) {
      return [board_state, 0];
    }
    if (board_state !== 0) {
      return [board_state, 0];
    }

    // recursive case: the board is unknown but has depth to check
    let unknowns = []
    let wins = []
    let loses = []
    let next_turn = turn === 1 ? 2 : 1;
    for (let i = 0; i < 64; i++) {
      // check valid moves only
      if (board_arr[i] !== 0) {
        continue;
      }

      board_arr[i] = turn;
      let [check_winner, check_i] = this.makeAIMoveHelper(board_arr, next_turn, depth-1);
      board_arr[i] = 0;

      if (check_winner === 0) {
        unknowns.push(i);
      } else if (check_winner === turn) {
        wins.push(i);
      } else {
        loses.push(i);
      }
    }

    // make best move, or choose random from unknown
    if (wins.length > 0) {
      return [turn, wins[Math.floor(Math.random() * wins.length)]]
    }
    if (unknowns.length > 0) {
      return [0, unknowns[Math.floor(Math.random() * unknowns.length)]]
    }
    if (loses.length > 0) {
      return [next_turn, loses[Math.floor(Math.random() * loses.length)]]
    }
    return [0, 0]
  }

  // let the ai take a turn
  makeAIMove() {
    let board_arr = []
    for (let i = 0; i < 64; i++) {
      board_arr.push(parseInt(this.board.charAt(i)));
    }

    let player_wins, move_i;
    if (game_mode === "easy") {
      [player_wins, move_i] = this.makeAIMoveHelper(board_arr, this.getTurn(), 2);
    } else if (game_mode == "medium") {
      [player_wins, move_i] = this.makeAIMoveHelper(board_arr, this.getTurn(), 4);
    } else {
      [player_wins, move_i] = this.makeAIMoveHelper(board_arr, this.getTurn(), 6);
    }

    this.board = this.board.substring(0,move_i) + this.state + this.board.substring(move_i+1);
    this.state = this.getBoardState(this.board);
    
    let [x,y,z] = this.get3dCoord(move_i);
    return [x,y,z];
  }




  ////////// getter //////////

  // returns if the game is over
  gameOver() {
    return this.state <= 0;
  }

  // return the winner of the game (or undefined if no winner)
  getWinner() {
    if (!this.gameOver()) {
      return undefined;
    }
    return -this.state;
  }

  // return whos turn it is (or undefined if the game ended)
  getTurn() {
    if (this.gameOver()) {
      return undefined;
    }
    return this.state;
  }
  
  // return the current state of the game
  getState() {
    return this.state;
  }

  // get what token is at position x,y,z
  getToken(x, y, z) {
    let i = this.get2dCoord(x, y, z);
    return parseInt(this.board[i]);
  }





  ////////// helper //////////

  // construct dirs
  constructDirs() {
    let dirs = [];

    // z aligned
    for (let i = 0; i < 16; i++) {
      dirs.push([i,i+16,i+32,i+48]);
    }

    // y aligned
    for (let i = 0; i <= 48; i+=16) {
      for (let x = 0; x < 4; x++) {
        let s = i+x;
        dirs.push([s, s+4, s+8, s+12]);
      }
    }

    // x aligned
    for (let i = 0; i <= 48; i+=16) {
      for (let x = 0; x <= 12; x+=4) {
        let s = i+x;
        dirs.push([s, s+1, s+2, s+3]);
      }
    }

    // xy plane diagonal
    for (let i = 0; i <= 48; i+=16) {
      dirs.push([i, i+5, i+10, i+15]);
    }
    for (let i = 12; i <= 60; i+=16) {
      dirs.push([i, i-3, i-6, i-9]);
    }

    // xz plane diagonal
    for (let i = 0; i <= 12; i+=4) {
      dirs.push([i, i+17, i+34, i+51]);
    }
    for (let i = 3; i <= 15; i+=4) {
      dirs.push([i, i+15, i+30, i+45]);
    }

    // yz plane diagonal
    for (let i = 0; i <= 3; i++) {
      dirs.push([i, i+20, i+40, i+60]);
    }
    for (let i = 12; i <= 15; i++) {
      dirs.push([i, i+12, i+24, i+36]);
    }

    // xyz diagonal
    dirs.push([0, 21, 42, 63]);
    dirs.push([15, 26, 37, 48]);
    dirs.push([12, 25, 38, 51]);
    dirs.push([3, 22, 41, 60]);

    return dirs
  }

  // get 3d coordinates for board
  get3dCoord(i) {
    let z = Math.floor(i / 16);
    i = i%16;
    let y = Math.floor(i / 4);
    i = i%4;
    let x = i;
    return [x, y, z];
  }
  
  // get 2d coordinates for board
  get2dCoord(x, y, z) {
    return x + y*4 + z*16;
  }

  // check state of a given board
  getBoardState(board) {
    let emptyCount = 0;
    let oneCount = 0;
    let twoCount = 0;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "0") {
        emptyCount++;
      } else if (board[i] === "1") {
        oneCount++;
      } else {
        twoCount++;
      }
    }

    // check if "1" or "2" won
    for (let i = 0; i < this.dirs.length; i++) {
      let [a,b,c,d] = this.dirs[i];
      if (board[a] !== "0" && board[a] === board[b]
          && board[b] === board[c] && board[c] === board[d]) {
        return -parseInt(board[a]);
      }
    }

    // check if tie "0"
    if (emptyCount === 0) {
      return 0;
    }

    // check whos turn it is (player with less pieces else 1)
    if (twoCount < oneCount) {
      return 2;
    } else {
      return 1;
    }
  }

  // return winner or zero if no one won
  checkWinner(board_arr) {
    for (let i = 0; i < this.dirs.length; i++) {
      let [a,b,c,d] = this.dirs[i];
      if (board_arr[a] !== 0 && board_arr[a] === board_arr[b]
          && board_arr[b] === board_arr[c] && board_arr[c] === board_arr[d]) {
        return board_arr[a];
      }
    }
    return 0;
  }
  
}

