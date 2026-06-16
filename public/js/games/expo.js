(function(){
'use strict';
window.GameModules=window.GameModules||{};

var LEVELS=[
  // 1-3 Easy patterns
  {d:1,q:"2, 4, 6, 8, ?",opts:["9","10","11","12"],a:1,hint:"Әр сан 2-ге ұлғаяды"},
  {d:1,q:"1, 3, 5, 7, ?",opts:["8","9","10","11"],a:1,hint:"Тақ сандар: 2-ге ұлғаяды"},
  {d:1,q:"10, 20, 30, 40, ?",opts:["45","50","55","60"],a:1,hint:"Әр сан 10-ға ұлғаяды"},
  // 4-5 Medium
  {d:2,q:"1, 4, 9, 16, ?",opts:["20","25","30","36"],a:1,hint:"Квадрат сандар: 1²,2²,3²,4²,5²"},
  {d:2,q:"1, 2, 4, 8, ?",opts:["12","14","16","18"],a:2,hint:"Әр сан 2-ге көбейтіледі"},
  {d:2,q:"3, 6, 12, 24, ?",opts:["36","40","48","60"],a:2,hint:"Әр сан 2-ге көбейтіледі"},
  // 6-7 Fibonacci-like
  {d:2,q:"1, 1, 2, 3, 5, ?",opts:["6","7","8","9"],a:2,hint:"Алдыңғы екі санның қосындысы"},
  {d:2,q:"2, 3, 5, 8, 13, ?",opts:["18","19","20","21"],a:3,hint:"Алдыңғы екі санның қосындысы"},
  {d:2,q:"100, 50, 25, ?",opts:["10","12","12.5","15"],a:2,hint:"Әр сан 2-ге бөлінеді"},
  // 8-10 Hard
  {d:3,q:"1, 8, 27, 64, ?",opts:["100","125","150","175"],a:1,hint:"Куб сандар: 1³,2³,3³,4³,5³"},
  {d:3,q:"2, 6, 12, 20, 30, ?",opts:["40","42","44","48"],a:1,hint:"Айырмалар: 4,6,8,10,12..."},
  {d:3,q:"3, 7, 15, 31, ?",opts:["47","55","63","70"],a:2,hint:"Әр сан 2-ге көбейтіліп 1 қосылады"},
  // Bonus
  {d:2,q:"1, 3, 6, 10, 15, ?",opts:["18","20","21","24"],a:2,hint:"Үшбұрышты сандар: +2,+3,+4,+5,+6"},
  {d:2,q:"5, 10, 20, 40, ?",opts:["60","70","80","100"],a:2,hint:"Әр сан 2-ге көбейтіледі"},
  {d:3,q:"2, 5, 10, 17, 26, ?",opts:["35","37","39","41"],a:1,hint:"Айырмалар: 3,5,7,9,11..."},
];

var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function difficultyForLevel(lvl){return lvl<=3?1:lvl<=7?2:3;}
function pickLevel(lvl){
  var d=difficultyForLevel(lvl);
  var pool=LEVELS.filter(function(x){return (x.d||2)<=d;});
  if(pool.length===0)pool=LEVELS;
  return pool[(lvl-1)%pool.length];
}

function startLevel(lvl){
  var L=pickLevel(lvl);
  st={dengei:lvl,L:L,upai:250,kenes:2,used:false,showHint:false};
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}

function shuffle(a){
  var b=a.slice();
  for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}
  return b;
}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var L=st.L;
  var opts=shuffle(L.opts.map(function(o,i){return{t:o,i:i};}));
  var parts=L.q.split(",").map(function(p){return p.trim();});

  c.innerHTML=
    "<div class='game-question-card'>"+
      "<div class='g-head'>"+
        "<div class='g-head-ico'>&#x1F522;</div>"+
        "<div class='g-head-sub'>San Alemi · Қатарды табыңыз</div>"+
      "</div>"+
      "<div class='seq-row'>"+
        parts.map(function(p){
          var isQ=p==="?";
          return "<div class='seq-box"+(isQ?" q":"")+"'>"+p+"</div>";
        }).join("")+
      "</div>"+
      opts.map(function(o){
        return "<button class='ans-btn' data-i='"+o.i+"'>"+o.t+"</button>";
      }).join("")+
      "<div class='g-actions'>"+
        "<button class='btn btn-ghost btn-sm' id='hint-x' "+(st.kenes<=0?"disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button>"+
      "</div>"+
    "</div>"+
    "<div id='hint-xb' class='hint-box"+(st.showHint?"":" hidden")+"'><span>&#128161;</span> "+L.hint+"</div>";

  if(!st.used){
    c.querySelectorAll(".ans-btn").forEach(function(b){
      b.addEventListener("click",function(){check(parseInt(b.dataset.i));});
    });
  }
  document.getElementById("hint-x").onclick=function(){
    if(st.kenes<=0||st.showHint)return;
    st.kenes--;
    st.showHint=true;
    st.upai=Math.max(50,st.upai-60);
    GameEngine.setScore(st.upai);
    render();
  };
}

function check(chosen){
  if(st.used)return;st.used=true;
  var ok=chosen===st.L.a;
  document.querySelectorAll(".ans-btn").forEach(function(b){
    b.disabled=true;var i=parseInt(b.dataset.i);
    if(i===st.L.a)b.classList.add("correct");
    else if(i===chosen&&!ok)b.classList.add("wrong");
  });
  st.showHint=true;
  render();
  GameEngine.setScore(ok?st.upai+100:Math.max(50,st.upai-50));
  if(ok){
    var hintsUsed=2-st.kenes;
    var stars=capStarsByHints(3,hintsUsed);
    setTimeout(function(){GameEngine.completeLevel(stars);},700);
  } else {
    setTimeout(function(){GameEngine.completeLevel(1);},1300);
  }
}

window.GameModules.expo={startLevel:startLevel};
})();
