// #TODO: Change later
let username = '';

$('document').ready(function() {
	// Tic-tac-toe button click listener
	$('#play-button-tic-tac-toe').click(startTicTacToe);

});

var startTicTacToe = function() {
	if (!isUsernameEmpty()) {
		$('#main-menu-holder').fadeOut("slow", function() {
			$(this).hide();
			$('#game-title').text("Tic-Tac-Toe");
		});

		$('#tic-tac-toe-board').show();
	} else {
		alert('Enter a username before playing!');
	}
}

function isUsernameEmpty() {
	var input = $('#username-input-box').val();
	return !isRealString(input);
}

let isRealString = function (str) { 
    return typeof str === 'string' && str.trim().length > 0; 
}; 