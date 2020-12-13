let notesPic =[];

let flagtone=false;

let video;
var ctracker;
var positions = [];
var emotions = new emotionClassifier();
var predictedEmotions;
emotions.init(emotionModel);
var emotionData = emotions.getBlank();

  var context = new AudioContext();


let bpm = 30;

let handpose;
let predictions = [];

let prediction;
let toe;

var emotionTone;
var emotionTone2;

//visual sound special effects
let drawDisgus = false;
let drawHappy = false;
let drawSurp = false;

var major=[2,4,5,7,9,11];//positive emotions
var minor=[2,3,5,7,9,10];//negative emotions

var player = new Tone.Sampler({
  "A1": "A1.mp3",
  "C2": "C2.mp3",
  "E2": "E2.mp3",
  "G2": "G2.mp3"
});

var player2 = new Tone.Sampler({
  "C1": "tonelate/C1guitar.mp3",
  "A1": "tonelate/A1late.mp3",
  "C2": "tonelate/C2late.mp3",
  "D2": "tonelate/D2guitar.mp3",
  "G2": "tonelate/G2late.mp3"
});


function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);
    video.id("v");
    var mv = document.getElementById("v");
    mv.muted = true;
  
  
    //load clmtrackr to detect face
    ctracker = new clm.tracker();
    ctracker.init(pModel);
    ctracker.start(video.elt);

    handpose = ml5.handpose(video, modelReady);
    // This sets up an event that fills the global variable "predictions"
    // with an array every time new hand poses are detected
    handpose.on("predict", results => {
      predictions = results;
    });

    // Hide the video element, and just show the canvas
    video.hide();
    
    //Tone.start();
    // Tone.Transport.toggle();
    // print("Press toggle");
}

player.toMaster();
player2.toMaster();
Tone.Transport.scheduleRepeat(onBeat,"16n");
Tone.Transport.bpm.rampTo(bpm, 0.1);

Tone.Transport.scheduleRepeat(emotionEffect,"4n");

function emotionEffect(time){
  // var playerGuitar = new Tone.Player("guitar.mp3").toDestination();
  // //play as soon as the buffer is loaded
  // playerGuitar.autostart = true;
  if(emotionTone<35){
    var randomlateN= round(random(5));
    var lateToneN = emotionTone+minor[randomlateN];
    var defaultSoundMinor = Tone.Frequency(lateToneN, "midi");
    player2.volume.value = -5;
    player2.triggerAttack(defaultSoundMinor);
    
    var randomEffect = random(0,2);
    if(randomEffect>1){
      var playerDisguse = new Tone.Player("effectsSound/disguse.wav").toDestination();
      playerDisguse.volume.value = -15;
      playerDisguse.autostart = true;
      drawDisgus = true;
    }
  }else{
    drawDisgus = false;
  }
  
  if(emotionTone>25)
  {
    var randomlate= round(random(5));
    var lateTone = emotionTone+major[randomlate];
    var defaultSoundMajor = Tone.Frequency(lateTone, "midi");
    player.volume.value = -15;
    player.triggerAttack(defaultSoundMajor);
    
    var randomEffect2 = random(0,2);
     if(randomEffect2<1){
       var playerHappys = new Tone.Player("effectsSound/happys.wav").toDestination();
       playerHappys.volume.value = -15;
       playerHappys.autostart = true;
       drawHappy = true;
       drawSurp = false;
     }else{
      drawHappy = false;
     }
    if(randomEffect2>1){
      var playerSurprises = new Tone.Player("effectsSound/surprises.wav").toDestination();
      playerSurprises.volume.value = -15;
      playerSurprises.autostart = true;
      drawHappy = false;
       drawSurp = true;
    }else{
       drawSurp = false;
    }
  
  }
  
}

function onBeat(time){
  print("onBeat");
  
  if(Tone.Transport.state=="started" && !flagtone){
    //Tone.Transport.stop();
    flagtone = true;
    print("started");
    var middleC = Tone.Frequency(25,"midi");
    player.triggerAttack(middleC);
  }
  if(flagtone){
    
    
  if(toe){
    for(let iNote = 0;iNote<notesPic.length;iNote++){
         var distSound = dist(toe[0],toe[1],notesPic[iNote].x,notesPic[iNote].y);
         if(distSound<25){
           var noteObject = Tone.Frequency(notesPic[iNote].index, "midi");
           player.volume.value = -20;
           player.triggerAttack(noteObject);
           notesPic[iNote].isSound = true;
         }
      else{
        notesPic[iNote].isSound = false;
      }
       }
    if(toe[1]>100){
         if(emotions){
      var noToeSound = Tone.Frequency(emotionTone, "midi");
           player.volume.value = -1;
      player.triggerAttack(noToeSound);
    }else{
      player.volume.value = -1;
      player.triggerAttack("E2");
    }
       }
    }
  else{
    if(emotions){
      var emotionsN = emotionTone2+round(random(4));
    var defaultSound = Tone.Frequency(emotionsN, "midi");
      player.volume.value = -1;
    player.triggerAttack(defaultSound);
      var defaultSafter = Tone.Frequency(emotionsN+6, "midi");
    player2.triggerAttackRelease(defaultSafter,"8n","16n");
    }  }
  updateTempo(bpm);
  }
}

function updateTempo(){
  bpm = 30+round(emotionTone2*1.2)-round(emotionTone);
  Tone.Transport.bpm.rampTo( bpm, 0.1);
}

function modelReady() {
  console.log("Model ready!");
}
      
function draw() {
    image(video, 0, 0, width, height);
    
    for(let i=0; i<8;i++){
    notesPic.push(new notesClass({x:100+i*60, y:50, index:i+30}));
    }
    for(let i=0; i<8;i++){
    notesPic.push(new notesClass({x:100+i*60, y:90, index:i+39}));
    }

    // get array of face marker positions [x, y] format
    positions = ctracker.getCurrentPosition();
    //getPositions();
  
    var cp = ctracker.getCurrentParameters();
    predictedEmotions = emotions.meanPredict(cp);
    //getEmotions();
    clear();

    
    noStroke();
    fill(0,150);
    rectMode(CORNER);
    rect(0,0,width,height);

    drawKeypoints();
    drawPoints();
  
    push();
    fill(225,210,210,98);
    if(drawSurp === true){
      triangle(50,10,80,10,80,100);
      triangle(590,10,560,10,560,100);
    }
    if(drawHappy === true){
      triangle(10,120,100,120,100,300);
      triangle(630,120,540,120,540,300);
    }
    if(drawDisgus === true){
      triangle(0,300,60,300,60,440);
      triangle(640,300,580,300,580,440);
    }
    pop();
    //detect hand's gesture
    print(predictions);
    
    for(let i = 0;i<notesPic.length;i++){
      notesPic[i].view();
    }

    if (emotions) {
        // angry=0, disgust=1, fear=2, sad=3, surprised=4, happy=5
        for (var i = 0;i < predictedEmotions.length;i++) {
            noStroke();
            rectMode(CORNER);
            fill(200,220,220);
            rect(i * 110+20, height-80, 30, -predictedEmotions[i].value * 30);
          
          emotionTone = 40-(round(10*predictedEmotions[0].value+11*predictedEmotions[1].value+12*predictedEmotions[2].value+9*predictedEmotions[3].value));
            emotionTone2 = round(30*predictedEmotions[4].value)+round(40*predictedEmotions[5].value)+20;
            print(emotionTone);
            print("emotionTone2", emotionTone2);
        }
    }
  
    
    text("ANGRY", 20, height-50);
    text("DISGUST", 130, height-50);
    text("FEAR", 245, height-50);
    text("SAD", 355, height-50);
    text("SURPRISED", 450, height-50);
    text("HAPPY", 570, height-50);
    
    text("Press the mouse to start or stop. You could touch the notes by your index finger", 85, height-20);
  

}


  
 function mousePressed(){
   if(!flagtone){
     context.resume().then(() => {
    console.log('Playback resumed successfully');
  });
     Tone.start();
     flagtone = true;
     print("started");
     var middleC = Tone.Frequency(25,"midi");
     player.triggerAttack(middleC);
   }
   if(flagtone){
     Tone.Transport.toggle();
     print("Press toggle");
   }
   
 }



// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  var handSize = 3;
    //visualization
          if(emotionTone<38){
             fill(210,180,180);
            handSize = 4;
           }
           else{
             fill(180,180,210);
             handSize = 6;
           }
  for (let i = 0; i < predictions.length; i += 1) {
    prediction = predictions[i];
    //find index fingertip
    //fill(0,0,255);
    toe= prediction.landmarks[8];
    rectMode(CENTER);
    rect(toe[0],toe[1],10,10);
    if(emotions){
      if(emotionTone<35){
        push();
        //blue water drop
        fill(154,223,250);
        ellipse(toe[0],toe[1],26);
        triangle(toe[0]+14,toe[1],toe[0]-14,toe[1],toe[0],toe[1]-25);
        //reflect white
        fill(214,240,250);
        ellipse(toe[0]+4,toe[1]-8,3,6);
        pop();
      }
      else{
        push();
        fill(255,176,202);
        triangle(toe[0]+15,toe[1],toe[0]-15,toe[1],toe[0],toe[1]+20);
        triangle(toe[0]+15,toe[1],toe[0],toe[1],toe[0]+7,toe[1]-15);
        triangle(toe[0]-15,toe[1],toe[0],toe[1],toe[0]-7,toe[1]-15);
        pop();
      }
    }
    

    for (let j = 0; j < prediction.landmarks.length; j += 1) {
      const keypoint = prediction.landmarks[j];
      //fill(0, 255, 0);
      noStroke();
      ellipse(keypoint[0], keypoint[1], handSize, handSize);
    }
    
  }
    
}


function drawPoints() {
    var faceSize = 3;
    //visualization
          if(emotionTone<38){
             fill(210,180,180);
            faceSize = 5;
           }
           else{
             fill(180,180,210);
             faceSize = 2;
           }
    for (var i=0; i<positions.length -3; i++) {
        ellipse(positions[i][0], positions[i][1], faceSize, faceSize);
    }
}

class notesClass{
  constructor(args){
    this.x=args.x===undefined? ranom(height):args.x;
    this.y=args.y;
    this.s=10;
    this.index = args.index===undefined?25:args.index;
    this.isSound = false;
  }
  view(){
    let floatY = this.y;
    fill(255, 220,220,50);//notes clicking clues
    noStroke();
    if(this.isSound===true){
      ellipse(this.x, floatY, 3*this.s);
    }
    fill(this.x, 220,220);
    noStroke();
    ellipse(this.x, floatY, 2*this.s);
    strokeWeight(2);
    stroke(this.y-50,50,50);
    line(this.x+this.s, floatY, this.x+this.s, floatY-20);
    curve(this.x, floatY, this.x+this.s, floatY-23, this.x+this.s+6, floatY-17,this.x+this.s+16, floatY-30);
  }
  soundChord(){
 
  }
}


function modelLoaded() {
  print('model loaded'); 
}

