(function(){
'use strict';
window.GameModules=window.GameModules||{};

// Each dengei: 0=empty, 1=wall, 'S'=start, 'E'=exit
var MAPS=[
["111111","1S0011","100011","100001","100001","111E11"],
["1111111","1S00011","1011011","1010001","1010011","10100E1","1111111"],
["11111111","1S001111","10101001","10100001","11100001","110110E1","100000011","11111111"],
["111111111","1S0000001","101010101","101010001","101010101","100010001","111110E01","100000001","111111111"],
["1111111111","1S00000001","1011111001","1010001001","1010101001","1010101001","1010100001","10101110E1","1000000001","1111111111"],
["11111111111","1S000000001","10111101101","10100100001","10100110001","10110010001","10010010101","10010010001","111110110E1","100000000001","11111111111"],
["111111111111","1S0000000001","101111011101","100001000001","101011010101","100010010001","101010011101","100000001001","101111100001","1000000010E1","101111100001","111111111111"],
["1111111111111","1S00000000001","10111011101101","10100010001001","10101110101001","10100000100001","10101110101001","10100010001001","10111011101001","100000000010E1","101111111100001","1000000000000001","1111111111111111"],
["111111111111","1S0000000001","101011011101","101010000001","101010111101","100010100001","101110100001","100000110001","101111000E01","100000000001","111111111111","111111111111"],
["11111111111","1S000000001","10111101001","10100101001","10100101001","10000001001","11111101001","10000000001","10111111101","100000000E1","11111111111"],
];

var CELL=44;
var DX=[0,1,0,-1],DY=[-1,0,1,0];
var st={};var boundKey=null;
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function starsByMoves(moves,lvl){
  var L=Math.max(1,Math.min(10,lvl||1));
  var opt=(st.optMoves&&st.optMoves>0?st.optMoves:12);
  var m3=Math.max(4,10-Math.floor((L-1)*0.8));
  var t3=opt+m3;
  var t2=opt+m3+14;
  if(moves<=t3)return 3;
  if(moves<=t2)return 2;
  return 1;
}
function computeShortestMoves(grid,sx,sy,ex,ey){
  var rows=grid.length,cols=grid[0].length;
  var dist=new Array(rows);
  for(var y=0;y<rows;y++){
    dist[y]=new Array(cols);
    for(var x=0;x<cols;x++)dist[y][x]=-1;
  }
  var qx=[sx],qy=[sy];
  dist[sy][sx]=0;
  var qi=0;
  while(qi<qx.length){
    var x=qx[qi],y=qy[qi];qi++;
    if(x===ex&&y===ey)return dist[y][x];
    for(var k=0;k<4;k++){
      var nx=x+DX[k],ny=y+DY[k];
      if(!grid[ny]||grid[ny][nx]===undefined)continue;
      if(grid[ny][nx]===1)continue;
      if(dist[ny][nx]!==-1)continue;
      dist[ny][nx]=dist[y][x]+1;
      qx.push(nx);qy.push(ny);
    }
  }
  return 0;
}

function startLevel(lvl){
  cleanup();
  var mapRaw=MAPS[Math.min(lvl-1,MAPS.length-1)];
  var p=parseMap(mapRaw);
  st={dengei:lvl,grid:p.grid,px:p.sx,py:p.sy,ex:p.ex,ey:p.ey,
      moves:0,upai:400,kenes:2,rows:p.grid.length,cols:p.grid[0].length};
  st.optMoves=computeShortestMoves(st.grid,st.px,st.py,st.ex,st.ey);
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
  boundKey=function(e){
    var map={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],
             w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
    var d=map[e.key];
    if(d){e.preventDefault();move(d[0],d[1]);}
  };
  document.addEventListener("keydown",boundKey);
}

function cleanup(){
  if(boundKey){document.removeEventListener("keydown",boundKey);boundKey=null;}
}

function parseMap(raw){
  var grid=[],sx=0,sy=0,ex=0,ey=0;
  for(var y=0;y<raw.length;y++){
    grid.push([]);
    for(var x=0;x<raw[y].length;x++){
      var ch=raw[y][x];
      if(ch==="S"){sx=x;sy=y;grid[y].push(0);}
      else if(ch==="E"){ex=x;ey=y;grid[y].push(2);}
      else grid[y].push(ch==="1"?1:0);
    }
  }
  return{grid:grid,sx:sx,sy:sy,ex:ex,ey:ey};
}

function cell(x,y){return st.grid[y]&&st.grid[y][x]!==undefined?st.grid[y][x]:-1;}

function move(dx,dy){
  var nx=st.px+dx,ny=st.py+dy;
  if(cell(nx,ny)===1||cell(nx,ny)===-1)return;
  st.px=nx;st.py=ny;st.moves++;
  st.upai=Math.max(50,400-st.moves*3);
  GameEngine.setScore(st.upai);
  render();
  if(nx===st.ex&&ny===st.ey){
    var hintsUsed=2-st.kenes;
    var zhuldyzdar=capStarsByHints(starsByMoves(st.moves,st.dengei),hintsUsed);
    cleanup();
    setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},300);
  }
}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var cs=Math.min(CELL,Math.floor((Math.min(window.innerWidth,760)-40)/st.cols));
  var u=(window.OQ&&window.OQ.currentUser)?window.OQ.currentUser:null;
  var skin=u&&u.equipped_skin==="skin_caravan";
  var pIco=skin?"&#x1F42A;":"&#x1F464;";
  var gridH="<div class='g-grid g-grid-lg' style='--cols:"+st.cols+";--cs:"+cs+"px;'>";
  for(var y=0;y<st.rows;y++){
    for(var x=0;x<st.cols;x++){
      var isP=x===st.px&&y===st.py,isE=x===st.ex&&y===st.ey;
      var v=cell(x,y);
      var t=v===1?"wall":isP?"player":isE?"goal":"floor";
      var ico=isP?pIco:isE?"&#x1F6A9;":"";
      gridH+="<div class='g-cell' data-t='"+t+"'>"+(ico?"<span class='g-ico'>"+ico+"</span>":"")+"</div>";
    }
  }
  gridH+="</div>";

  c.innerHTML=
    "<div class='g-hud'>"+
      "<div class='g-hud-card blue'><div class='g-hud-val'>"+st.moves+"</div><div class='g-hud-lbl'>Жүрістер</div></div>"+
      "<div class='g-hud-card'><div class='g-hud-val'>&#x1F6A9;</div><div class='g-hud-lbl'>Шығуға жетіңіз</div></div>"+
    "</div>"+
    gridH+
    "<div class='dpad'>"+
      "<div class='d-btn empty'></div><button class='d-btn' id='mu'>&#9650;</button><div class='d-btn empty'></div>"+
      "<button class='d-btn' id='ml'>&#9668;</button>"+
      "<button class='d-btn center'>" + pIco + "</button>"+
      "<button class='d-btn' id='mr'>&#9658;</button>"+
      "<div class='d-btn empty'></div><button class='d-btn' id='md'>&#9660;</button><div class='d-btn empty'></div>"+
    "</div>"+
    "<div class='g-actions'>"+
      "<button class='btn btn-ghost btn-sm' id='hint-l' "+(st.kenes<=0?"disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button>"+
      "<button class='btn btn-ghost btn-sm' id='reset-l'>&#8635; Қайта бастау</button>"+
    "</div>";

  document.getElementById("mu").onclick=function(){move(0,-1);};
  document.getElementById("md").onclick=function(){move(0,1);};
  document.getElementById("ml").onclick=function(){move(-1,0);};
  document.getElementById("mr").onclick=function(){move(1,0);};
  document.getElementById("hint-l").onclick=function(){
    if(st.kenes<=0)return;st.kenes--;
    st.upai=Math.max(50,st.upai-60);
    GameEngine.setScore(st.upai);
    window.OQ&&OQ.Toast.info("Жалаушаға апаратын жолды тауып көріңіз. Қабырғаға соғылмай жүріңіз.");
    render();
  };
  document.getElementById("reset-l").onclick=function(){cleanup();startLevel(st.dengei);};
}

window.GameModules.labirint={startLevel:startLevel};
})();
