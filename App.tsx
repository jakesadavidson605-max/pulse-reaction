import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

const GAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>PULSE — Reaction Arena</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100vw;height:100vh;overflow:hidden;position:fixed;background:#0a0a14;
  font-family:-apple-system,system-ui,sans-serif;touch-action:none;-webkit-user-select:none;user-select:none}
#c{display:block;width:100%;height:100%}
#ui{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;
  display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}
.title{font-size:clamp(28px,7vw,56px);font-weight:800;letter-spacing:2px;
  text-transform:uppercase;background:linear-gradient(90deg,#ff4d6d,#c44dff,#4dafff);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.sub{font-size:14px;color:#8a8aa3;margin-top:8px}
.btn{pointer-events:auto;margin-top:24px;padding:14px 42px;font-size:18px;font-weight:700;
  border:none;border-radius:30px;background:linear-gradient(135deg,#ff4d6d,#c44dff);
  color:#fff;cursor:pointer;transition:transform .15s}
.btn:active{transform:scale(0.94)}
.scores{margin-top:16px;text-align:center}
.scores b{font-size:20px;color:#ff4d6d}
.scores span{font-size:12px;color:#5a5a7a}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="ui"></div>
<script>
(function(){
const NS='pulse_arena_';
const $=(k,d)=>{try{return localStorage.getItem(NS+k)??d}catch(e){return d}};
const S=(k,v)=>{try{localStorage.setItem(NS+k,v)}catch(e){}};
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),ui=document.getElementById('ui');
let W,H,DPR,actx=null,targets=[],score=0,miss=0,lives=5,t=0,running=false,spawnT=0,spawnRate=1200,best=parseInt($('best','0'));
function resize(){DPR=window.devicePixelRatio||1;W=window.innerWidth;H=window.innerHeight;
  cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0)}
window.addEventListener('resize',resize);resize();
function beep(f,d,vol){if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();
  o.frequency.value=f;o.type='sine';g.gain.value=vol||0.2;
  o.connect(g);g.connect(actx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+d);o.stop(actx.currentTime+d)}
function start(){running=true;score=0;miss=0;lives=5;targets=[];spawnT=0;spawnRate=1200;ui.style.display='none'}
function end(){running=false;if(score>best){best=score;S('best',best)}showMenu()}
function showMenu(){ui.style.display='flex';
  ui.innerHTML='<div class="title">PULSE</div><div class="sub">Tap the circles before they fade</div>'+
  '<button class="btn" id="play">PLAY</button><div class="scores"><b>'+best+'</b><br><span>BEST SCORE</span></div>';
  document.getElementById('play').addEventListener('click',()=>{if(!actx){actx=new(window.AudioContext||window.webkitAudioContext)()}if(actx.state==='suspended'){actx.resume()}start()})}
function spawn(){const r=30+Math.random()*25,x=r+Math.random()*(W-2*r),y=r+Math.random()*(H-2*r);
  targets.push({x,y,r,life:1,maxLife:1.5+Math.random()*0.5,born:t,hue:Math.floor(Math.random()*360)})}
function hit(tx,ty){for(let i=targets.length-1;i>=0;i--){const tg=targets[i],dx=tx-tg.x,dy=ty-tg.y;
  if(dx*dx+dy*dy<=tg.r*tg.r){targets.splice(i,1);score++;beep(400+Math.random()*200,0.1,0.3);spawnRate=Math.max(400,spawnRate-12);return true}}
return false}
cv.addEventListener('pointerdown',e=>{if(!actx){actx=new(window.AudioContext||window.webkitAudioContext)()}if(actx.state==='suspended'){actx.resume()}
  if(!running)return;const rect=cv.getBoundingClientRect();const x=(e.clientX-rect.left)*(W/rect.width),y=(e.clientY-rect.top)*(H/rect.height);
  if(!hit(x,y)){miss++;lives--;beep(120,0.15,0.2);if(lives<=0)end()}});
function loop(ts){t=ts||0;ctx.clearRect(0,0,W,H);ctx.fillStyle='#0a0a14';ctx.fillRect(0,0,W,H);
  if(running){spawnT+=16;if(spawnT>=spawnRate){spawnT=0;spawn()}
  for(let i=targets.length-1;i>=0;i--){const tg=targets[i];const age=(t-tg.born)/1000,frac=age/tg.maxLife;
  if(frac>=1){targets.splice(i);miss++;lives--;beep(100,0.2,0.15);if(lives<=0)end();continue}
  const r=tg.r*(1-frac*0.3),alpha=1-frac;
  ctx.beginPath();ctx.arc(tg.x,tg.y,r,0,7);ctx.fillStyle='hsla('+tg.hue+',80%,60%,'+(alpha*0.8)+')';ctx.fill();
  ctx.lineWidth=3;ctx.strokeStyle='hsla('+tg.hue+',80%,75%,'+alpha+')';ctx.stroke();
  ctx.beginPath();ctx.arc(tg.x,tg.y,r*frac,0,7);ctx.strokeStyle='hsla('+tg.hue+',80%,75%,'+alpha+')';ctx.lineWidth=2;ctx.stroke()}
  ctx.fillStyle='#fff';ctx.font='bold 20px system-ui';ctx.textAlign='left';
  ctx.fillText('Score: '+score,16,30);ctx.fillText('Lives: '+lives,16,56)}
  requestAnimationFrame(loop)}
showMenu();requestAnimationFrame(loop);
})();
</script>
</body>
</html>
`;

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <WebView
          source={{ html: GAME_HTML }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          scalesPageToFit={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0a0a14',
  },
});
