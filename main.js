Moralis.initialize("xWWjxNj8ugUJStkeUzqbKa28NVBmn0ef4tsD0FE9");
Moralis.serverURL = "https://dw1mtjavebcw.moralisweb3.com:2053/server";
const TEAM = '0x528524b599F13F9ab203125e31F3099cD18B2B08';
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
            default: 'arcade',
            arcade: {
                    gravity: { y: 300 },
                    debug: false
            }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    audio: {
        disableWebAudio: true
    }
};

var game;
var count = 0;
var platforms; 
var space = 38;  
var player;
var competitors = {};
var jumpHeight = -350; 
var score = 0;
var scoreText;
var aaveText;
var angerLevel = 0;
var cursors;
var that;
var levelup = 100;
var levelReached = 0; 
var positionEntry = 0;
var countRaiderHistory = 0;
var countTopRaider = 0;

var x = document.getElementById("AaveAudio"); 
var y = document.getElementById("AaveSend"); 
var z = document.getElementById("AaveSuccess"); 

async function init(){

    Moralis.initPlugins();

}

function buyCrypto(){
    playAudio();
    Moralis.Plugins.fiat.buy();   
}

async function launch(){
    let user = Moralis.User.current();
    
    if(user){

        $('#btn-logout').show();
        $('#moralisBar').show();
        $('#btnMyRaider').show();
        $('#btnProfile').show();
        $('#btnCaptured').show();

        $('#btn-login').hide();
        
        
        game = new Phaser.Game(config);

        console.log(user.get('ethAddress') + " " + "logged in!");
       
        
        
    }
    else if(!user){
     // alert("Please login with your Metamask Wallet to Raid portals!");
        $('#btnMyRaider').hide();
        $('#btnCaptured').hide();
      }
   
}

async function update() {
    //Player Directions
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    //Player Jump
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(jumpHeight);
        let jump = this.sound.add('jump');
        jump.play();
    }

    //Multiplayer enable
   if(player.lastX!=player.x || player.lastY!=player.y){
       let user = Moralis.User.current();
       
       positionEntry++;

       const PlayerPosition = Moralis.Object.extend("PlayerPosition");
       const playerPosition = new PlayerPosition();

       playerPosition.set('player', user.get('ethAddress'));
       playerPosition.set('x', player.x);
       playerPosition.set('y', player.y);

       player.lastX = player.x;
       player.lastY = player.y;

       await playerPosition.save();
   }   
}

async function preload() {
    that = this;

    

    this.load.image('background', 'assets/backup.png');
    this.load.image('groundLeft', 'assets/TilesB/Asset285.png');
    this.load.image('groundRight', 'assets/TilesB/Asset 284.png');
    this.load.image('ground', 'assets/TilesB/Asset 361.png');

    this.load.image('coin', 'assets/coin.png');
    this.load.image('enemy', 'assets/player.png');

    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
        );

    this.load.audio('theme', [
        'assets/audio/Aavegotchi_Raiders_Music.mp3'
    ]);

    this.load.audio('jump', [
        'assets/audio/playerJump.mp3'
    ]);

    this.load.audio('collect', [
        'assets/audio/coinCollect.mp3'
    ]);
    //
    this.load.audio('aavePounce', [
        'assets/audio/oops.mp3'
    ]);

    this.load.audio('aaveRage', [
        'assets/audio/portalOpened.mp3'
    ]);

    //fetch Aavegotchi
    const numericTraits = [1, 5, 99, 29, 1, 1]; // UI to change the traits
    const equippedWearables = [23 + levelup, 6 + levelup, 4 + levelup, 43 + levelup, 0, 4 + levelup, 0, 1 + levelup, 0, 0, 0, 3 + levelup, 7 + levelup, 0, 0, 0];

    const rawSVG = await Moralis.Cloud.run("getSVG", { numericTraits: numericTraits, equippedWearables: equippedWearables })
   
    //turn svgText into resourcephaser can use
    const svgBlob = new Blob([rawSVG], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    
    //load the resource
    this.load.image('aavegotchi', url);
    
    this.load.on('filecomplete', function () {
     
    }, this);

    this.load.start()

}

//init setup - bulk of logic
async function create ()
{
    //Enviornment
    this.add.image(400, 300, 'background').setScale(0.6);

    platforms = this.physics.add.staticGroup();

    platforms.create(80, 400, 'groundLeft').setScale(0.3).refreshBody();
    platforms.create(80 + space, 400, 'groundRight').setScale(0.3).refreshBody();

    platforms.create(250, 300, 'groundLeft').setScale(0.3).refreshBody();
    platforms.create(250 + space, 300, 'groundRight').setScale(0.3).refreshBody();

    platforms.create(425, 450, 'groundLeft').setScale(0.3).refreshBody();
    platforms.create(425 + space, 450, 'groundRight').setScale(0.3).refreshBody();

    platforms.create(600, 160, 'groundLeft').setScale(0.3).refreshBody();
    platforms.create(600 + space, 160, 'groundRight').setScale(0.3).refreshBody();

    //base for ground
    for(let i = 0; i < 100; i++){
        platforms.create(i * 38, 580, 'ground').setScale(0.3).refreshBody();
    }

    cursors = this.input.keyboard.createCursorKeys();

    player = this.physics.add.sprite(100, 450, 'dude');   
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    var music = this.sound.add('theme');
    music.play();

    

    //player animation
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //Coins 
    coins = this.physics.add.group({
        key: 'coin',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
       
    });

    coins.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    
    //Aavegotchi NPC
    aaves = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    aaveText = this.add.text(16, 36, 'Anger Level: 0', { fontSize: '32px', fill: '#000'});
    
    //Collision detcion
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(coins, platforms);
    this.physics.add.collider(aaves, platforms);
 
        //var pounce = this.sound.add('aavePounce');
        //pounce.play();
   
   
    this.physics.add.overlap(player, coins, collectCoin, null, this);

    this.physics.add.collider(player, aaves, hitAave, null, this);

    if(player.body.blocked.up || player.body.blocked.down || player.body.blocked.left || player.body.blocked.right){
        console.log("Killa You did it!");
    }

    //Multiplayer
    let user = Moralis.User.current();
    let query = new Moralis.Query('PlayerPosition');
    let subscription = await query.subscribe(); //subscription to event query
  
  subscription.on('create', (plocation) => { //Here we are checking that the player that moved is not our own player  
    if(plocation.get("player") != user.get("ethAddress")){
        console.log("someone moved!");
        console.log(plocation.get('player'));
        console.log("new X",plocation.get("x"));
        console.log("new Y", plocation.get("y"));

      //if first time seeing other player..
    if(competitors[plocation.get("player")] == undefined){
        // create a sprite
        competitors[plocation.get("player")] = this.add.image(plocation.get("x"), plocation.get("y"), 'enemy').setScale(0.3);
        }
    else
        {
        competitors[plocation.get("player")].x = plocation.get("x");
        competitors[plocation.get("player")].y = plocation.get("y");
        }
    }
  });

//Collect coins
function collectCoin (player, coin)
  {
    var collected = this.sound.add('collect');
    collected.play();

    coin.disableBody(true, true);

    score += 5;
    scoreText.setText('Score: ' + score);
    //if all coins are collected
    if (coins.countActive(true) === 0) 
    {

        levelReached+=1; //Increase stage and difficulty
        levelup+=levelup; //Interact with Aavegotchi Wearables
        angerLevel+=1; //Aavegotchi aggression monitor 
        aaveText.setText('Anger: ' + angerLevel); //Indicator of Aavegotchi aggression level
       
        var rage = this.sound.add('aaveRage');
        rage.play();

        coins.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true); 
        });
        //Revenge of the Aavegotchies!
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var aave = aaves.create(x, 18, 'aavegotchi').setScale(0.5).refreshBody();
        aave.setBounce(1);
        aave.setCollideWorldBounds(true);
        aave.setVelocity(Phaser.Math.Between(-200, 200), 20 + (angerLevel * 0.12));
    }
   }

}

async function hitAave(player, aave) {
      var pounce = this.sound.add('aavePounce');
      pounce.play();

    let user = Moralis.User.current();
    
    this.physics.pause();

    player.setTint(0xff0000);
    player.anims.play('turn');

    let highscore = score;
    const HighScore = Moralis.Object.extend("HighScore");
    const highScore = new HighScore();

    highScore.set('player', user.get('ethAddress'));
    highScore.set('score', highscore);

    const RaidHistory = Moralis.Object.extend("RaidHistory");
    const raiderHistory = new RaidHistory();

    raiderHistory.set('player', user.get('ethAddress'));
    raiderHistory.set('score', highscore);
    raiderHistory.set('level', levelReached);
    raiderHistory.set('AavegotchiAnger', angerLevel); 

    await highScore.save();
    await raiderHistory.save();

    gameOver = true;
}

//Moralis & web3 Logic

async function login() {
    let user = Moralis.User.current();
    
    if (!user) {

      user = await Moralis.Web3.authenticate();

      $('#btnMyRaider').show();
      $('#btnProfile').show();
      $('#btnCaptured').show();
      
      $(function(){
        if($('body').is('.PageType')){
          launch(); 
        }
      });

      $('#btn-logout').show();
      $('#btn-login').hide();

      


      
      }

    alert("logged in user:" + " " + user.attributes.ethAddress);
   
  }

Moralis.Web3.onAccountsChanged( async ([account]) =>{
      alert("Hey we've noticed the ACCOUNTS CHANGED: " + " " + account); 
      await playAudio(); 
      let isExecuted = confirm("Is this you? if you dont wish to merge this wallet click CANCEL otherwise click ok.");
      console.log(isExecuted)// OK = true, Cancel = false
      await playAudio();  

      if(isExecuted === true){
        await playAudio();  
        var user = await Moralis.Web3.link(account);
        alert(user + "" + "account was merged");
        await playAudio();
     }else{
        await playAudio();
         alert("Accounts were not merged please continue signing in");
         await playAudio();
     }

})

async function logOut() {
    playAudio();

    await Moralis.User.logOut();
   
    $('#btn-logout').hide();
    $('#moralisBar').hide();
    $('#btnMyRaider').hide();
    $('#btnCaptured').hide();

    $('#btn-login').show();
    

    location.reload();

    alert("you're logged out!");
    playAudio();
    playSuccess();
  }

async function dumpPositions() {
    const dumpIt = await Moralis.Cloud.run("playerposition");
    console.log("positions dumped");
    console.log(dumpIt);
}

async function tipDevs(){
    playAudio();

    let user = Moralis.User.current();
    
    if(!user){
        alert('Great! lets get you logged in so you can support developemnt!');
        
    }else{
    playSend();
        
    let grateful = await Moralis.transfer({type: "native", receiver:"0x528524b599F13F9ab203125e31F3099cD18B2B08", amount:Moralis.Units.ETH("0.005")});
    
    const DevelopmentSupport = Moralis.Object.extend("DevelopmentSupport");
    const developmentSupport = new DevelopmentSupport();
    developmentSupport.set('supporter', user.get('ethAddress'));
    developmentSupport.set('teamWallet', TEAM);
    developmentSupport.set('amount', 0.005);

    await developmentSupport.save();

    alert("From The CryptoHomie' with love, Thank you!");
    
    playSuccess();
    }
 }

async function tipTopPlayer(){
    playAudio();

    let user = Moralis.User.current();

    if(!user){

        alert("Great way to support the community! Please sign in to continue.");
        playAudio();
    }else{

        const topScoreQuery = new Moralis.Query('HighScore');
        topScoreQuery.greaterThanOrEqualTo('score', 250);
        topScoreQuery.descending('score');
        topScoreQuery.limit(1);
        scores = await topScoreQuery.find();
    
        let playerOne = scores[0].attributes.player;

        playSend();
  
        Moralis.transfer({type: "native", receiver: `${playerOne}`, amount:Moralis.Units.ETH("0.01")});

        alert('Excellent news!  The community Top Raider shall recieve your support shortly');

        const CommunitySupport = Moralis.Object.extend("CommunitySupport");
        const communitySupport = new CommunitySupport();
        communitySupport.set('supporter', user.get('ethAddress'));
        communitySupport.set('to', playerOne);
        communitySupport.set('amount', 0.01);

        await communitySupoort.save();

        alert("It takes a village, with love, Thank you for supporting the community!");

        playSuccess();
    }
} 

//real time updates
async function lookOutForLove(){
    let query = new Moralis.Query('EthTransactions');
    let subscription = await query.subscribe(); //subscribe to any change here

    //when it happens ... fire and handle
    subscription.on('create', (object) => {
        console.log("New Transaction");
        //console.log(object.attributes.value);
        console.log(object);
   
    });
}
//Development contribution charts
stayTransparent = async () => {
    const query = new Moralis.Query('DevelopmentSupport');
    let counter = 0;
    support = await query.find();

    const table = document.getElementById('DevChart');

    support.forEach( async (support)  =>{
        let row = table.insertRow();
        let chartPosition = row.insertCell(0);
        counter++;
        chartPosition.innerHTML = counter;
        let supporterAddress = row.insertCell(1);
        supporterAddress.innerHTML = await support.attributes.supporter;
        let teamWallet = row.insertCell(2);
        teamWallet.innerHTML = await  support.attributes.teamWallet;
        let amount = row.insertCell(3);
        amount.innerHTML = await  support.attributes.amount;
        let contributionDate = row.insertCell(4);
        contributionDate.innerHTML = await  support.attributes.createdAt;
    })   
    
   
    //console.log(theQuery);
    
}

communitySupport = async() => {
    
}


//High Score - Used for Homepage only display top 3
getScore = async () =>{
    const scoreQuery = new Moralis.Query('HighScore');
    scoreQuery.greaterThanOrEqualTo('score', 250);
    scoreQuery.descending('score');
    scoreQuery.limit(3);
    scores = await scoreQuery.find();

    const table = document.getElementById('TopScores');

     scores.forEach( async (scores)  =>{
        let row = table.insertRow();
        let chartPosition = row.insertCell(0);
        count++;
        chartPosition.innerHTML = count;
        let userAddress = row.insertCell(1);
        userAddress.innerHTML = await scores.attributes.player;
        let TopScore = row.insertCell(2);
        TopScore.innerHTML = await  scores.attributes.score;
    })   
}
 //Get the user raider history     
getRaiderHistory = async () =>{
  var usersRaider;
  let Raider = await Moralis.User.current();
  usersRaider = Raider.attributes.accounts;
  const raiderHistoryQuery = new Moralis.Query('RaidHistory');
  raiderHistoryQuery.equalTo('player', usersRaider[0]);
  raiderHistoryQuery.descending('score');
  raiderHistoryQuery.limit(10);

  raiderHistory = await raiderHistoryQuery.find();

  const table = document.getElementById('historyTableData');

  raiderHistory.forEach( async (raiderHistory)  =>{
          let row = table.insertRow();
          let chartPosition = row.insertCell(0);
          countRaiderHistory++;
          chartPosition.innerHTML = countRaiderHistory;

          let userAddress = row.insertCell(1);
          userAddress.innerHTML = await raiderHistory.attributes.player;

          let TopScore = row.insertCell(2);
          TopScore.innerHTML = await  raiderHistory.attributes.score;

          let scoreOnLevel = row.insertCell(3);
          scoreOnLevel.innerHTML = await raiderHistory.attributes.level;

          let aavegotchiAnger = row.insertCell(4);
          aavegotchiAnger.innerHTML = await raiderHistory.attributes.AavegotchiAnger;
          let raidersTriumph = row.insertCell(5);
          raidersTriumph.innerHTML = await raiderHistory.createdAt;

  })     
}
//get top 10 scores
getTopRaiderScore = async () =>{
    const scoreQuery = new Moralis.Query('HighScore');
    scoreQuery.greaterThanOrEqualTo('score', 250);
    scoreQuery.descending('score');
    scoreQuery.limit(10);
    scores = await scoreQuery.find();

    const table = document.getElementById('allTopScores');

     scores.forEach( async (scores)  =>{
        let row = table.insertRow();
        let chartPosition = row.insertCell(0);
        countTopRaider++;
        chartPosition.innerHTML = countTopRaider;
        let userAddress = row.insertCell(1);
        userAddress.innerHTML = await scores.attributes.player;
        let TopScore = row.insertCell(2);
        TopScore.innerHTML = await  scores.attributes.score;
        let raidersTriumph = row.insertCell(3);
          raidersTriumph.innerHTML = await scores.createdAt; 
    })
       
}

//some of the Sonic logic
function playAudio() { 
  x.play(); 
}

function playSend(){ 
    y.play(); 
  } 
  
function playSuccess() { 
    z.play(); 
  } 

function pauseAudio() { 
  x.pause(); 
} 

// Revernge text - Wrap every letter in a span
var textWrapper = document.querySelector('.ml1 .letters');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: true})
  .add({
    targets: '.ml1 .letter',
    scale: [0.3,1],
    opacity: [0,1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 600,
    delay: (el, i) => 70 * (i+1)
  }).add({
    targets: '.ml1 .line',
    scaleX: [0,1],
    opacity: [0.5,1],
    easing: "easeOutExpo",
    duration: 700,
    offset: '-=875',
    delay: (el, i, l) => 80 * (l - i)
  }).add({
    targets: '.ml1',
    opacity: 0,
    duration: 1000,
    easing: "easeOutExpo",
    delay: 1000
  });


init();
getScore();  
getRaiderHistory();
getTopRaiderScore();
launch();  
lookOutForLove();
stayTransparent();


document.getElementById("btn-login").onclick = login;
document.getElementById("btn-logout").onclick = logOut;  
document.getElementById("btnBuy").onclick = buyCrypto;

//Not Yet implemented 9/5/21 5:51AM - Mikal

//getNFTs();
//getTokens();


/*
 async function getNFTs(){
    const testUser = '0x5cf6cc6a40fb56f2fb0e186903de8753b6f85511';
    const aaveContract = '0x86935f11c86623dec8a25696e1c19a8659cbf95d';

    const options = {chain:'matic', address: testUser, token_address: aaveContract}
    const nfts = await Moralis.Web3API.account.getNFTs(options); 

     console.log(nfts);
     console.log('entering for loop');
     
    nfts.forEach( function(nft){
        let url = fixURL(nft.token_uri);  

        fetch(url)
        .then(response => response.json())
        .then(data => {
            $('#content').html($('#content').html()+'<h2>'+data.name+'</h2>');
            $('#content').html($('#content').html()+'<h3>'+data.description+'</h2>');
            $('#content').html($('#content').html()+"<img width=100 height=100 src='"+fixURL(data.image)+"'></img>");
        });
    });  
   
}

function fixURL(url){
    if(url.startsWith("ipfs")){
        return "https://ipfs.moralis.io:2053/ipfs/"+url.split("ipfs://ipfs/").slice(-1)[0];
    }else{
        return url+"?format=json";
    }
}



async function getTokens(){
const options = { chain: 'eth', address: "0x2e4224b755a4dfa991658742852061d4ca953484" }
const balances = await Moralis.Web3API.account.getTokenBalances(options);
console.log("Tokens: " + "" + balances);
}




getCommunityChamp = async () => {
    const supporterQuery = new Moralis.Quer('CommunitySupport');
    supporterQuery.descending('createdAt');
    supporterQuery.limt(27);

    support = await supporterQuery.find();

    const table = document.getElementById('scrollTable');
    let count = 0;

    support.forEach( async (support)  =>{
        let row = table.insertRow();
        let chartPosition = row.insertCell(0);
        countTopRaider++;
        chartPosition.innerHTML = count;
        let userAddress = row.insertCell(1);
        userAddress.innerHTML = await support.attributes.supporter;
        let TopScore = row.insertCell(2);
        TopScore.innerHTML = await  support.attributes.to;
        let supportValue = row.insertCell(3);
        supportValue.innerHTML = await support.attribute.amount; 
        let supportGiven = row.insertCell(3);
        supportGiven.innerHTML = await support.createdAt;   
    })


}

*/