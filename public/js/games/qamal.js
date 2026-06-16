(function(){
window.GameModules=window.GameModules||{};
var MAPS=[
  ["#####","#@$ X#","#   #","#####"],
  ["######","#@   #","# $  #","#  XX#","######"],
  ["#######","#@    #","# $ $ #","#  XX #","#######"],
  ["######","## @  #","# $   #","#   $ #","#  XX #","######"],
  ["########","#@     #","# $$   #","#  XX  #","########"],
  ["########","## @   #","#  $   #","# $    #","#  XX  #","########"],
  ["#########","#@      #","# $ $   #","#  $    #","#  XXX  #","#########"],
  ["#########","## @    #","#  $    #","# $ $   #","#  XXX  #","#########"],
  ["##########","#@       #","# $$ $   #","#    $   #","#  XXXX  #","##########"],
  ["##########","## @     #","#  $$    #","# $  $   #","# XXXX   #","##########"],
];
var st={};
var boundKey=null;
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function starsByMoves(moves,lvl){
  var L=Math.max(1,Math.min(10,lvl||1));
  var par=st.parMoves||12;
  var m3=Math.max(8,18-Math.floor((L-1)*1.2));
  var t3=par+m3;
  var t2=par+m3+22;
  if(moves<=t3)return 3;
  if(moves<=t2)return 2;
  return 1;
}
function computeParMoves(){
  var rows=st.grid.length,cols=st.grid[0].length;
  var cells=rows*cols;
  var boxes=st.boxes.length;
  var goals=st.goals.length;
  return 8 + boxes*10 + goals*3 + Math.floor(cells/20);
}
function cleanup(){if(boundKey){document.removeEventListener("keydown",boundKey);boundKey=null;}}
function startLevel(lvl){
  cleanup();
  var map=MAPS[Math.min(lvl-1,MAPS.length-1)];
  var p=parse(map);
  st={dengei:lvl,grid:p.grid,px:p.px,py:p.py,boxes:p.boxes.map(function(b){return b.slice();}),goals:p.goals,moves:0,upai:300,kenes:2};
  st.parMoves=computeParMoves();
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
  boundKey=function(e){var dm={"ArrowUp":[0,-1],"ArrowDown":[0,1],"ArrowLeft":[-1,0],"ArrowRight":[1,0],"w":[0,-1],"s":[0,1],"a":[-1,0],"d":[1,0]};var d=dm[e.key];if(d){e.preventDefault();doMove(d[0],d[1]);}};
  document.addEventListener("keydown",boundKey);
}
function parse(map){
  var grid=[],px=0,py=0,boxes=[],goals=[];
  for(var y=0;y<map.length;y++){var row=map[y];grid.push([]);
    for(var x=0;x<row.length;x++){var ch=row[x];
      if(ch==="@"||ch==="+"){px=x;py=y;grid[y].push(ch==="+"?"X":".");}
      else if(ch==="$"){boxes.push([x,y]);grid[y].push(".");}
      else if(ch==="*"){boxes.push([x,y]);goals.push([x,y]);grid[y].push("X");}
      else{if(ch==="X")goals.push([x,y]);grid[y].push(ch);}
    }
  }
  return{grid:grid,px:px,py:py,boxes:boxes,goals:goals};
}
function isBox(x,y){return st.boxes.some(function(b){return b[0]===x&&b[1]===y;});}
function isGoal(x,y){return st.goals.some(function(g){return g[0]===x&&g[1]===y;});}
function isWall(x,y){return !st.grid[y]||st.grid[y][x]==="#";}
function isSolved(){return st.boxes.every(function(b){return isGoal(b[0],b[1]);});}
function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var cs=Math.min(52,Math.floor((Math.min(window.innerWidth,760)-60)/Math.max(st.grid[0].length,1)));
  var gridH="<div class='g-grid g-grid-lg' style='--cols:"+st.grid[0].length+";--cs:"+cs+"px;'>";
  for(var y=0;y<st.grid.length;y++)for(var x=0;x<st.grid[0].length;x++){
    var isP=x===st.px&&y===st.py,isB=isBox(x,y),isG=isGoal(x,y),isW=isWall(x,y);
    var t=isW?"wall":isP?"player":isB?(isG?"boxgoal":"box"):isG?"goal":"floor";
    var ico=isP?"&#x1F6B6;":isB?"&#x1F4E6;":isG&&!isB?"&#x2713;":"";
    gridH+="<div class='g-cell' data-t='"+t+"'>"+(ico?"<span class='g-ico'>"+ico+"</span>":"")+"</div>";
  }
  gridH+="</div>";
  var matched=st.boxes.filter(function(b){return isGoal(b[0],b[1]);}).length;
  c.innerHTML=
    "<div class='g-hud'>"+
      "<div class='g-hud-card blue'><div class='g-hud-val'>"+st.moves+"</div><div class='g-hud-lbl'>Жүрістер</div></div>"+
      "<div class='g-hud-card'><div class='g-hud-val'>"+matched+"/"+st.goals.length+"</div><div class='g-hud-lbl'>Орындалды</div></div>"+
    "</div>"+
    gridH+
    "<div class='dpad'>"+
      "<div class='d-btn empty'></div><button class='d-btn' id='bu'>&#9650;</button><div class='d-btn empty'></div>"+
      "<button class='d-btn' id='bl'>&#9668;</button><button class='d-btn label'>ЖЫЛЖЫТУ</button><button class='d-btn' id='br'>&#9658;</button>"+
      "<div class='d-btn empty'></div><button class='d-btn' id='bd'>&#9660;</button><div class='d-btn empty'></div>"+
    "</div>"+
    "<div class='g-actions'>"+
      "<button class='btn btn-ghost btn-sm' id='hint-q'"+(st.kenes<=0?" disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button>"+
      "<button class='btn btn-ghost btn-sm' id='reset-q'>&#8635; Қайта</button>"+
    "</div>";
  document.getElementById("bu").onclick=function(){doMove(0,-1);};
  document.getElementById("bd").onclick=function(){doMove(0,1);};
  document.getElementById("bl").onclick=function(){doMove(-1,0);};
  document.getElementById("br").onclick=function(){doMove(1,0);};
  document.getElementById("hint-q").onclick=function(){
    if(st.kenes>0){
      st.kenes--;
      st.upai=Math.max(50,st.upai-60);
      GameEngine.setScore(st.upai);
      window.OQ&&OQ.Toast.info("Барлық жәшіктерді «✓» белгілерінің үстіне жылжытыңыз.");
      render();
    }
  };
  document.getElementById("reset-q").onclick=function(){cleanup();startLevel(st.dengei);};
}
function doMove(dx,dy){
  var nx=st.px+dx,ny=st.py+dy;if(isWall(nx,ny))return;
  var bi=st.boxes.findIndex(function(b){return b[0]===nx&&b[1]===ny;});
  if(bi>=0){var bx=nx+dx,by=ny+dy;if(isWall(bx,by)||isBox(bx,by))return;st.boxes[bi]=[bx,by];}
  st.px=nx;st.py=ny;st.moves++;st.upai=Math.max(50,300-st.moves*2);GameEngine.setScore(st.upai);render();
  if(isSolved()){
    var hintsUsed=2-st.kenes;
    var zhuldyzdar=capStarsByHints(starsByMoves(st.moves,st.dengei),hintsUsed);
    cleanup();
    setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},300);
  }
}
window.GameModules.qamal={startLevel:startLevel};
})();
