(function(){
window.GameModules=window.GameModules||{};
var QS=[
  {q:"A=5, B=3 болса. A+B=?",                                   a:"8",   opts:["6","7","8","9"],     hint:"5+3=8"},
  {q:"Жүрек=10, Жұлдыз=4. Жүрек-Жұлдыз=?",                     a:"6",   opts:["4","5","6","7"],     hint:"10-4=6"},
  {q:"Шеңбер=6, Үшбұрыш=2. Шеңбер x Үшбұрыш=?",               a:"12",  opts:["8","10","12","14"],  hint:"6x2=12"},
  {q:"Ай+Күн=15, Күн=7. Ай=?",                                 a:"8",   opts:["6","7","8","9"],     hint:"15-7=8"},
  {q:"Гауһар=4, Шаршы=? Гауһар x Шаршы=20. Шаршы=?",         a:"5",   opts:["4","5","6","7"],     hint:"20/4=5"},
  {q:"A+B=12, B=5. A x B=?",                               a:"35",  opts:["25","30","35","40"], hint:"A=7, 7x5=35"},
  {q:"X/Y=4, Y=3. X=?",                                    a:"12",  opts:["10","11","12","13"], hint:"4x3=12"},
  {q:"P+Q=10, P-Q=2. P=?",                                 a:"6",   opts:["4","5","6","7"],     hint:"(10+2)/2=6"},
  {q:"A x B=24, A=6. A+B=?",                               a:"10",  opts:["8","9","10","11"],   hint:"B=24/6=4, 6+4=10"},
  {q:"Қызыл=3, Көк=5, Жасыл=7. Қызыл x Көк + Жасыл=?",       a:"22",  opts:["18","20","22","24"], hint:"3x5=15, 15+7=22"},
];
var SHAPES=["&#9829;","&#9733;","&#9679;","&#9650;","&#9632;","&#9670;","&#9728;","&#9824;","&#10084;","&#9889;"];
var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function startLevel(lvl){
  var L=QS[Math.min(lvl-1,QS.length-1)];
  st={dengei:lvl,L:L,upai:200,kenes:2,used:false,showHint:false};
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}
function shuffle(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}return b;}
function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var L=st.L;var shape=SHAPES[(st.dengei-1)%SHAPES.length];
  var opts=shuffle(L.opts.slice());
  c.innerHTML=
    "<div class='game-question-card g-center'>"+
      "<div class='tamga-shape'>"+shape+"</div>"+
      "<div class='tamga-title'>Деңгей "+st.dengei+" / 10 — Tamba Shesher</div>"+
      "<div class='tamga-q'>"+L.q+"</div>"+
      opts.map(function(o){return "<button class='ans-btn center' data-a='"+o+"'>"+o+"</button>";}).join("")+
      "<div class='g-actions'><button class='btn btn-ghost btn-sm' id='hint-t'"+(st.kenes<=0?" disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button></div>"+
    "</div>"+
    "<div id='hint-b' class='hint-box"+(st.showHint?"":" hidden")+"'><span>&#128161;</span> "+L.hint+"</div>";
  c.querySelectorAll("[data-a]").forEach(function(b){b.addEventListener("click",function(){if(!st.used)check(b.dataset.a);});});
  var hb=document.getElementById("hint-t");
  if(hb)hb.addEventListener("click",function(){
    if(st.kenes>0&&!st.showHint){
      st.kenes--;
      st.showHint=true;
      st.upai=Math.max(50,st.upai-60);
      GameEngine.setScore(st.upai);
      render();
    }
  });
}
function check(ans){
  st.used=true;var ok=ans===st.L.a;
  document.querySelectorAll("[data-a]").forEach(function(b){b.disabled=true;if(b.dataset.a===st.L.a)b.classList.add("correct");else if(b.dataset.a===ans&&!ok)b.classList.add("wrong");});
  var hintsUsed=2-st.kenes;
  if(ok){
    var stars=capStarsByHints(3,hintsUsed);
    GameEngine.setScore(st.upai+100);
    setTimeout(function(){GameEngine.completeLevel(stars);},600);
  }
  else{GameEngine.setScore(Math.max(50,st.upai-50));setTimeout(function(){GameEngine.completeLevel(1);},1000);}
}
window.GameModules.tamga={startLevel:startLevel};
})();
