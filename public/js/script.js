// #TODO: Change later
let username = '';
var socket = io.connect();

socket.on('connect', function() {
	console.log('Client connected');
});

// socket.on('ttt-new-game', function(res){
// 	console.log(res.user);
// 	$('#versus-text').text(username + ' vs. ' + res.user);
// });

$('document').ready(function() {
	// Tic-tac-toe button click listener
	$('#play-button-tic-tac-toe').click(startTicTacToe);

});

var startTicTacToe = function() {
	var input = $('#username-input-box').val();

	if (isRealString(input)) {

		username = input;

		$('#main-menu-holder').fadeOut("slow", function() {
			$(this).hide();
			$('#game-title').text("Tic-Tac-Toe");
		});

		// socket.emit('ttt-join', username ,function(res){
		// 	console.log(res);
		// });

		$('#versus-text').text(username + ' vs. (WAITING)');
		ticTacToeGame();

		$('#tic-tac-toe-board').show();
	} else {
		alert('Enter a username before playing!');
	}
}

let isRealString = function (str) { 
    return typeof str === 'string' && str.trim().length > 0; 
};

function ticTacToeGame() {
    // Elements
    var game = document.getElementById('tic-tac-toe-board');
    var boxes = document.querySelectorAll('li');
    var resetGame = document.getElementById('reset-game');
    var turnDisplay = document.getElementById('whos-turn');
    var gameMessages = document.getElementById('game-messages');
    
    // Vars
    var context = { 'player1' : 'x', 'player2' : 'o' };
    var board = [];
    
    var playerOneScore = 0;
    var playerTwoScore = 0;
    
    var turns;
    var currentContext;
    
    // Constructor
    var init = function() {
        turns = 0;
        
        // Get current context
        currentContext = computeContext();
        
        // Setup 3 x 3 board 
        board[0] = new Array(3);
        board[1] = new Array(3);
        board[2] = new Array(3);
        
        // bind events
        for(var i = 0; i < boxes.length; i++) {
            boxes[i].addEventListener('click', clickHandler, false);
        }
        
        resetGame.addEventListener('click', resetGameHandler, false);
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
        board[pos[0]][pos[1]] = computeContext() == 'x' ? 1 : 0;
        
        if(checkStatus()) {
            gameWon();
        }
        
        turns++;
        currentContext = computeContext();
        turnDisplay.className = currentContext;
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
    var gameWon = function() {
        clearEvents();
        
        // show game won message
        gameMessages.className = 'player-' + computeContext() + '-win';
        
        // update the player score
        switch(computeContext()) {
            case 'x':
                playerOneScoreCard.innerHTML = ++playerOneScore;
                break;
            case 'o':
                playerTwoScoreCard.innerHTML = ++playerTwoScore;
        }
    }
    // Tells user when game is a draw.
    var gameDraw = function() {
        gameMessages.className = 'draw';
        clearEvents();
    }
    
    // Stops user from clicking empty cells after game is over
    var clearEvents = function() {
        for(var i = 0; i < boxes.length; i++) {
            boxes[i].removeEventListener('click', clickHandler);
        }
    }
    // Reset game to play again
    var resetGameHandler = function() {
        clearEvents();
        init();
        
        // Go over all the li nodes and remove className of either x,o
        // clear out innerHTML
        for(var i = 0; i < boxes.length; i++) {
            boxes[i].className = '';
            boxes[i].innerHTML = '';
        }
        
        // Change Who's turn class back to player1
        turnDisplay.className = currentContext;
        gameMessages.className = '';
    }
    
    game && init();
}