(function(){
'use strict';
window.GameModules=window.GameModules||{};

var CITIES=[
  {name:"Астана",clues:[
    "Қазақстанның қазіргі астанасы",
    "1997 жылдан бері астана мәртебесі бар",
    "Бәйтерек мұнарасы бұл қалада орналасқан",
    "Хан Шатыр ойын-сауық орталығы бар",
    "Есіл өзенінің жағасындағы қала"
  ],opts:["Алматы","Астана","Шымкент","Қарағанды"],ans:1},

  {name:"Алматы",clues:[
    "Қазақстанның ең үлкен қаласы",
    "Бұрын Қазақстанның астанасы болған",
    "Тянь-Шань тауларының етегінде орналасқан",
    "Медеу мұз айдыны бұл жерде",
    "Көктөбе төбесінен таулар көрінеді"
  ],opts:["Алматы","Астана","Өскемен","Семей"],ans:0},

  {name:"Шымкент",clues:[
    "Қазақстанның үшінші үлкен қаласы",
    "Оңтүстік Қазақстандағы қала",
    "Жібек жолы бойында орналасқан тарихи қала",
    "Өзбекстан шекарасына жақын",
    "Мұз-Шоқы жері бұл облыста"
  ],opts:["Қызылорда","Тараз","Шымкент","Түркістан"],ans:2},

  {name:"Түркістан",clues:[
    "Қазақтың рухани астанасы деп аталатын қала",
    "Қожа Ахмет Яссауи кешені орналасқан",
    "ЮНЕСКО Әлем мұрасы тізіміне енген орын",
    "Қазақ хандығының орталығы болған",
    "Жібек жолының ең маңызды бекет қаласы"
  ],opts:["Шымкент","Қызылорда","Тараз","Түркістан"],ans:3},

  {name:"Семей",clues:[
    "Ертіс өзенінің жағасындағы қала",
    "Абай Құнанбайұлы бұл облыста туған",
    "Бұрын Семипалатинск деп аталған",
    "Ядролық сынақ алаңы жақын болған",
    "Шығыс Қазақстан облысындағы қала"
  ],opts:["Семей","Өскемен","Павлодар","Петропавл"],ans:0},

  {name:"Ақтау",clues:[
    "Каспий теңізінің жағасындағы порт қаласы",
    "Батыс Қазақстанда орналасқан",
    "Мұнай өнеркәсібінің орталығы",
    "Бұрын Шевченко деп аталған",
    "Ақ жарлар Каспий бойында орналасқан"
  ],opts:["Атырау","Ақтау","Орал","Ақтөбе"],ans:1},

  {name:"Тараз",clues:[
    "Орталық Азияның ең көне қалаларының бірі",
    "2000 жылдан аса тарихы бар",
    "Жамбыл облысында орналасқан",
    "Жібек жолы бойында маңызды қала болған",
    "Аймақ орталығы"
  ],opts:["Тараз","Шымкент","Қызылорда","Жезқазған"],ans:0},

  {name:"Қарағанды",clues:[
    "Орталық Қазақстандағы қала",
    "Көмір өнеркәсібінің орталығы болған",
    "1934 жылы негізделген",
    "Қазақстанның үлкен қалаларының бірі",
    "Қарағанды хайуанаттар бағы осында"
  ],opts:["Жезқазған","Теміртау","Қарағанды","Балқаш"],ans:2},

  {name:"Атырау",clues:[
    "Жайық өзенінің Каспий теңізіне құятын жері",
    "Қазақстанның мұнай астанасы",
    "Еуропа мен Азия шекарасындағы қала",
    "Батыс Қазақстанда орналасқан",
    "Мұнай өнеркәсібінің басты орталығы"
  ],opts:["Атырау","Ақтау","Орал","Ақтөбе"],ans:0},

  {name:"Өскемен",clues:[
    "Усть-Каменогорск деп те аталатын қала",
    "Шығыс Қазақстан облысындағы аймақ орталығы",
    "Ертіс пен Үлбі өзендері қосылатын жерде",
    "Алтай таулары жақынында орналасқан",
    "Өнеркәсіп орталығы"
  ],opts:["Өскемен","Семей","Риддер","Зайсан"],ans:0},
];

var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}

function startLevel(lvl){
  var C=CITIES[Math.min(lvl-1,CITIES.length-1)];
  st={dengei:lvl,C:C,clueIdx:0,upai:300,used:false};
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var C=st.C;
  var shownClues=C.clues.slice(0,st.clueIdx+1);
  var opts=shuffle(C.opts.map(function(o,i){return{t:o,i:i};}));

  c.innerHTML=
    "<div class='game-question-card'>"+
      "<div class='g-head'>"+
        "<div class='g-head-ico'>&#x1F3D9;</div>"+
        "<div class='g-head-sub'>Qala Bileti · Дерек "+(st.clueIdx+1)+"/"+C.clues.length+"</div>"+
      "</div>"+
      "<div class='clue-list'>"+
        shownClues.map(function(cl,i){
          var isLast=i===shownClues.length-1;
          return "<div class='clue-item"+(isLast?" last":"")+"'>"+
            "<span class='clue-n'>"+(i+1)+".</span>"+cl+
          "</div>";
        }).join("")+
      "</div>"+
      opts.map(function(o){
        return "<button class='ans-btn' data-i='"+o.i+"'>"+o.t+"</button>";
      }).join("")+
      (st.clueIdx<C.clues.length-1&&!st.used?
        "<div class='g-actions'>"+
          "<button class='btn btn-ghost btn-sm' id='next-clue-btn'>"+
            "Келесі дерек (-60 &#x1FA99;) &#x2192;"+
          "</button>"+
        "</div>":"")+
    "</div>";

  if(!st.used){
    c.querySelectorAll(".ans-btn").forEach(function(b){
      b.addEventListener("click",function(){check(parseInt(b.dataset.i));});
    });
  }
  var nb=document.getElementById("next-clue-btn");
  if(nb)nb.addEventListener("click",function(){
    st.clueIdx=Math.min(st.clueIdx+1,C.clues.length-1);
    st.upai=Math.max(50,st.upai-60);
    GameEngine.setScore(st.upai);
    render();
  });
}

function check(chosen){
  if(st.used)return;
  st.used=true;
  var C=st.C;var ok=chosen===C.ans;
  document.querySelectorAll(".ans-btn").forEach(function(b){
    b.disabled=true;
    var i=parseInt(b.dataset.i);
    if(i===C.ans)b.classList.add("correct");
    else if(i===chosen&&!ok)b.classList.add("wrong");
  });
  var zhuldyzdar=ok?capStarsByHints(3,st.clueIdx):1;
  GameEngine.setScore(ok?st.upai+100:Math.max(50,st.upai-50));
  setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},ok?700:1200);
}

function shuffle(a){
  var b=a.slice();
  for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}
  return b;
}

window.GameModules.qala={startLevel:startLevel};
})();
