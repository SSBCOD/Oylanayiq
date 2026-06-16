(function(){
'use strict';
window.GameModules=window.GameModules||{};

var SCENES=[
{scene:"Қонақ келді. Дастархан басында отырып, үйге кірген адамға не дейсіз?",
 opts:["Қаша кетіңіз!","Қош келдіңіз, төрлетіңіз!","Бізде еш нәрсе жоқ","Кейінірек келіңіз"],
 ans:1,
 explain:"Қазақ дәстүрі: қонаққа 'Қош келдіңіз!' деп, шақырып төрге отырғызады. Қонақжайлылық – қазақ халқының ұлы қасиеті."},

{scene:"Көшеде қария адаммен кездесіп қалдыңыз. Ол сізге қарай келе жатыр. Не істейсіз?",
 opts:["Жолдың шетіне шығып, өтуге жол бересіз","Жол берудің қажеті жоқ","Кері бұрылып, қашып кетесіз","Телефонға қарап, байқамаған боласыз"],
 ans:0,
 explain:"Қазақта үлкенге құрмет – бірінші заң. Жол беру – қазақ дәстүріндегі үлкенге деген сыйластықтың белгісі."},

{scene:"Досыңыз сізге: 'Наурыз мүбәрак болсын!' деді. Сіздің жауабыңыз?",
 opts:["Қош болыңыз","Бірге болсын! Жасың құтты болсын!","Мен бұл мерекені білмеймін","Бұл мерекенің маған қатысы бар ма?"],
 ans:1,
 explain:"Наурыз – көне жыл басы мерекесі. Бір-біріне жақсы тілектер айтып, 'Бірге болсын!' деп жауап қайтарады."},

{scene:"Дастархан басында табақтан тамақ аласыз. Қазақ дәстүріне сай қалай алу керек?",
 opts:["Өзіңізге жақын жерден аласыз","Алдымен үлкенге ұсынып, содан кейін аласыз","Көп сөйлемей тезірек аласыз","Табақтың үстінен таңдап аласыз"],
 ans:1,
 explain:"Қазақ дәстүрінде дастархан басында үлкенге құрмет көрсету – парыз. Тамақты алдымен үлкендерге ұсынады."},

{scene:"Кісінің үйіне бірінші рет қонаққа бара жатырсыз. Не апарған дұрыс?",
 opts:["Ештеңе апарудың керегі жоқ","Тәттілер, жеміс немесе жақсы сыйлық","Тек ақша берген дұрыс","Ештеңе апармай, құр қол барасыз"],
 ans:1,
 explain:"Қазақта қонаққа барғанда 'қол бос бармау' – сыйластықтың белгісі. Сыйлық апару – үй иесіне деген құрмет."},

{scene:"Дастарханға ет тартылды. Дәстүр бойынша алдымен не істеу керек?",
 opts:["Етті бірден жей бастайсыз","Алдымен сорпа ішіп, содан соң етке кірісесіз","Еттің ең дәмді жерін таңдайсыз","Басқалардың жегенін күтесіз"],
 ans:1,
 explain:"Қазақ дастарханында әдетте алдымен сорпа ұсынылады, содан кейін басты ас – ет тартылады."},

{scene:"Үлкен кісі маңызды ақыл айтып жатыр. Сіз не істейсіз?",
 opts:["Телефонға қарап отырасыз","Сөзін бөлмей, басқа жаққа қарайсыз","Мұқият тыңдап, құрмет көрсетесіз","Сөзіне араласып, өз ойыңызды айтасыз"],
 ans:2,
 explain:"Үлкеннің сөзін тыңдау – әдептіліктің белгісі. Мұқият тыңдап, ақылын санаға түю – жастардың міндеті."},

{scene:"Той үстінде үлкен кісіден бата сұралды. Батаны кім беруі керек?",
 opts:["Ең жас адам","Орта жастағы адам","Ең үлкен, құрметті ақсақал","Кез келген адам"],
 ans:2,
 explain:"Қазақ дәстүрінде батаны әрқашан отырған қауымның ішіндегі ең үлкен немесе ең сыйлы адамы береді."},

{scene:"Көшеде қарт кісі ауыр сөмке көтеріп келе жатыр. Сіз не істейсіз?",
 opts:["Байқамағандай өтіп кетесіз","Жақындап барып, көмектесуді ұсынасыз","Оған қарап тұра бересіз","Басқа біреу көмектесер деп күтесіз"],
 ans:1,
 explain:"Үлкенге көмек көрсету – әрбір жастың азаматтық борышы. Қарияларға қолғабыс ету – үлкен сауапты іс."},

{scene:"Сыныптасыңыз жақсы жетістікке жетті. Сіздің жауабыңыз?",
 opts:["Сенің бағың жанды, бірақ менің бағам төмен","'Құттықтаймын!' деп шынайы қуаныш білдіресіз","Ештеңе демей, үнсіз қаласыз","Оған іштей қызғанышпен қарайсыз"],
 ans:1,
 explain:"Достың жетістігіне қуану – шынайы достықтың белгісі. 'Құттықтаймын!' – жылы лебіз бен қолдаудың көрінісі."},
];

var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}

function startLevel(lvl){
  var S=SCENES[Math.min(lvl-1,SCENES.length-1)];
  st={dengei:lvl,S:S,upai:200,kenes:2,used:false,showHint:false};
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}

function shuffle(a){
  var b=a.slice();
  for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;}
  return b;
}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var S=st.S;
  var opts=shuffle(S.opts.map(function(o,i){return{t:o,i:i};}));

  c.innerHTML=
    "<div class='game-question-card'>"+
      "<div class='g-head'>"+
        "<div class='g-head-ico'>&#x1F4DC;</div>"+
        "<div class='g-head-sub'>Ulagat · "+st.dengei+"-жағдай</div>"+
      "</div>"+
      "<div class='g-prompt'>"+S.scene+"</div>"+
      opts.map(function(o){
        return "<button class='ans-btn' data-i='"+o.i+"'>"+
          "<span class='opt-letter'>"+String.fromCharCode(65+o.i)+".</span>"+o.t+
        "</button>";
      }).join("")+
      "<div class='g-actions'>"+
        "<button class='btn btn-ghost btn-sm' id='hint-d' "+(st.kenes<=0?"disabled":"")+">"+
          "&#x1F4A1; Кеңес ("+st.kenes+" қалды)"+
        "</button>"+
      "</div>"+
    "</div>"+
    "<div id='hint-db' class='hint-box"+(st.showHint?"":" hidden")+"'><span>&#x1F4A1;</span> "+S.explain+"</div>";

  if(!st.used){
    c.querySelectorAll(".ans-btn").forEach(function(b){
      b.addEventListener("click",function(){check(parseInt(b.dataset.i));});
    });
  }
  var hb=document.getElementById("hint-d");
  if(hb)hb.addEventListener("click",function(){
    if(st.kenes<=0||st.showHint)return;
    st.kenes--;
    st.showHint=true;
    st.upai=Math.max(50,st.upai-60);
    GameEngine.setScore(st.upai);
    render();
  });
}

function check(chosen){
  if(st.used)return;st.used=true;
  var ok=chosen===st.S.ans;
  document.querySelectorAll(".ans-btn").forEach(function(b){
    b.disabled=true;
    var i=parseInt(b.dataset.i);
    if(i===st.S.ans)b.classList.add("correct");
    else if(i===chosen&&!ok)b.classList.add("wrong");
  });
  // Show explanation
  st.showHint=true;
  render();
  GameEngine.setScore(ok?st.upai+100:Math.max(50,st.upai-50));
  if(ok){
    var hintsUsed=2-st.kenes;
    var stars=capStarsByHints(3,hintsUsed);
    setTimeout(function(){GameEngine.completeLevel(stars);},800);
  } else {
    setTimeout(function(){GameEngine.completeLevel(1);},1400);
  }
}

window.GameModules.dialog={startLevel:startLevel};
})();
