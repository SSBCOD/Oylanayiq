(function(){
'use strict';
window.GameModules=window.GameModules||{};

// Cards grouped by lvl (pairs count increases)
var CARD_SETS=[
  ["&#x1F1F0;&#x1F1FF;","&#x1F0CF;","&#x1F5BC;","&#x1F4D6;","&#x1F3B5;","&#x1F98B;"],    // 6 pairs
  ["&#x1F40A;","&#x1F986;","&#x1F993;","&#x1F9AC;","&#x1F412;","&#x1F435;","&#x1F433;","&#x1F98A;"],  // 8 pairs
  ["&#x1F1F0;&#x1F1FF;","&#x1FA96;","&#x1F9B1;","&#x1F408;","&#x1F9BB;","&#x1F407;","&#x1FAA2;","&#x1F99D;","&#x1F993;","&#x1F432;"], // 10 pairs
];

// Level buckets: levels 1-3 use set 0, 4-6 use set 1, 7-10 use set 2
function getSet(lvl){return lvl<=3?0:lvl<=6?1:2;}

var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}

function startLevel(lvl){
  var setIdx=getSet(lvl);
  var icons=CARD_SETS[setIdx];
  var pairs=icons.concat(icons); // duplicate for pairs
  pairs=shuffle(pairs);
  st={
    dengei:lvl,cards:pairs.map(function(ico,i){return{id:i,ico:ico,flipped:false,matched:false};}),
    first:null,second:null,lock:false,upai:400,moves:0,kenes:2
  };
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var cols=st.cards.length<=12?4:5;

  var grid="<div class='mem-grid' style='--cols:"+cols+";'>";
  st.cards.forEach(function(card,i){
    var show=card.flipped||card.matched;
    grid+="<div class='mem-tile"+(show?" show":"")+(card.matched?" matched":"")+"' data-id='"+i+"'>"+(show?card.ico:"&#x2753;")+"</div>";
  });
  grid+="</div>";

  c.innerHTML=
    "<div class='g-hud'>"+
      "<div class='g-hud-card blue'><div class='g-hud-val'>"+st.moves+"</div><div class='g-hud-lbl'>Жүрістер</div></div>"+
      "<div class='g-hud-card green'><div class='g-hud-val'>"+(st.cards.filter(function(c){return c.matched;}).length/2)+"</div><div class='g-hud-lbl'>Табылған</div></div>"+
      "<div class='g-hud-card amber'><div class='g-hud-val'>"+(st.cards.length/2)+"</div><div class='g-hud-lbl'>Барлығы</div></div>"+
    "</div>"+
    "<div class='g-note'>Екі бірдей карточканы табыңыз!</div>"+
    grid+
    "<div class='g-actions'>"+
      "<button class='btn btn-ghost btn-sm' id='hint-e' "+(st.kenes<=0?"disabled":"")+">&#x1F441; Кеңес ("+st.kenes+")</button>"+
    "</div>";

  c.querySelectorAll(".mem-tile").forEach(function(el){
    el.addEventListener("click",function(){
      if(st.lock)return;
      var id=parseInt(el.dataset.id);
      var card=st.cards[id];
      if(card.matched||card.flipped)return;
      flip(id);
    });
  });
  var he=document.getElementById("hint-e");
  if(he)he.addEventListener("click",function(){
    if(st.kenes<=0)return;st.kenes--;
    // Flash all unmatched cards briefly
    var unmatched=st.cards.filter(function(c){return !c.matched&&!c.flipped;});
    unmatched.forEach(function(c){c.flipped=true;});
    render();
    setTimeout(function(){
      unmatched.forEach(function(c){c.flipped=false;});
      st.upai=Math.max(50,st.upai-60);GameEngine.setScore(st.upai);
      render();
    },1000);
  });
}

function flip(id){
  var card=st.cards[id];
  card.flipped=true;
  if(!st.first){st.first=id;render();return;}
  if(st.second!==null)return;
  st.second=id;st.moves++;st.lock=true;render();
  setTimeout(function(){check();},600);
}

function check(){
  var a=st.cards[st.first],b=st.cards[st.second];
  if(a.ico===b.ico){
    a.matched=b.matched=true;
    st.upai+=50;
  } else {
    a.flipped=b.flipped=false;
    st.upai=Math.max(50,st.upai-10);
  }
  st.first=null;st.second=null;st.lock=false;
  GameEngine.setScore(st.upai);
  render();
  // Check win
  if(st.cards.every(function(c){return c.matched;})){
    var pairsCount=st.cards.length/2;
    var L=Math.max(1,Math.min(10,st.dengei||1));
    var extra=Math.floor((L-1)/3);
    var t3=pairsCount+2+extra;
    var t2=pairsCount*2+2+extra*2;
    var base=st.moves<=t3?3:st.moves<=t2?2:1;
    var hintsUsed=2-st.kenes;
    var zhuldyzdar=capStarsByHints(base,hintsUsed);
    setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},400);
  }
}

function shuffle(a){
  var b=a.slice();
  for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}
  return b;
}

window.GameModules.estek={startLevel:startLevel};
})();
