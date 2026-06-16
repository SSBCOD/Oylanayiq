(function(){
'use strict';
window.GameModules=window.GameModules||{};

// 10 Қазақстан-related words with clues (6 letters each)
var WORDS=[
  {word:"НОМАД",hint:"Көшпелі адам – қазақ тарихының негізі",letters:5},
  {word:"ДАЛА",hint:"Қазақ даласы – кең, шексіз кеңістік",letters:6},
  {word:"КИІЗ",hint:"Қазақтың дәстүрлі тұрғын үйі – көшпелілердің баспанасы",letters:4},
  {word:"ТЕҢГЕ",hint:"Қазақстанның мемлекеттік валютасы",letters:5},
  {word:"БҮРКІТ",hint:"Қазақ бүркітшілерінің айбатты құсы – бүркіт",letters:5},
  {word:"БӘЙТЕРЕК",hint:"Астананың белгісі – аспанға шаншылған зәулім ағаш",letters:8},
  {word:"ДОМБЫРА",hint:"Қазақтың ұлы саз аспабы – екі ішекті",letters:7},
  {word:"НАУРЫЗ",hint:"22 наурызда аталатын қазақ жаңа жылы",letters:6},
  {word:"ТӘҢІРІ",hint:"Көне түркі-моңғол сенімі – Тәңір, Көк Тәңірі",letters:6},
  {word:"ҚАЗАҚ",hint:"Өзінің елдігін сақтаған еркін халық",letters:6},
];

var ALPHABET="АӘБВГҒДЕЁЖЗИЙКҚЛМНҢОӨПРСТУҰҮФХҺЦЧШЩЪЫІЬЭЮЯ".split("");
var MAX_WRONG=6;
var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function starsByMistakes(wrongCount,wordLen){
  var len=wordLen||6;
  var t3=len>=7?1:0;
  var t2=len>=7?3:2;
  if(wrongCount<=t3)return 3;
  if(wrongCount<=t2)return 2;
  return 1;
}

function startLevel(lvl){
  var W=WORDS[Math.min(lvl-1,WORDS.length-1)];
  st={dengei:lvl,word:W.word,hint:W.hint,guessed:[],wrong:[],upai:400,kenes:2};
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var W=st.word;
  var wrongLeft=MAX_WRONG-st.wrong.length;
  var allRevealed=W.split("").every(function(l){return st.guessed.indexOf(l)>=0;});

  // Hangman figure
  var hang="<div class='hang-wrap'>"+drawHangman(st.wrong.length)+"</div>";

  // Word display
  var wordDisp="<div class='word-row'>"+
    W.split("").map(function(l){
      var revealed=st.guessed.indexOf(l)>=0;
      return "<div class='word-slot"+(revealed?" on":"")+"'>"+(revealed?l:"")+"</div>";
    }).join("")+
  "</div>";

  // Keyboard
  var kb="<div class='kbd'>"+
    ALPHABET.map(function(l){
      var guessed=st.guessed.indexOf(l)>=0||st.wrong.indexOf(l)>=0;
      var isWrong=st.wrong.indexOf(l)>=0;
      var isRight=st.guessed.indexOf(l)>=0;
      var cls="key-btn"+(isWrong?" wrong":isRight?" right":"");
      return "<button class='"+cls+"' data-l='"+l+"'"+(guessed?" disabled":"")+">"+l+"</button>";
    }).join("")+
  "</div>";

  c.innerHTML=
    "<div class='game-question-card'>"+
      "<div class='g-head'>"+
        "<div class='g-head-ico'>&#x1F3AE;</div>"+
        "<div class='g-head-sub'>Soztorr · Сөзді табыңыз</div>"+
      "</div>"+
      "<div class='g-prompt tight'>&#128161; "+st.hint+"</div>"+
      "<div class='g-kpis'>"+
        "<span class='g-kpi red'><span class='v'>"+st.wrong.length+"</span> <span>/ "+MAX_WRONG+" Қате</span></span>"+
        "<span class='g-kpi green'><span class='v'>"+wrongLeft+"</span> <span>Мүмкіндік</span></span>"+
      "</div>"+
      hang+
      wordDisp+
      kb+
      "<div class='g-actions'>"+
        "<button class='btn btn-ghost btn-sm' id='hint-s' "+(st.kenes<=0?"disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button>"+
      "</div>"+
    "</div>";

  if(!allRevealed&&st.wrong.length<MAX_WRONG){
    c.querySelectorAll(".key-btn:not([disabled])").forEach(function(b){
      b.addEventListener("click",function(){guess(b.dataset.l);});
    });
  }
  document.getElementById("hint-s").onclick=function(){
    if(st.kenes<=0)return;st.kenes--;
    // Reveal one unknown letter
    var unknown=st.word.split("").filter(function(l){return st.guessed.indexOf(l)<0;});
    if(unknown.length>0){
      var idx=Math.floor(Math.random()*unknown.length);
      st.guessed.push(unknown[idx]);
      st.upai=Math.max(50,st.upai-60);
      GameEngine.setScore(st.upai);
    }
    render();
  };
}

function drawHangman(wrong){
  var parts=[
    // head
    "<circle cx='60' cy='30' r='12' fill='none' stroke='currentColor' stroke-width='3'/>",
    // body
    "<line x1='60' y1='42' x2='60' y2='75' stroke='currentColor' stroke-width='3'/>",
    // left arm
    "<line x1='60' y1='52' x2='40' y2='65' stroke='currentColor' stroke-width='3'/>",
    // right arm
    "<line x1='60' y1='52' x2='80' y2='65' stroke='currentColor' stroke-width='3'/>",
    // left leg
    "<line x1='60' y1='75' x2='40' y2='92' stroke='currentColor' stroke-width='3'/>",
    // right leg
    "<line x1='60' y1='75' x2='80' y2='92' stroke='currentColor' stroke-width='3'/>",
  ];
  var svg="<svg width='120' height='110'>"+
    "<line x1='10' y1='105' x2='110' y2='105' stroke='currentColor' stroke-width='3'/>"+
    "<line x1='30' y1='105' x2='30' y2='5' stroke='currentColor' stroke-width='3'/>"+
    "<line x1='30' y1='5' x2='60' y2='5' stroke='currentColor' stroke-width='3'/>"+
    "<line x1='60' y1='5' x2='60' y2='18' stroke='currentColor' stroke-width='2'/>";
  for(var i=0;i<wrong;i++) svg+=parts[i];
  svg+="</svg>";
  return svg;
}

function guess(letter){
  if(st.guessed.indexOf(letter)>=0||st.wrong.indexOf(letter)>=0)return;
  if(st.word.indexOf(letter)>=0){
    st.guessed.push(letter);
    st.upai+=30;
  } else {
    st.wrong.push(letter);
    st.upai=Math.max(50,st.upai-40);
  }
  GameEngine.setScore(st.upai);render();
  // Check win/lose
  var allRevealed=st.word.split("").every(function(l){return st.guessed.indexOf(l)>=0;});
  if(allRevealed){
    var hintsUsed=2-st.kenes;
    var zhuldyzdar=capStarsByHints(starsByMistakes(st.wrong.length,st.word.length),hintsUsed);
    setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},400);
  } else if(st.wrong.length>=MAX_WRONG){
    // Reveal word and complete with 1 star
    st.word.split("").forEach(function(l){if(st.guessed.indexOf(l)<0)st.guessed.push(l);});
    render();
    setTimeout(function(){GameEngine.completeLevel(1);},600);
  }
}

window.GameModules.soztorr={startLevel:startLevel};
})();
