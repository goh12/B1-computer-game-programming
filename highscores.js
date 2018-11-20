//======================
// High Score stuff
//======================

function submitHighScore() {
    const playerName = document.getElementById("PlayerName").value;
    const playerScore = gameManager.getScore();

    // post the score to the database
    //postHighScoreData(playerName, playerScore);

    // hide the input field again
    document.getElementById('PlayerName').type = 'hidden';

    // send the game to a high score page
    gameManager.toggleGameOver();
    gameManager.toggleHighScoreMenu();

    main.init();

    return false; // necessary so we won't refresh the page
}


function postHighScoreData (name, score) {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://riseofeyes-hs.herokuapp.com/", true);

    //Send the proper header information along with the request
    xhttp.setRequestHeader("Content-Type", "application/json");

    xhttp.onreadystatechange = function() { //Call a function when the state changes.
        if(xhttp.readyState == 4 && xhttp.status == 200) {
            const json = JSON.parse(xhttp.responseText);
            console.log(json.player + ", " + json.score);
        }
    }

    const body = JSON.stringify({
        "player" : name,
        "score" : score
    });

    xhttp.send(body);
}