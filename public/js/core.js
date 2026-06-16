(function(){
'use strict';
var Toast={
  show:function(m,t){var c=document.getElementById("toast-container");if(!c)return;var el=document.createElement("div");el.className="toast toast-"+t;el.textContent=m;c.appendChild(el);setTimeout(function(){el.style.opacity="0";el.style.transform="translateY(-10px)";setTimeout(function(){el.remove();},300);},3000);},
  success:function(m){this.show(m,"success");},
  error:function(m){this.show(m,"error");},
  info:function(m){this.show(m,"info");},
  coin:function(m){this.show(m,"coin");}
};
function showCoinAnim(n){var el=document.createElement("div");el.style.cssText="position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);z-index:99999;font-size:30px;font-weight:900;color:#FF9500;pointer-events:none;text-shadow:0 2px 8px rgba(0,0,0,.2);";el.textContent="+"+n+" \uD83E\uFA99";document.body.appendChild(el);var s=0;function a(){s+=16;var p=s/1400;if(p>=1){el.remove();return;}el.style.opacity=String(1-p);el.style.transform="translate(-50%,"+(-50-p*120)+"%) scale("+(1+p*.5)+")";requestAnimationFrame(a);}requestAnimationFrame(a);}
function apiPost(url,d){return fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d||{})}).then(function(r){return r.json();});}
function apiGet(url){return fetch(url).then(function(r){return r.json();});}
var GAMES=[
  {id:"nomad",    kaz:"Keruen Zholy",       desc:"\u041a\u0435\u0440\u0443\u0435\u043d\u0434\u0456 \u0431\u0430\u0493\u044b\u0442\u0442\u0430\u043f, \u043c\u0430\u049b\u0441\u0430\u0442\u049b\u0430 \u0436\u0435\u0442\u043a\u0456\u0437!",    color:"#FF9500",bg:"linear-gradient(135deg,#FF8F00,#FFB300)",ico:"\uD83D\uDC2A",max:10},
  {id:"tamga",    kaz:"Tamba Shesher",      desc:"\u0422\u0430\u04a3\u0431\u0430\u043b\u0430\u0440\u0434\u044b\u04a3 \u043c\u04d9\u043d\u0434\u0435\u0440\u0456\u043d \u0442\u0430\u043f!",        color:"#9C27B0",bg:"linear-gradient(135deg,#6A1B9A,#AB47BC)",ico:"\uD83D\uDD22",max:10},
  {id:"labirint", kaz:"Otyrar Labirinti",   desc:"\u041b\u0430\u0431\u0438\u0440\u0438\u043d\u0442\u0442\u0435\u043d \u0448\u044b\u0493\u044b\u0441 \u0436\u043e\u043b\u044b\u043d \u0442\u0430\u043f!",     color:"#009688",bg:"linear-gradient(135deg,#00695C,#26A69A)",ico:"\uD83C\uDFF0",max:10},
  {id:"qamal",    kaz:"Qorgan",             desc:"\u0416\u04d9\u0448\u0456\u043a\u0442\u0435\u0440\u0434\u0456 \u043e\u0440\u043d\u044b\u043d\u0430 \u0436\u044b\u043b\u0436\u044b\u0442!",      color:"#1976D2",bg:"linear-gradient(135deg,#0D47A1,#42A5F5)",ico:"\uD83D\uDCE6",max:10},
  {id:"estek",    kaz:"Zhady",              desc:"\u0411\u0456\u0440\u0434\u0435\u0439 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430\u043b\u0430\u0440\u0434\u044b \u0442\u0430\u0431!",  color:"#4CAF50",bg:"linear-gradient(135deg,#2E7D32,#66BB6A)",ico:"\uD83E\uDDE0",max:10},
  {id:"altyn",    kaz:"Altyn Adam",         desc:"\u0422\u0430\u049b\u0442\u0430\u0439\u0448\u0430\u043b\u0430\u0440\u0434\u044b \u0440\u0435\u0442\u043a\u0435 \u043a\u0435\u043b\u0442\u0456\u0440!",  color:"#FFC107",bg:"linear-gradient(135deg,#F57F17,#FFCA28)",ico:"\uD83C\uDFFD",max:10},
  {id:"dialog",   kaz:"Ulagat",             desc:"\u049a\u0430\u0437\u0430\u049b \u0434\u04d9\u0441\u0442\u04af\u0440\u0456\u043d \u04af\u0439\u0440\u0435\u043d!",        color:"#3F51B5",bg:"linear-gradient(135deg,#1A237E,#5C6BC0)",ico:"\uD83D\uDCDC",max:10},
  {id:"baiterek", kaz:"Baiterek Zharys",    desc:"\u0422\u0435\u0437 \u0436\u0430\u0443\u0430\u043f \u0431\u0435\u0440, \u04af\u0442\u044b\u0441 \u0441\u0435\u043d\u0456\u043a\u0456!",  color:"#F44336",bg:"linear-gradient(135deg,#B71C1C,#EF5350)",ico:"\u26A1",max:10},
  {id:"expo",     kaz:"San Alemi",          desc:"\u0421\u0430\u043d\u0434\u0430\u0440 \u049b\u0430\u0442\u0430\u0440\u044b\u043d \u0442\u0430\u0431!",           color:"#00BCD4",bg:"linear-gradient(135deg,#006064,#26C6DA)",ico:"\uD83D\uDCCA",max:10},
  {id:"cyber",    kaz:"Kiberqalqan",        desc:"\u041b\u043e\u0433\u0438\u043a\u0430 \u043c\u0435\u043d \u0448\u0438\u0444\u0440\u0434\u0456 \u0448\u0435\u0448!",    color:"#673AB7",bg:"linear-gradient(135deg,#311B92,#7E57C2)",ico:"\uD83D\uDD11",max:10},
  {id:"qala",     kaz:"Qala Bileti",        desc:"\u049a\u0430\u0437\u0430\u049b\u0441\u0442\u0430\u043d \u049b\u0430\u043b\u0430\u043b\u0430\u0440\u044b\u043d \u0442\u0430\u043f!",  color:"#FF5722",bg:"linear-gradient(135deg,#BF360C,#FF7043)",ico:"\uD83C\uDFD9",max:10},
  {id:"soztorr",  kaz:"Soztorr",            desc:"\u0416\u0430\u0441\u044b\u0440\u044b\u043d \u0441\u04e9\u0437\u0434\u0456 \u0442\u0430\u043f!",           color:"#2196F3",bg:"linear-gradient(135deg,#0D47A1,#42A5F5)",ico:"\uD83D\uDCDD",max:10},
];
var AVATAR_BG=["linear-gradient(135deg,#007AFF,#5AC8FA)","linear-gradient(135deg,#FF9500,#FFB340)","linear-gradient(135deg,#34C759,#30D158)","linear-gradient(135deg,#AF52DE,#BF5AF2)"];
function getAvatar(id){
  var i=Math.max(0,(id||1)-1);
  var emoji=id===3?"\uD83E\uDD47":(id===2?"\uD83C\uDFD5":"\uD83D\uDC64");
  return{bg:AVATAR_BG[i%AVATAR_BG.length],emoji:emoji};
}
function applyCosmeticsTo(el,user){
  if(!el||!user)return;
  el.classList.remove("frame-gold");
  if(user.equipped_frame==="frame_gold") el.classList.add("frame-gold");
  el.classList.remove("ava-bg-1","ava-bg-2","ava-bg-3","ava-bg-4");
  var aid=parseInt(user.avatar_id,10)||1;
  if(aid>=1&&aid<=4) el.classList.add("ava-bg-"+aid);
  var av=getAvatar(user.avatar_id);
  if(typeof el.textContent!=="undefined") el.textContent=av.emoji;
}
function setCurrentUser(u){
  window.OQ.currentUser=u;
  try{
    document.body.classList.remove("skin-caravan");
    if(u&&u.equipped_skin==="skin_caravan") document.body.classList.add("skin-caravan");
  }catch(e){}
}
window.OQ={Toast:Toast,showCoinAnim:showCoinAnim,apiPost:apiPost,apiGet:apiGet,GAMES:GAMES,getAvatar:getAvatar,applyCosmeticsTo:applyCosmeticsTo,setCurrentUser:setCurrentUser};
})();
