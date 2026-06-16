(function(){
'use strict';
window.GameModules=window.GameModules||{};

// 50 questions about Қазақстан, grouped into 10 levels of 5 each
var ALL_Q=[
// Level 1 - Easy
{q:"Қазақстанның қазіргі астанасы?",opts:["Алматы","Астана","Шымкент","Семей"],a:1},
{q:"Қазақстан тәуелсіздігін қай жылы алды?",opts:["1990","1991","1992","1993"],a:1},
{q:"Қазақстанның ұлттық валютасы?",opts:["Доллар","Рубль","Теңге","Сум"],a:2},
{q:"Бәйтерек мұнарасы қай қалада?",opts:["Алматы","Шымкент","Астана","Семей"],a:2},
{q:"Қазақстанның ең үлкен қаласы?",opts:["Астана","Шымкент","Қарағанды","Алматы"],a:3},
// Level 2 - Easy-Medium
{q:"Қазақ халқының дәстүрлі аспабы?",opts:["Скрипка","Домбыра","Қобыз","Шертер"],a:1},
{q:"Абай Құнанбайұлы қай жерде туған?",opts:["Алматы","Семей","Өскемен","Шымкент"],a:1},
{q:"Наурыз мейрамы қашан атап өтіледі?",opts:["1 Қаңтар","21 Желтоқсан","22 Наурыз","1 Мамыр"],a:2},
{q:"Қазақтың дәстүрлі тұрғын үйі?",opts:["Киіз үй","Үй","Сарай","Шатыр"],a:0},
{q:"Қазақстанда неше облыс бар (2024)?",opts:["14","16","17","20"],a:2},
// Level 3 - Medium
{q:"Қазақстанның ең ұзын өзені?",opts:["Ертіс","Сырдария","Іле","Тобыл"],a:0},
{q:"Теңіз суы қай теңізге жатады?",opts:["Қара теңіз","Каспий","Араб","Арал"],a:1},
{q:"Қазақстанның ең биік шыңы?",opts:["Мұзтау (Белуха)","Хан Тәңірі","Алматы шыңы","Маңырақ"],a:1},
{q:"Байқоңыр ғарыш айлағы қай облыста?",opts:["Шымкент","Қызылорда","Байқоңыр","Қарағанды"],a:2},
{q:"Алтын Адам қашан табылды?",opts:["1954","1969","1971","1985"],a:1},
// Level 4
{q:"Қазақстанның мемлекеттік рәміздері нешеу?",opts:["1","2","3","4"],a:2},
{q:"Қазақ елінің елтаңбасындағы жануар?",opts:["Барыс","Арыстан","Қасқыр","Тұлпар"],a:3},
{q:"Отырар қаласы нешінші ғасырда қирады?",opts:["10","13","15","18"],a:1},
{q:"Қазақстанның жер аумағы?",opts:["1.7 млн","2.0 млн","2.7 млн","3.2 млн"],a:2},
{q:"Қазақстан жер аумағы бойынша нешінші орында?",opts:["6","7","8","9"],a:3},
// Level 5
{q:"Қожа Ахмет Яссауи кесенесі қай қалада?",opts:["Шымкент","Түркістан","Тараз","Алматы"],a:1},
{q:"Қазақтың бас ақыны кім?",opts:["Абай","Мұхтар Әуезов","Жамбыл","Сәкен Сейфуллин"],a:0},
{q:"Семей қаласы бұрын қалай аталған?",opts:["Семипалатинск","Усть-Каменогорск","Павлодар","Петропавл"],a:0},
{q:"Қазақстанның тұңғыш Президенті кім?",opts:["Қасым-Жомарт Тоқаев","Нұрсұлтан Назарбаев","Дінмұхамед Қонаев","Әкежан Қажыгелдин"],a:1},
{q:"Манас жырында шамамен неше жол бар?",opts:["500","1000","553000","200000"],a:2},
// Level 6
{q:"Қазақстан нешінші жылы БҰҰ-ға кірді?",opts:["1991","1992","1993","1994"],a:1},
{q:"Домбыраның неше ішегі бар?",opts:["1","2","3","4"],a:1},
{q:"Қазыбек би нешінші ғасырда өмір сүрген?",opts:["17-18","18-19","19-20","16-17"],a:0},
{q:"Қазақ тілі қай әліпбиге көшірілмекші (латын қарпіне)?",opts:["Кирилл","Латын","Араб","Грузин"],a:1},
{q:"Балқаш көлі қай облыста орналасқан?",opts:["Алматы","Қарағанды","Жамбыл","Түркістан"],a:0},
// Level 7
{q:"Қазақстанның мемлекеттік туы қай жылы бекітілді?",opts:["1991","1992","1993","1994"],a:1},
{q:"Ұлы Жүз қашан қалыптасты?",opts:["15","16","17","18"],a:1},
{q:"Қазақтың 3 жүзі қалай аталады?",opts:["Ұлы, Орта, Кіші","Батыс, Орталық, Шығыс","Солтүстік, Орталық, Оңтүстік","Тау, Дала, Орман"],a:0},
{q:"Қарахан мемлекеті қай уақытта болды?",opts:["7-8 ғғ","9-11 ғғ","10-12 ғғ","13-14 ғғ"],a:2},
{q:"Қазақ хандығы нешінші ғасырда құрылды?",opts:["13","14","15","16"],a:2},
// Level 8
{q:"Жамбыл Жабаев қанша жыл өмір сүрді?",opts:["85","95","99","100"],a:2},
{q:"Қазақстан нешінші жылы «Бейбітшілік үшін серіктестік» бағдарламасына кірді?",opts:["1994","1999","2000","2002"],a:0},
{q:"Медеу стадионы қай қалада?",opts:["Астана","Алматы","Шымкент","Өскемен"],a:1},
{q:"Қазақстандағы мұнайлы аймақ?",opts:["Теңіз","Атырау","Ақтау","Маңғыстау"],a:0},
{q:"Арал теңізінің суы қай жылдары тартыла бастады?",opts:["1960","1970","1980","1990"],a:0},
// Level 9
{q:"Семей ядролық полигоны қай жылы жабылды?",opts:["1991","1992","1993","1994"],a:0},
{q:"Қазақстанның ЖІӨ көлемі бойынша дүние жүзіндегі орны?",opts:["40","50","60","80"],a:1},
{q:"Қазақстан нешінші жылы ШЫҰ-ға қосылды?",opts:["1996","2001","2003","2005"],a:1},
{q:"Алаш Орда қозғалысы қай жылы құрылды?",opts:["1907","1917","1918","1920"],a:1},
{q:"Мұхтар Әуезовтің әйгілі романы қалай аталады?",opts:["Абай жолы","Дәулетсіз жаман","Көне дүние","Сандуғаш"],a:0},
// Level 10
{q:"Қазақстанның экономикалық даму көрсеткіші?",opts:["55","60","65","70"],a:1},
{q:"Торғай облысы қай жылы қайта құрылды?",opts:["1960","1970","1988","1997"],a:2},
{q:"Қазақстанның халық саны (шамамен)?",opts:["15 млн","18 млн","20 млн","22 млн"],a:2},
{q:"Атамекен этно-мемориалдық кешені қай қалада орналасқан?",opts:["Алматы","Астана","Түркістан","Шымкент"],a:1},
{q:"Барыс хоккей клубы қай қаланың командасы?",opts:["Алматы","Қарағанды","Астана","Павлодар"],a:2},
];

var LEVEL_BATCHES=[];
for(var i=0;i<10;i++) LEVEL_BATCHES.push(ALL_Q.slice(i*5,(i+1)*5));

var st={};var timer=null;
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function starsByAccuracy(correct,total,lvl){
  var L=Math.max(1,Math.min(10,lvl||1));
  var t3,t2;
  if(L<=3){t3=total-1;t2=total-2;}
  else {t3=total;t2=total-1;}
  if(correct>=t3)return 3;
  if(correct>=t2)return 2;
  return 1;
}

function startLevel(lvl){
  clearTimeout(timer);
  var qs=LEVEL_BATCHES[Math.min(lvl-1,9)];
  st={dengei:lvl,qs:qs,qi:0,upai:0,correct:0,wrong:0,
      timePerQ:Math.max(8,15-Math.floor((lvl-1)*0.7)),kenes:2};
  GameEngine.setScore(0);GameEngine.updateLevelLabel();showQ();
}

function showQ(){
  clearTimeout(timer);
  var c=document.getElementById("game-container");if(!c)return;
  if(st.qi>=st.qs.length){finish();return;}
  var Q=st.qs[st.qi];
  var opts=shuffle(Q.opts.map(function(o,i){return{t:o,i:i};}));
  var tLeft=st.timePerQ;

  c.innerHTML=
    "<div class='game-question-card'>"+
      "<div class='g-row'>"+
        "<div class='g-row-left'>Сұрақ "+(st.qi+1)+"/"+st.qs.length+"</div>"+
        "<div id='tdisp' class='g-timer safe'>"+tLeft+"</div>"+
      "</div>"+
      "<div class='g-prompt'>"+Q.q+"</div>"+
      opts.map(function(o){
        return "<button class='ans-btn' data-orig='"+o.i+"'>"+o.t+"</button>";
      }).join("")+
      "<div class='g-actions'>"+
        "<button class='btn btn-ghost btn-sm' id='hint-b' "+(st.kenes<=0?"disabled":"")+">&#128161; 50/50 ("+st.kenes+")</button>"+
        "<button class='btn btn-ghost btn-sm' id='skip-q'>Өткізіп жіберу &#x2192;</button>"+
      "</div>"+
    "</div>"+
    "<div class='g-kpis'>"+
      "<span class='g-kpi green'><span class='v'>"+st.correct+"</span> <span>&#x2714;</span></span>"+
      "<span class='g-kpi red'><span class='v'>"+st.wrong+"</span> <span>&#x2718;</span></span>"+
    "</div>";

  c.querySelectorAll(".ans-btn").forEach(function(b){
    b.addEventListener("click",function(){answer(parseInt(b.dataset.orig),Q.a);});
  });
  var sk=document.getElementById("skip-q");
  if(sk)sk.addEventListener("click",function(){clearTimeout(timer);st.wrong++;st.qi++;showQ();});
  var hb=document.getElementById("hint-b");
  if(hb)hb.addEventListener("click",function(){
    if(st.kenes<=0)return;
    var buttons=Array.prototype.slice.call(document.querySelectorAll(".ans-btn"));
    var candidates=buttons.filter(function(b){
      if(b.disabled)return false;
      var orig=parseInt(b.dataset.orig);
      return orig!==Q.a;
    });
    if(candidates.length===0)return;
    var pick=candidates[Math.floor(Math.random()*candidates.length)];
    pick.disabled=true;
    pick.classList.add("elim");
    st.kenes--;
    st.upai=Math.max(0,st.upai-60);
    GameEngine.setScore(st.upai);
    hb.textContent="💡 50/50 ("+st.kenes+")";
  });

  // Timer
  tLeft=st.timePerQ;
  function tick(){
    tLeft--;var td=document.getElementById("tdisp");
    if(td){
      td.textContent=tLeft;
      td.className="g-timer "+(tLeft>7?"safe":tLeft>4?"warn":"danger");
    }
    if(tLeft<=0){answer(-1,Q.a);return;}
    timer=setTimeout(tick,1000);
  }
  timer=setTimeout(tick,1000);
}

function answer(chosen,correct){
  clearTimeout(timer);
  var ok=chosen===correct;
  if(ok){st.correct++;st.upai+=Math.max(10,st.timePerQ)*10+50;}
  else{st.wrong++;}
  document.querySelectorAll(".ans-btn").forEach(function(b){
    b.disabled=true;
    var orig=parseInt(b.dataset.orig);
    if(orig===correct)b.className="ans-btn correct";
    else if(orig===chosen&&!ok)b.className="ans-btn wrong";
  });
  GameEngine.setScore(st.upai);
  setTimeout(function(){st.qi++;showQ();},ok?600:1200);
}

function finish(){
  clearTimeout(timer);
  var total=st.qs.length||5;
  var acc=st.correct/total;
  var zhuldyzdar=starsByAccuracy(st.correct,total,st.dengei);
  var hintsUsed=2-st.kenes;
  zhuldyzdar=capStarsByHints(zhuldyzdar,hintsUsed);
  GameEngine.setScore(st.upai);
  setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},400);
}

function shuffle(a){
  var b=a.slice();
  for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}
  return b;
}

window.GameModules.baiterek={startLevel:startLevel};
})();
