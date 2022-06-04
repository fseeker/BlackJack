/*
 * author: Fahim (Seeker) Ahmed
*/
//const OriginalDeck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
const OriginalDeck = [...Array(53).keys()].splice(1);
let playerDrawnCards = [];
let botDrawnCards = [];
var playerPoint = 0;
var dealerPoint = 0;

//CREDIT: https://www.w3docs.com/snippets/javascript/how-to-randomize-shuffle-a-javascript-array.html?msclkid=83175124d07d11ecace92cb6861f220e
function shuffleArray(array) {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return [...array];
}

//This code is to reshuffle the deck after every 4 rounds.
var shuffleCount = 0;
function shuffleCounter(){
  if(shuffleCount > 4){
    deck = shuffleArray(OriginalDeck);
    shuffleCount = 0;
    console.log('deck reshuffled');
  }
}

var deck = shuffleArray(OriginalDeck);

class card {
  constructor(integer) {

    this.serial = integer;
    var suitNumber = Math.floor((integer - 1) / 13);
    var suitArray = ['spades', 'hearts', 'diamonds', 'clubs'];

    this._suit = suitArray[suitNumber];
    var rankCounter = integer % 13;
    this._rank = rankCounter === 0 ? 13 : rankCounter;
    this._value = "";
    this._point = 0;
    this.hidden = false;

    if (this._rank < 11) {
      this._value = "number";
      this._point = this._rank;
    }
    if (this._rank === 1) {
      this._value = "ace";
      this._point = 11;
    }
    if (this._rank >= 11) {
      this._value = "face";
      this._point = 10;
    }



  }

  get suit() {
    return this._suit;
  }
  get rank() {
    if (this._rank === 1) {
      return "Ace";

    } if (this._rank < 11) {
      return this._rank;
    } if (this._rank === 11) {
      return "Jack";
    } if (this._rank === 12) {
      return "Queen";
    } if (this._rank === 13) {
      return "King";
    }

  }
  get value() {
    return this._value;
  }
  get point() {
    return this._point;
  }
}

const mainScore = {
  _won: 0,
  _lost: 0,
  set won(num = 1) {
    this._won += 1;
  },
  get wonGames() {
    return this._won;
  },

  set lost(num = 1) {
    this._lost += 1;
  },
  get lostGames() {
    return this._lost;
  },
}

function newGame(){
  deck = shuffleArray(OriginalDeck);
  mainScore._won = 0;
  mainScore._lost = 0;

  nextRound();
}

function nextRound() {
  shuffleCount++;
  shuffleCounter();
  playerDrawnCards = [];
  botDrawnCards = [];

  playerDrawnCards.push(new card(deck.pop()));
  botDrawnCards.push(new card(deck.pop()));
  playerDrawnCards.push(new card(deck.pop()));
  botHiddenCard = new card(deck.pop());
  botHiddenCard.hidden = true;
  botDrawnCards.push(botHiddenCard);
  playerPoint = playerDrawnCards.reduce((acc, curVal) => {
    return acc._point + curVal._point
  });
  dealerPoint = botDrawnCards.reduce((acc, curVal) => {
    return acc._point + curVal._point
  });
  if (playerPoint > 21) {
    for (var i = 0; i < playerDrawnCards.length; i++) {
      if (playerPoint > 21 && playerDrawnCards[i].value === 'ace' && playerDrawnCards[i]._point !== 1) {
        playerDrawnCards[i]._point = 1;
        playerPoint = playerDrawnCards.reduce((acc, curVal) => {
          return acc._point + curVal._point
        });
      }
    }
  }
  if ((playerPoint === 21 && playerDrawnCards.some(card => card.value === 'face'))) {
    roundWon('Blackjack');
  }else{
    renderUI(nextRound);
  }
}
function roundWon(statement) {
  console.log(`Winner! by: ${statement}`);
  mainScore.won = 1;
  renderUI(roundWon, `Winner! <p>${statement}</p>`);
}
function roundLost(statement) {
  console.log(`Lost! by: ${statement}`);
  $('#hit').attr('disabled','true');
  $('#stand').attr('disabled','true');

  botDrawnCards.forEach(card => {
    card.hidden = false;
  });
  mainScore.lost = 1;
  renderUI(roundLost, `Lost! <p>${statement}</p>`)
}

function hit() {
  const hitCard = new card(deck.pop());
  playerDrawnCards.push(hitCard);
  
  playerPoint = 0;
  for (var i = 0; i < playerDrawnCards.length; i++) {
    playerPoint += playerDrawnCards[i]._point;
  }

  if (playerPoint > 21) {

    for (var i = 0; i < playerDrawnCards.length; i++) {
      if (playerPoint > 21 && playerDrawnCards[i].value === 'ace' && playerDrawnCards[i]._point !== 1) {
        playerDrawnCards[i]._point = 1;
        playerPoint = 0;
        for (var j = 0; j < playerDrawnCards.length; j++) {
          playerPoint += playerDrawnCards[j]._point;
        }
      }
    }
  }
  if (playerPoint > 21) {
    roundLost('bust');
  }

  renderUI();
}

function stand() {
  playBotHand();
}

function playBotHand() {
  botDrawnCards[1].hidden = false;
  dealerPoint = botDrawnCards.reduce((acc, curVal) => {
    return acc._point + curVal._point
  });

  while (dealerPoint < 17) {
    dealerHit();
  }
  if (dealerPoint > 21) {
    roundWon('dealer bust');
  } else if (dealerPoint > playerPoint) {
    roundLost('dealer win by higher point');
  } else if (playerPoint > dealerPoint) {
    roundWon('player win by higher point');
  } else {
    roundLost('dealer wins by tie');
  }
  console.log(playerDrawnCards);
  console.log(botDrawnCards);
}

function dealerHit() {
  const hitCard = new card(deck.pop());
  botDrawnCards.push(hitCard);

  var $card = $('<div class="card"></div>');
  $card.css('left', 40 * botDrawnCards.length + 'px');
  $card.css('background', 'url("./images/PNG-cards-1.2/' + hitCard.serial + '.png") no-repeat');
  $card.css('background-size', 'contain');

  var $card = $('<div class="card"></div>');
  $card.css('left', 40 * playerDrawnCards.length + 'px');
  if (hitCard.hidden) {
    $card.css('background', 'url("./images/PNG-cards-1.2/0.png") no-repeat');
  } else {
    $card.css('background', 'url("./images/PNG-cards-1.2/' + hitCard.serial + '.png") no-repeat');
  }
  $card.css('background-size', 'contain');

  $('.dealer .cards').append($card);

  dealerPoint = 0;
  for (var i = 0; i < botDrawnCards.length; i++) {
    dealerPoint += botDrawnCards[i]._point;
  }

  if (dealerPoint > 21) {
    for (var i = 0; i < botDrawnCards.length; i++) {
      if (dealerPoint > 21 && botDrawnCards[i].value === 'ace' && botDrawnCards[i]._point !== 1) {
        botDrawnCards[i]._point = 1;
        dealerPoint = 0;
        for (var j = 0; j < botDrawnCards.length; j++) {
          dealerPoint += botDrawnCards[j]._point;
        }
      }
    }
  }
}

//all jquery and data to be passed to html is in this function.
function renderUI(param, paramString = "") {

  if (param === nextRound) {
    console.log('startgame');
    $('.popup').hide();
    $('#nextRound').attr('disabled','true');
    $('#hit').removeAttr('disabled');
    $('#stand').removeAttr('disabled');
  }

  if (param === roundWon) {
    $('.board .popup').html(paramString);
    $('.popup').show();
    $('.popup').css('display', 'block');
    $('#hit').attr('disabled','true');
    $('#stand').attr('disabled','true');
    $('#nextRound').removeAttr('disabled');
  }
  if (param === roundLost) {
    $('.board .popup').html(paramString);
    $('.popup').show();
    $('.popup').css('display', 'block');
    $('#hit').attr('disabled','true');
    $('#stand').attr('disabled','true');
    $('#nextRound').removeAttr('disabled');
  }

  $('.cardsLeftCount span').html(deck.length);

  $('.player .cards').html('');
  $('.dealer .cards').html('');

  for (var i = 0; i < playerDrawnCards.length; i++) {
    var $card = $('<div class="card"></div>');
    $card.css('left', 40 * (i + 1) + 'px');
    $card.css('background', 'url("./images/PNG-cards-1.2/' + playerDrawnCards[i].serial + '.png") no-repeat');
    $card.css('background-size', 'contain');

    $('.player .cards').append($card);
  }

  for (var i = 0; i < botDrawnCards.length; i++) {
    var $card = $('<div class="card"></div>');
    $card.css('left', 40 * (i + 1) + 'px');
    if (botDrawnCards[i].hidden) {
      $card.css('background', 'url("./images/PNG-cards-1.2/0.png") no-repeat');
    } else {
      $card.css('background', 'url("./images/PNG-cards-1.2/' + botDrawnCards[i].serial + '.png") no-repeat');
    }

    $card.css('background-size', 'contain');

    $('.dealer .cards').append($card);
  }

  var playerPointString = String(playerPoint).padStart(2, '0');
  $('.player .score span').html(playerPointString);
  if (botDrawnCards.some(card => card.hidden === true)) {
    $('.dealer .score span').html('00');
  } else {
    var botPointString = String(dealerPoint).padStart(2, '0');
    $('.dealer .score span').html(botPointString);
  }
  $('.topbar .player-score span').html(mainScore.wonGames);
  $('.topbar .dealer-score span').html(mainScore.lostGames);

}

console.log(playerDrawnCards);
console.log(botDrawnCards);

$('#nextRound').click(nextRound);
$('#startNewGame').click(newGame);

$('#hit').click(hit);
$('#stand').click(stand);

