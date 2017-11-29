let username = '';
let curRoom = '';
var socket = io.connect();

const activeUsersText = document.querySelector('#active-users-text');

///////Socket incoming messages - START/////
socket.on('connect', function() {
  console.log('Client connected');
  
});

socket.on('update-active-users', (userCount) => {
  activeUsersText.innerHTML = `Current Active Users: ${userCount}`;
});

///////Socket incoming messages - END/////

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

		socket.emit('ttt-join', username,'');

		
		ticTacToeGame();

		$('#tic-tac-toe-board').show();
	} else {
		alert('Enter a username before playing!');
	}
}

let isRealString = function (str) { 
    return typeof str === 'string' && str.trim().length > 0; 
};