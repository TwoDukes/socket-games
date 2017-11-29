function ticTacToeGame() {

    ///////Socket incoming messages - START/////
    socket.on('ttt-new-game', function(res){
      curRoom = res.room;
      $('#versus-text').text(username + ' vs. ' + '(WAITING)');
    });
    //shows opponent name up top and starts the game
    socket.on('ttt-join-game', function(res){
      curRoom = res.room;
      $('#versus-text').text(username + ' vs. ' + (res.user || '(WAITING)'));
      console.log('Your turn: ' + res.first);
      init(res.first);
    });
    //resets the game for the player
    socket.on('ttt-reset-game', function(res){
      AbleToBoxClick(false);
      if(res.winner){
        console.log(`${res.winner} won!`);
        gameMessages.innerHTML = `${res.winner} won!`;
      }
      else{
        console.log(`Draw!`)
        gameMessages.innerHTML = 'Draw!';
      }

      setTimeout(() => {
        console.log('Your turn: ' + res.first);
        init(res.first);
      }, 2000)
    });
    //tells player the move the opponent just made
    socket.on('player-moved-ttt', function(pos){
      OpponentHandler(pos);
    });
    //tells player to create or find a new room because opponent left
    socket.on('player-left-ttt', () => {
      $('#versus-text').text(username + ' vs. ' + '(WAITING)');
      socket.emit('ttt-join', username,'');
    });

    ///////Socket incoming messages - END/////




    // Elements
    const game = document.getElementById('tic-tac-toe-board');
    const boxes = document.querySelectorAll('li');
    const resetGame = document.getElementById('reset-game');
    const turnDisplay = document.getElementById('whos-turn');
    const gameMessages = document.getElementById('game-info-text');
    
    // Vars
    let context = { 'player1' : 'x', 'player2' : 'o' };
    let board = [];
    
    let playerOneScore = 0;
    let playerTwoScore = 0;
    
    let turns;
    let firstTurn;
    let currentContext;
    let clickedBoxes = [];

    AbleToBoxClick = (canClick) => {
      if(canClick) {
        boxes.forEach((box) => {
          if(!(clickedBoxes.indexOf(box) > -1))
            box.addEventListener('click', clickHandler, false);
          }) 
      }else {
        boxes.forEach((box) => {
          if(!(clickedBoxes.indexOf(box) > -1))
            box.removeEventListener('click', clickHandler);
          }) 
      }
    }
    
    // Constructor
    var init = function(clickable) {
        resetBoard();
        turns = 0;
        firstTurn = clickable;
        
        // Get current context
        currentContext = computeContext();
        
        // Setup 3 x 3 board 
        board[0] = new Array(3);
        board[1] = new Array(3);
        board[2] = new Array(3);
        
        // bind events
        if(clickable) {
          gameMessages.innerHTML = "Your Turn!";
          AbleToBoxClick(true);
        }else {
          gameMessages.innerHTML = "Opponents Turn!";
        }
        
    }
    
    //Keeps track of player's turn
    var computeContext = function() {
        return (turns % 2 == 0) ? context.player1 : context.player2;
    }
    
    // Bind the dom element to the click callback
    var clickHandler = function() {
      
        this.removeEventListener('click', clickHandler);
        
          this.className = currentContext;
          this.innerHTML = currentContext;
          
          var pos = this.getAttribute('data-pos').split(',');
          const Box = document.querySelector(`[data-pos='${pos}']`)
          board[pos[0]][pos[1]] = computeContext() == 'x' ? 1 : 0;

          clickedBoxes.push(Box);
          
          socket.emit('player-move-ttt', curRoom, pos);

          
          if(checkStatus()) {
            resetGameHandler();
          }
          
          turns++;
          AbleToBoxClick(false);
          gameMessages.innerHTML = "Opponents Turn!";
          currentContext = computeContext(); 
    }

        // Bind the dom element to the opponent move
        var OpponentHandler = function(newPos) {
          const Box = document.querySelector(`[data-pos='${newPos}']`)
          clickedBoxes.push(Box);
          
          Box.removeEventListener('click', clickHandler);
            
          Box.className = currentContext;
          Box.innerHTML = currentContext;
              
              board[newPos[0]][newPos[1]] = computeContext() == 'x' ? 1 : 0;
              
              if(checkStatus()) {
                resetGameHandler();
              }
              
              turns++;
              AbleToBoxClick(true);
              gameMessages.innerHTML = "Your Turn!";
              currentContext = computeContext();
        }
    
    
    // Check to see if player has won
    var checkStatus = function() {
        var used_boxes = 0;
        
        for(var rows = 0; rows < board.length; rows++ ) {
            var row_total = 0;
            var column_total = 0;
            
            for(var columns = 0; columns < board[rows].length; columns++) {
                row_total += board[rows][columns];
                column_total += board[columns][rows];
                
                if(typeof board[rows][columns] !== "undefined") {
                    used_boxes++;
                }
            }
            
            // Winning combination for diagonal scenario [0,4,8], [2,4,6]
            var diagonal_tl_br = board[0][0] + board[1][1] + board[2][2]; // diagonal top left to bottom right
            var diagonal_tr_bl = board[0][2] + board[1][1] + board[2][0]; // diagonal top right bottom left
            
            if(diagonal_tl_br == 0 || diagonal_tr_bl == 0 || diagonal_tl_br == 3 || diagonal_tr_bl == 3) {
                return true;
            }
            
            // Winning combination for row [0,1,2], [3,4,5], [6,7,8]
            // Winning combination for column [0,3,6], [1,4,7], [2,5,8]
            // Only way to win is if the total is 0 or if the total is 3. X are worth 1 point and O are worth 0 points
            if(row_total == 0 || column_total == 0 || row_total == 3 || column_total == 3) {
                return true;
            }
            
            // if all boxes are full - Draw!!!
            if(used_boxes == 9) {
                gameDraw();
            }
        }
    }

    // Tells user when game is a draw.
    var gameDraw = function() {
        AbleToBoxClick(false);
        resetGameHandler(false);
    }
    
    // Reset game to play again  //TODO: This breaks the turn system, fix it
    var resetGameHandler = function(winnerExists = true) {
      console.log('Reseting game')
        clickedBoxes = [];
        AbleToBoxClick(false);
        //if player made the winning move
        if(turns % 2 == 0 && firstTurn && winnerExists){
          console.log('wow you won!')
          socket.emit('ttt-game-end', username, curRoom, firstTurn);
          //else if game ended with no winner
          //firstTurn is added so only one player resets the game
        } else if(!winnerExists && firstTurn){
          socket.emit('ttt-game-end', "", curRoom, firstTurn);
        }

        resetBoard();
    }
    //resets the tiles on the board
    const resetBoard = () => {
        clickedBoxes = [];
        for(var i = 0; i < boxes.length; i++) {
          boxes[i].className = '';
          boxes[i].innerHTML = '';
        }
    }
}

