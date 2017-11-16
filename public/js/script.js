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