(function() {
    var score = 0;
    var interval = 400;
    var timers = [];
    var results = [];
    var stopCount = 0;
    const suit = ["♤","♡","♢","♧"];
    const cardNum = [ "2", "3", "4", "5", "6", "7", "8", "9", '10', "J","Q","K","A"]
    const cardSet = ['🂡', '🂲', '🃃', '🃔', '🂥', '🂶', '🃇', '🃘', '🂩', '🂺', '🃋', '🃝', '🂮', '🂱', '🃂', '🃓', '🂤', '🂵', '🃆', '🃗', '🂨', '🂹', '🃊', '🃛', '🂭', '🂾', '🃁', '🃒', '🂣', '🂴', '🃅', '🃖', '🂧', '🂸', '🃉', '🃚', '🂫', '🂽', '🃎', '🃑', '🂢', '🂳', '🃄', '🃕', '🂦', '🂷', '🃈', '🃙', '🂪', '🂻', '🃍', '🃞'];
    const colors = ["black","red","blue","green"];
    var drawInfo = {
                    src: './playingcards.png',
                    sx: 150,
                    sy: 0,
                    sw: 150,
                    sh: 133,
                  }



    const playerNumber = document.form1.playerNumber;
    const shuffle = ([...array]) => {
      for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    var sum  = function(arr) {
        var sum = 0;
        for (var i=0,len=arr.length; i<len; ++i) {
            sum += arr[i];
        };
        return sum;
    };

    var ifstraight  = function(arr) {
        var ifStraight = false;
        var numbers = [0,0,0,0,0];
        for (var i= 13; i>3; --i) {
            if (arr[i] > 0 &&arr[i-1] > 0 &&arr[i-2] > 0 &&arr[i-3] > 0 &&arr[i-4] > 0) {
              ifStraight = true;
              numbers = [i+1,i,i-1,i-2,i-3];
              return [ifStraight, numbers];
            }
        }
        return [ifStraight, numbers];
    };

    const playerBestHand = class {
      constructor(sevenCards) { /* コンストラクタ */
        this.pocketAndBoard = sevenCards;
        this.strength = 0;
        this.hand = "undefined";
        this.handNumbers = [0,0,0,0,0];
      }
      findHand() {
        var cardDistr = [...Array(4)].map((x) => [...Array(14)].map(((d) => {return 0})))
        var ifFlush = false;
        var ifStraight = false;

        for (var i = 0; i < this.pocketAndBoard.length; i++) {
          var d = this.pocketAndBoard[i];
          cardDistr[d%4][(d%13 == 0) ? 13 : d%13] = 1;
        }
        for (var i = 0; i < 4; i++) {
          if (sum(cardDistr[i])>=5) {
            ifFlush = true;
            cardDistr[i][0] = cardDistr[i][13];
            var tmp = ifstraight(cardDistr[i]);
            cardDistr[i][0] = 0;
            if (tmp[0]) {
              if (tmp[1][0] == 14) {
                this.strength = 10;
                this.hand = "Royal Flush";
                this.handNumbers = tmp[1];
              }else{
                this.strength = 9;
                this.hand = "Straight Flush";
                this.handNumbers = tmp[1];
              }
            }else {
              this.strength = 6;
              this.hand = "Flush";
              this.handNumbers = [...Array(14).keys()].filter(((d) => {return cardDistr[i][d]>0})).reverse().slice(0,5).map((d) => {return d+1});
            }
            return 0;
          }
        }
        var cardNumDistr = [...Array(14).keys()].map(((d) => {return cardDistr[0][d] + cardDistr[1][d] + cardDistr[2][d] + cardDistr[3][d]}));
        cardNumDistr[0] = cardNumDistr[13];
        var tmp = ifstraight(cardNumDistr);
        cardNumDistr[0] = 0;
        if (tmp[0]) {
          this.strength = 5;
          this.hand = "Straight";
          this.handNumbers = tmp[1];
          return 0;
        }
        var quads = cardNumDistr.indexOf(4) + 1
        if (quads > 0) {
          this.strength = 8;
          this.hand = "Four of a kind";
          this.handNumbers = [quads,quads,quads,quads,Math.max(...[...Array(14).keys()].filter(((d) => {return cardNumDistr[d]>0 && cardNumDistr[d] < 4})))+1];
          return 0;
        }
        var trips = [...Array(14).keys()].filter(((d) => {return cardNumDistr[d]==3})).map(((x) => {return (x+1)}));
        var pairs = [...Array(14).keys()].filter(((d) => {return cardNumDistr[d]==2})).map(((x) => {return (x+1)}));
        var singles = [...Array(14).keys()].filter(((d) => {return cardNumDistr[d]==1})).map(((x) => {return (x+1)}));
        singles.reverse();
        if (trips.length >= 2 ||(trips.length == 1 && pairs.length >= 1)) {
          this.strength = 7;
          this.hand = "Full House";
          var t = Math.max(...trips);
          var p = Math.max(...trips.slice(0,-1).concat(pairs));
          this.handNumbers = [t,t,t,p,p];
          return 0;
        }else if (trips.length == 1) {
          this.strength = 4;
          this.hand = "Three of a kind";
          var t = Math.max(...trips);
          this.handNumbers = [t,t].concat(singles.slice(0,3));
        }else if (pairs.length >= 2){
          this.strength = 3;
          this.hand = "Two Pairs";
          var p1 = pairs[pairs.length-1];
          var p2 = pairs[pairs.length-2];
          var kicker = Math.max(...pairs.slice(0,-2).concat(singles));
          this.handNumbers = [p1,p1,p2,p2,kicker];
        }else if (pairs.length == 1){
          this.strength = 2;
          this.hand = "One Pair";
          this.handNumbers = [pairs[0],pairs[0]].concat(singles.slice(0,3));
        }else{
          this.strength = 1;
          this.hand = "High Card";
          this.handNumbers = singles.slice(0,5);
        }
        return 0;
      }
    }

    var img = new Image();
    img.src = "./images/playingcards.png";

    document.getElementById('start').onclick = function() {

      startGame();
    }

    function whichCard(a,b){
      for (var i = 0; i < 5; i++) {
        if (a[i] > b[i]) {
          return 1;
        } else if (a[i] < b[i]){
          return -1;
        }
      }
      return 0;
    }

    // start押したら開始
    function startGame() {
      var num = playerNumber.selectedIndex;
      var pNum = playerNumber.options[num].value;
      var deck = [...Array(52).keys()];
      deck = shuffle(deck);
      // 初期化（空の状態に戻す）
      var com = deck.slice(0, 5);
      var comCard = cardDisplayPicture(com);
      var rest = deck.slice(5, -1);
      var community = document.getElementById('com');
      community.innerHTML = '';
      community.appendChild(comCard);
      var winner = 0;
      var ifchop = false;
      var winningHand = [0,[0,0,0,0,0]];
      var newDiv = document.createElement("div");
      for (var i = 0; i < pNum; i++) {
        var playerDiv = document.createElement("div");
        playerDiv.className = 'player';
        playerDiv.style.border = "double 2px black";
        var playerHand = rest.slice(0, 2);
        rest = rest.slice(2, -1);
        var playerHandDisplayPicture = cardDisplayPicture(playerHand);
        var thisPlayer = new playerBestHand(playerHand.concat(com));
        thisPlayer.findHand();
        if (thisPlayer.strength > winningHand[0]) {
          winner = i+1;
          winningHand = [thisPlayer.strength,thisPlayer.handNumbers];
          ifchop = false;
        }else if (thisPlayer.strength == winningHand[0] && whichCard(thisPlayer.handNumbers, winningHand[1]) == 1) {
          winner = i+1;
          winningHand = [thisPlayer.strength,thisPlayer.handNumbers];
          ifchop = false;
        }else if (thisPlayer.strength == winningHand[0] && whichCard(thisPlayer.handNumbers, winningHand[1]) == 0) {
          ifchop = true;
        }

        var playerHandDisplay = document.createTextNode(cardDisplay(playerHand));
        element = document.createElement("button");
        element.style.height = '35px';
        element.innerText = "Chop";
        element.style.fontSize = '20px';
        element.id = "Player" + (i+1);
        element.innerText = "Player" + (i+1);
        playerDiv.appendChild(element);
        playerDiv.appendChild(playerHandDisplayPicture);
        newDiv.appendChild(playerDiv);
      }
      var chopDiv = document.createElement("div");
      element = document.createElement("button");
      element.style.height = '35px';
      element.innerText = "Chop";
      element.style.fontSize = '20px';

      element.id = "chop";
      chopDiv.className = "chop after";
      chopDiv.appendChild(element);

      community.appendChild(newDiv);
      community.appendChild(chopDiv);
      if (ifchop) {
        for (var i = 0; i < pNum; i++){
          var element = document.getElementById('Player' + (i+1));
          element.onclick = function() {
            alert("不正解！\nチョップです");
            var scoreElement = document.getElementById("score");
            scoreElement.textContent = 0;
            startGame();
          }
        }
        var element = document.getElementById("chop");
        element.onclick = function() {
          alert("正解！");
          var scoreElement = document.getElementById("score");
          scoreElement.textContent = Number(scoreElement.textContent) + 1;
          startGame();
        }
      } else{
        for (var i = 0; i < pNum; i++){
          var element = document.getElementById('Player' + (i+1));
          if (winner == (i+1)) {
            element.onclick = function() {
              alert("正解！");
              var scoreElement = document.getElementById("score");
              scoreElement.textContent = Number(scoreElement.textContent) + 1;
              startGame();
            }
          }else{
              element.onclick = function() {
                alert("不正解！\nPlayer"+winner+"の勝ち");
                var scoreElement = document.getElementById("score");
                scoreElement.textContent = 0;
                startGame();
              }
          }
        }
        var element = document.getElementById("chop");
        element.onclick = function() {
            alert("不正解！\nPlayer"+winner+"の勝ち");
            var scoreElement = document.getElementById("score");
            scoreElement.textContent = 0;
            startGame();
          }
        }

    }

    //カードの表示
    function cardDisplay(cardNumArray) {
      return cardNumArray.map((d) => {return suit[d % 4]+(cardNum[d % 13])});
    }


    function cardDisplayPicture(cardNumArray) {
      var len = cardNumArray.length;
      var canvas = document.createElement('canvas');
      canvas.setAttribute( "width" , 110 * len );
      canvas.setAttribute( "height" , 140 );
      var context = canvas.getContext('2d');
        //元イメージの座標(50, 50)から幅100高さ50の範囲を使用して、座標(10, 10)の位置に、サイズ200×50でイメージを表示
      context.font = "160px serif";
      for (var i = 0; i < len; i++) {
        var nowCard = cardSet[cardNumArray[i]];
        context.fillStyle = colors[cardNumArray[i]%4];
        context.fillText(nowCard, 110 * i, 110);
      }
      //cardSet[cardNumArray.map(Number)[i]]
      /*return cardNumArray.map((d) => {return suit[d % 4]+(cardNum[d % 13])});*/
      //context.drawImage(img,sx,sy,100,50,10,10,3840,1739);
      return canvas;
    }

    function deal(num){
        var playerHand = document.getElementById('Player' + num);
        var playerWIN = document.getElementById('WIN' + num);
    }

  })();
