(function(){
'use strict';
window.GameModules=window.GameModules||{};

// Levels: grid of 0=path,1=wall, player starts at S, must reach E
// Program: sequence of commands (F=forward, L=left, R=right)
var LEVELS=[
  {grid:["00000","00100","00100","00100","00000"],sx:0,sy:0,ex:4,ey:4,dir:1,
   solution:"FFFFFRRFFF",hint:"Алға жүр, соң оңға бұрыл, алға жүр"},
  {grid:["00000","11100","00000","00111","00000"],sx:0,sy:0,ex:4,ey:4,dir:1,
   solution:"FFFRRFFFFLL",hint:"Оңға, солға бұрылып, жол табыңыз"},
  {grid:["00100","00100","00000","00100","00100"],sx:0,sy:2,ex:4,ey:2,dir:1,
   solution:"FFFFFF...",hint:"Тік бағыт"},
  {grid:["00000","10001","10001","10001","00000"],sx:0,sy:0,ex:4,ey:4,dir:1,
   solution:"FFFFFFRRFFF",hint:"Алға, оңға, алға"},
  {grid:["01000","01010","00010","01010","01000"],sx:0,sy:0,ex:4,ey:4,dir:1,
   solution:"Solve",hint:"Қысқа жол табыңыз"},
];

// Actually let me simplify nomad to be a visual sequence game
// User clicks command buttons to build program, then runs it
// Simple grid navigation

var GRIDS=[
// Format: string array, S=start E=end 0=floor 1=wall
["S0001","00001","11001","10000","1000E"],
["S01110","000010","011110","000001","01100E"],
["S00110","100110","100000","111101","00000E"],
["S000010","1101010","1000010","1011010","1000000","101111E"],
["S0000010","1111110","0000010","0111110","0100010","0100010","010000E"],
["S000000","1111101","1000101","1010101","1010001","111011E"],
["S0000","01110","01010","01010","0000E"],
["S0011101","0001001","0101001","0100001","010001E","0110000","000000E"],
["S000000010","1101111010","1000000010","10111111E0","1010000000","1011111110","1000000000","1111111111"],
["S0000010","1111010","0001010","0111010","0100010","0100000","0100000E"],
];

// Direction: 0=up,1=right,2=down,3=left
var DX=[0,1,0,-1],DY=[-1,0,1,0];

var st={};
function capStarsByHints(stars,hintsUsed){if(hintsUsed>=2)return 1;if(hintsUsed>=1)return Math.min(2,stars);return stars;}
function starsByProgramLength(cmdCount,opt,lvl){
  var L=Math.max(1,Math.min(10,lvl||1));
  var m3=Math.max(2,7-Math.floor((L-1)*0.6));
  var par=(opt&&opt>0?opt:12)+m3;
  if(cmdCount<=par)return 3;
  if(cmdCount<=par+10)return 2;
  return 1;
}
function computeOptimalCommands(grid,sx,sy,ex,ey,startDir){
  var rows=grid.length,cols=grid[0].length;
  function inside(x,y){return y>=0&&y<rows&&x>=0&&x<cols;}
  function isWall(x,y){return !inside(x,y)||grid[y][x]===1;}
  var dist=new Array(rows);
  for(var y=0;y<rows;y++){
    dist[y]=new Array(cols);
    for(var x=0;x<cols;x++){
      dist[y][x]=[Infinity,Infinity,Infinity,Infinity];
    }
  }
  var q=[{x:sx,y:sy,dir:startDir,c:0}];
  dist[sy][sx][startDir]=0;
  var qi=0;
  while(qi<q.length){
    var cur=q[qi++];
    if(cur.c!==dist[cur.y][cur.x][cur.dir])continue;
    if(cur.x===ex&&cur.y===ey)return cur.c;
    var l=(cur.dir+3)%4;
    var r=(cur.dir+1)%4;
    if(cur.c+1<dist[cur.y][cur.x][l]){dist[cur.y][cur.x][l]=cur.c+1;q.push({x:cur.x,y:cur.y,dir:l,c:cur.c+1});}
    if(cur.c+1<dist[cur.y][cur.x][r]){dist[cur.y][cur.x][r]=cur.c+1;q.push({x:cur.x,y:cur.y,dir:r,c:cur.c+1});}
    var nx=cur.x+DX[cur.dir],ny=cur.y+DY[cur.dir];
    if(!isWall(nx,ny)&&cur.c+1<dist[ny][nx][cur.dir]){dist[ny][nx][cur.dir]=cur.c+1;q.push({x:nx,y:ny,dir:cur.dir,c:cur.c+1});}
  }
  return 0;
}

function startLevel(lvl){
  var rawGrid=GRIDS[Math.min(lvl-1,GRIDS.length-1)];
  var p=parseGrid(rawGrid);
  st={dengei:lvl,grid:p.grid,px:p.sx,py:p.sy,ex:p.ex,ey:p.ey,dir:1,
      cmds:[],running:false,upai:350,kenes:2};
  st.opt=computeOptimalCommands(st.grid,st.px,st.py,st.ex,st.ey,st.dir);
  GameEngine.setScore(st.upai);GameEngine.updateLevelLabel();render();
}

function parseGrid(raw){
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

function isWall(x,y){return !st.grid[y]||st.grid[y][x]===1;}

function render(){
  var c=document.getElementById("game-container");if(!c)return;
  var rows=st.grid.length,cols=st.grid[0].length;
  var cs=Math.min(56,Math.floor((Math.min(window.innerWidth,760)-32)/cols));

  var dirArrow=["&#9650;","&#9658;","&#9660;","&#9668;"];

  var gridH="<div class='g-grid' style='--cols:"+cols+";--cs:"+cs+"px;'>"+
    st.grid.map(function(row,y){
      return row.map(function(cell,x){
        var isP=x===st.px&&y===st.py,isE=x===st.ex&&y===st.ey;
        var t=cell===1?"wall":isP?"player":isE?"goal":"floor";
        var u=(window.OQ&&window.OQ.currentUser)?window.OQ.currentUser:null;
        var skin=u&&u.equipped_skin==="skin_caravan";
        var ico=isP?(skin?("\uD83D\uDC2A <span class='dir-badge'>" + dirArrow[st.dir] + "</span>"):dirArrow[st.dir]):isE?"&#x1F6A9;":"";
        return "<div class='g-cell' data-t='"+t+"'>"+(ico?"<span class='g-ico'>"+ico+"</span>":"")+"</div>";
      }).join("");
    }).join("")+
  "</div>";

  var cmdDisp="<div class='cmd-box'>"+(st.cmds.length===0?"<span class='cmd-empty'>Бұйрықтар осында көрінеді...</span>":"");
  cmdDisp+=st.cmds.map(function(cmd){
    return "<div class='cmd-chip'>"+
      (cmd==="F"?"&#x2191; Алға":cmd==="L"?"&#x21B0; Сол":cmd==="R"?"&#x21B1; Оң":"?")+
    "</div>";
  }).join("")+
  "</div>";

  c.innerHTML=
    "<div class='g-note'>Түйені бастап жол құрыңыз, кейін &#x25BA; Іске қос!</div>"+
    gridH+
    "<div class='cmd-label'>Бұйрықтар тізбесі</div>"+
    cmdDisp+
    "<div class='g-actions'>"+
      "<button class='btn btn-blue btn-sm' id='cmd-f'>&#x2191; Алға</button>"+
      "<button class='btn btn-ghost btn-sm' id='cmd-l'>&#x21B0; Солға</button>"+
      "<button class='btn btn-ghost btn-sm' id='cmd-r'>&#x21B1; Оңға</button>"+
      "<button class='btn btn-ghost btn-sm' id='cmd-del' "+(st.cmds.length===0?"disabled":"")+">&#x232B;</button>"+
    "</div>"+
    "<div class='g-actions'>"+
      "<button class='btn btn-blue btn-lg' id='run-btn' "+(st.cmds.length===0?"disabled":"")+">&#x25BA; Іске қосу!</button>"+
      "<button class='btn btn-ghost btn-sm' id='reset-n'>&#8635; Қайта</button>"+
      "<button class='btn btn-ghost btn-sm' id='hint-n' "+(st.kenes<=0?"disabled":"")+">&#128161; Кеңес ("+st.kenes+")</button>"+
    "</div>";

  document.getElementById("cmd-f").onclick=function(){if(st.cmds.length<20){st.cmds.push("F");render();}};
  document.getElementById("cmd-l").onclick=function(){if(st.cmds.length<20){st.cmds.push("L");render();}};
  document.getElementById("cmd-r").onclick=function(){if(st.cmds.length<20){st.cmds.push("R");render();}};
  document.getElementById("cmd-del").onclick=function(){st.cmds.pop();render();};
  document.getElementById("run-btn").onclick=function(){runProgram();};
  document.getElementById("reset-n").onclick=function(){startLevel(st.dengei);};
  document.getElementById("hint-n").onclick=function(){
    if(st.kenes<=0)return;st.kenes--;
    st.upai=Math.max(50,st.upai-60);
    GameEngine.setScore(st.upai);
    window.OQ&&OQ.Toast.info("Қызыл жалаушаға дейін ең қысқа жолды табыңыз. «Алға → Оңға → Алға» секілді қадамдарды қолданыңыз.");
    render();
  };
}

function runProgram(){
  if(st.running)return;
  st.running=true;
  var simX=st.px,simY=st.py,simDir=st.dir;
  var cmds=st.cmds.slice();
  var step=0;

  function stepFn(){
    if(step>=cmds.length){
      // Done - check if at exit
      st.running=false;
      if(simX===st.ex&&simY===st.ey){
        var hintsUsed=2-st.kenes;
        var zhuldyzdar=capStarsByHints(starsByProgramLength(cmds.length,st.opt,st.dengei),hintsUsed);
        GameEngine.setScore(st.upai+100);
        setTimeout(function(){GameEngine.completeLevel(zhuldyzdar);},300);
      } else {
        window.OQ&&OQ.Toast.error("Байраққа жетпеді! Программаңызды түзететін болыңыз.");
        st.running=false;
      }
      return;
    }
    var cmd=cmds[step];step++;
    if(cmd==="L")simDir=(simDir+3)%4;
    else if(cmd==="R")simDir=(simDir+1)%4;
    else if(cmd==="F"){
      var nx=simX+DX[simDir],ny=simY+DY[simDir];
      if(!isWall(nx,ny)){simX=nx;simY=ny;}
      else{// Hit wall
        st.running=false;
        window.OQ&&OQ.Toast.error("Қабырғаға тірелді! Жол қатесін түзететін болыңыз.");
        return;
      }
    }
    st.px=simX;st.py=simY;st.dir=simDir;render();
    setTimeout(stepFn,300);
  }
  stepFn();
}

window.GameModules.nomad={startLevel:startLevel};
})();
