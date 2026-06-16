(function(){
'use strict';
window.GameModules=window.GameModules||{};

var LEVELS=[
  // Type: odd-one-out
  {d:1,type:"odd",q:"Қайсысы осы қатарға жатқызылмайды?",items:["Көл","Дария","Өзен","Тау"],ans:3,hint:"Көл, дария, өзен – су нысандары. Тау – жоқ"},
  {d:1,type:"odd",q:"Қайсысы жануар емес?",items:["Арыстан","Бұлан","Домбыра","Қасқыр"],ans:2,hint:"Домбыра – аспап. Қалғандары – жануарлар"},
  {d:1,type:"odd",q:"Қайсысы Қазақстан қаласы емес?",items:["Алматы","Астана","Ташкент","Семей"],ans:2,hint:"Ташкент – Өзбекстан астанасы"},
  {d:1,type:"odd",q:"Қайсысы сандар қатарына жатпайды?",items:["2","4","7","8"],ans:2,hint:"2,4,8 – жұп сандар. 7 – жұп сан емес"},
  // Type: logic sequence
  {d:2,type:"seq",q:"A=1, B=2, C=3 болса, 'DAD' неше болады?",opts:["11","7","9","14"],a:2,hint:"D=4, A=1. D+A+D = 4+1+4 = 9"},
  {d:2,type:"seq",q:"Егер KESH=1234, SHESH=2345 болса, онда KESH+SHESH=?",opts:["3456","3579","5579","4567"],a:1,hint:"KESH=1+2+3+4=10. SHESH=2+3+4+5=14. Жиынтығы: KESH=1234, SHESH=2345, қосындысы = 3579"},
  {d:2,type:"seq",q:"Бір күні 3 адам 3 іс істейді 3 сағатта. 9 адам 9 іс істейді неше сағатта?",opts:["1","3","9","27"],a:1,hint:"1 адам – 1 іс – 3 сағатта. Қатынас өзгермейді – 3 сағатта"},
  {d:2,type:"seq",q:"Сағат 12:00-де көлік А нүктесінен қозғала бастады. Сағат 14:30-да жетті. Жолда қанша сағат болды?",opts:["1.5","2","2.5","3"],a:2,hint:"14:30 - 12:00 = 2 сағат 30 минут = 2.5 сағат"},
  // Type: cipher
  {d:2,type:"cipher",q:"ABCDE шифрінде A=1, B=2... E=5. 'BADE' сандары?",opts:["2145","2134","3124","1234"],a:0,hint:"B=2,A=1,D=4,E=5. Жауап: 2145"},
  {d:2,type:"cipher",q:"Әр сан 2-ге артты: 1→3, 2→4. Онда 7→?",opts:["8","9","10","14"],a:1,hint:"7+2=9"},
  {d:3,type:"cipher",q:"Сөз айналы оқылса: ABAY → YABA. AQIQ → ?",opts:["QIQA","QIAQ","IQAQ","AQQI"],a:0,hint:"Сөз теріс оқылады: A-Q-I-Q → Q-I-Q-A"},
  // Type: kazakh logic
  {d:2,type:"odd",q:"Қайсысы күзде болмайды?",items:["Жаңбыр","Жапырақ түсу","Қар жауу","Жемістер пісу"],ans:2,hint:"Күзде жаңбыр жауады, жапырақ түседі, жемістер піседі. Қар – қыста жауады"},
  {d:2,type:"seq",q:"5 қой = 10 тұяқ. 3 түйе = неше тұяқ?",opts:["6","9","12","15"],a:2,hint:"Түйе = 4 тұяқ. 3x4=12"},
  {d:3,type:"seq",q:"Қазақстанда 1 жыл – 4 мезгіл. 5 жыл – неше мезгіл?",opts:["5","10","20","40"],a:2,hint:"5 x 4 = 20 мезгіл"},
  {d:3,type:"cipher",q:"CODE: A=Z, B=Y, C=X... (айналы алфавит). 'ACE' → ?",opts:["ZXV","YXV","ZXW","ZWV"],a:0,hint:"A→Z, C→X, E→V. ZXV"},
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
  var typeLabel={odd:"Артық нәрсе табыңыз",seq:"Дұрыс жауап табыңыз",cipher:"Шифрді ашыңыз"};
  var typeIco={odd:"&#x1F50D;",seq:"&#x1F9EE;",cipher:"&#x1F511;"};
  var btnHtml="";

  if(L.type==="odd"){
    var shuffled=shuffle(L.items.map(function(t,i){return{t:t,i:i};}));
    btnHtml=shuffled.map(function(o){
      return "<button class='ans-btn' data-i='"+o.i+"'>"+o.t+"</button>";
    }).join("");
  } else {
    var shuffled2=shuffle(L.opts.map(function(t,i){return{t:t,i:i};}));
    btnHtml=shuffled2.map(function(o){
      return "<button class='ans-btn' data-i='"+o.i+"'>"+o.t+"</button>";
    }).join("");
  }

  c.innerHTML=
    "<div class='game-question-card'>"+
      "<div class='g-head'>"+
        "<div class='g-head-ico'>"+(typeIco[L.type]||"&#x1F4A1;")+"</div>"+
        "<div class='g-head-sub'>"+(typeLabel[L.type]||"Жауап")+" · Деңгей "+st.dengei+"</div>"+
      "</div>"+
      "<div class='g-prompt'>"+L.q+"</div>"+
      btnHtml+
      "<div class='g-actions'>"+
        "<button class='btn btn-ghost btn-sm' id='hint-cy' "+(st.kenes<=0?"disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button>"+
      "</div>"+
    "</div>"+
    "<div id='hint-cyb' style='display:"+(st.showHint?"flex":"none")+";' class='hint-box'>&#128161; "+L.hint+"</div>";

  if(!st.used){
    c.querySelectorAll(".ans-btn").forEach(function(b){
      b.addEventListener("click",function(){
        var idx=parseInt(b.dataset.i);
        var correctIdx=L.type==="odd"?L.ans:L.a;
        check(idx,correctIdx);
      });
    });
  }
  document.getElementById("hint-cy").onclick=function(){
    if(st.kenes<=0||st.showHint)return;
    st.kenes--;
    st.showHint=true;
    st.upai=Math.max(50,st.upai-60);
    GameEngine.setScore(st.upai);
    render();
  };
}

function check(chosen,correct){
  if(st.used)return;st.used=true;
  var ok=chosen===correct;
  document.querySelectorAll(".ans-btn").forEach(function(b){
    b.disabled=true;var i=parseInt(b.dataset.i);
    if(i===correct)b.classList.add("correct");
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

window.GameModules.cyber={startLevel:startLevel};
})();
