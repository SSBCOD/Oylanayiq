(function(){
'use strict';
window.GameModules=window.GameModules||{};

var GOALS={
  3:[1,2,3,4,5,6,7,8,0],
  4:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0]
};

var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function starsByMoves(moves,size,lvl){
  var L=Math.max(1,Math.min(10,lvl||1));
  var par;
  if(size===3){
    par=Math.max(18,22-Math.floor((L-1)*1.2));
  } else {
    var idx=Math.max(0,L-6);
    par=Math.max(55,75-idx*4);
  }
  if(moves<=par)return 3;
  if(moves<=Math.round(par*1.7))return 2;
  return 1;
}

function startLevel(lvl){
  var size=lvl<=5?3:4;
  var goal=GOALS[size].slice();
  var tiles=goal.slice();
  // Shuffle with guaranteed solvable
  tiles=solvableShuffle(tiles,size);
  st={dengei:lvl,size:size,tiles:tiles,goal:goal,moves:0,upai:500,kenes:2};
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}

function solvableShuffle(arr,size){
  var a=arr.slice();
  // Make 100 valid moves to shuffle
  var blankIdx=a.indexOf(0);
  for(var i=0;i<200;i++){
    var neighbors=getNeighbors(blankIdx,size);
    var ni=neighbors[Math.floor(Math.random()*neighbors.length)];
    var tmp=a[blankIdx];a[blankIdx]=a[ni];a[ni]=tmp;
    blankIdx=ni;
  }
  return a;
}

function getNeighbors(idx,size){
  var res=[];
  var row=Math.floor(idx/size),col=idx%size;
  if(row>0)res.push(idx-size);
  if(row<size-1)res.push(idx+size);
  if(col>0)res.push(idx-1);
  if(col<size-1)res.push(idx+1);
  return res;
}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var size=st.size;
  var cs=size===3?88:64;

  var grid="<div class='puzzle-grid' style='--cols:"+size+";--cs:"+cs+"px;--fs:"+(size===3?28:22)+"px;'>"+
    st.tiles.map(function(v,i){
      var isEmpty=v===0;
      var isRight=v===st.goal[i];
      return "<div class='puzzle-tile"+(isEmpty?" empty":"")+(isRight&&!isEmpty?" right":"")+"' data-i='"+i+"'>"+
        (isEmpty?"":v)+
      "</div>";
    }).join("")+
  "</div>";

  var matched=st.tiles.filter(function(v,i){return v!==0&&v===st.goal[i];}).length;
  var total=st.tiles.length-1;

  c.innerHTML=
    "<div class='g-hud'>"+
      "<div class='g-hud-card blue'><div class='g-hud-val'>"+st.moves+"</div><div class='g-hud-lbl'>Жүрістер</div></div>"+
      "<div class='g-hud-card green'><div class='g-hud-val'>"+matched+"/"+total+"</div><div class='g-hud-lbl'>Дұрыс қойылған</div></div>"+
    "</div>"+
    "<div class='g-note'>Сандарды 1-ден "+total+"-ге дейін ретке келтіріңіз</div>"+
    grid+
    "<div class='g-actions'>"+
      "<button class='btn btn-ghost btn-sm' id='hint-a' "+(st.kenes<=0?"disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button>"+
      "<button class='btn btn-ghost btn-sm' id='reset-a'>&#8635; Қайта</button>"+
    "</div>";

  c.querySelectorAll(".puzzle-tile:not(.empty)").forEach(function(el){
    el.addEventListener("click",function(){slideTile(parseInt(el.dataset.i));});
  });
  document.getElementById("hint-a").onclick=function(){
    if(st.kenes<=0)return;st.kenes--;
    st.upai=Math.max(50,st.upai-60);
    GameEngine.setScore(st.upai);
    // Highlight the blank's neighbors
    var bi=st.tiles.indexOf(0);
    var ns=getNeighbors(bi,size);
    ns.forEach(function(ni){
      var el=c.querySelector("[data-i='"+ni+"']");
      if(el){el.classList.add("hint");}
    });
    setTimeout(function(){
      ns.forEach(function(ni){
        var el=c.querySelector("[data-i='"+ni+"']");
        if(el){el.classList.remove("hint");}
      });
    },1000);
    window.OQ&&OQ.Toast.info("Бос тор қатарындағы тасты бос орынға жылжытыңыз!");
    render();
  };
  document.getElementById("reset-a").onclick=function(){startLevel(st.dengei);};
}

function slideTile(idx){
  var bi=st.tiles.indexOf(0);
  var ns=getNeighbors(bi,st.size);
  if(ns.indexOf(idx)<0)return;
  var tmp=st.tiles[bi];st.tiles[bi]=st.tiles[idx];st.tiles[idx]=tmp;
  st.moves++;st.upai=Math.max(50,500-st.moves*4);
  GameEngine.setScore(st.upai);render();
  if(st.tiles.join(",")===st.goal.join(",")){
    var hintsUsed=2-st.kenes;
    var zhuldyzdar=capStarsByHints(starsByMoves(st.moves,st.size,st.dengei),hintsUsed);
    setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},300);
  }
}

window.GameModules.altyn={startLevel:startLevel};
})();
