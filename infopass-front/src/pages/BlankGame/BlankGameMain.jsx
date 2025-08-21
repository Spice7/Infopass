import React, { useEffect, useState, useRef } from 'react';

/* --------------------------------------------------
   PHASES
   loading -> gather(캐릭터 군집, 로고/버튼 숨김) -> monster(몬스터 하강) -> firing(레이저) -> boom(폭발/흔들림) -> scatter(캐릭터 흩어짐) -> reveal(로고/버튼 등장)
-------------------------------------------------- */

const baseStyle = {
  width: '60vw',
  height: '75vh',
  minWidth: '600px',
  minHeight: '400px',
  background: 'url(/ox_image/002.png) center/cover no-repeat',
  borderRadius: '32px',
  boxShadow: '0 8px 32px rgba(0,0,0,.25)',
  margin: 'auto',
  marginTop: '150px',
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  zIndex: 10
};

const loadingStyle = {
  ...baseStyle,
  background: 'linear-gradient(135deg,#5ca5e9,#357abd)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2.2rem',
  fontWeight: 'bold',
  color: '#fff',
  letterSpacing: '2px'
};

// 동적 CSS (keyframes + 클래스)
const dynamicCss = `
@keyframes monsterDrop {0%{transform:translate(-50%,-250px) scale(.7);opacity:0}70%{opacity:1}100%{transform:translate(-50%,30px) scale(1);opacity:1}}
@keyframes laserGrow {0%{transform:scaleY(0);opacity:0}30%{opacity:1}100%{transform:scaleY(1);opacity:1}}
@keyframes burstPopHold {0%{transform:translate(-50%,-50%) scale(.35);opacity:0}55%{transform:translate(-50%,-50%) scale(1.25);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
@keyframes screenShake {0%,100%{transform:translate(0,0)}20%{transform:translate(-10px,6px)}40%{transform:translate(8px,-6px)}60%{transform:translate(-7px,4px)}80%{transform:translate(6px,-5px)}}
@keyframes fadeInUp {0%{opacity:0;transform:translate(-50%,30px)}100%{opacity:1;transform:translate(-50%,0)}}
@keyframes charJump {0%{transform:translateY(0)}100%{transform:translateY(-26px)}}
.blank-stage {position:relative;width:100%;height:100%;}
.blank-stage.shake {animation:screenShake .55s ease both}
.chars-layer {position:absolute;inset:0;}
.blank-char {position:absolute;width:170px;transition:transform .9s cubic-bezier(.22,1,.3,1), filter .25s;z-index:5;display:flex;align-items:center;justify-content:center;}
.blank-char .char-img {width:100%;height:auto;display:block;}
.blank-char.jump .char-img {animation:charJump .6s ease-in-out infinite alternate;}
.blank-monster {position:absolute;top:-3%;left:50%;transform:translate(-50%,-250px);width:170px;z-index:0;filter:drop-shadow(0 0 24px rgba(255,0,0,.55));}
.blank-monster.in {animation:monsterDrop .9s cubic-bezier(.22,1,.3,1) forwards}
.blank-laser {position:absolute;left:50%;top:22%;transform:translateX(-50%) scaleY(0);transform-origin:top;width:80px;height:350px;opacity:0;z-index:-1;filter:drop-shadow(0 0 28px rgba(255,255,130,.95));}
.blank-laser.on {animation:laserGrow .45s ease-out forwards;opacity:1}
/* firing 이후에도 유지 */
.blank-laser.persist {transform:translateX(-50%) scaleY(1);opacity:1}
.blank-burst {position:absolute;left:49%;top:79%;width:380px;opacity:0;pointer-events:none;z-index:-2;}
.blank-burst.show {animation:burstPopHold .65s ease-out forwards}
.blank-logo {position:absolute;top:-2%;left:46%;transform:translate(-50%,0);width:100%;max-width:100%;opacity:0;}
.blank-logo.reveal {animation:fadeInUp .8s cubic-bezier(.22,.95,.3,1) forwards .05s}
.blank-btn {position:absolute;width:220px;left:50%;transform:translateX(-50%);opacity:0;cursor:pointer;z-index:1001;transition:opacity .6s, transform .3s}
.blank-btn.multi {top:60%}
.blank-btn.single {top:72%}
.blank-btn.reveal {opacity:1}
.blank-btn:hover {transform:translate(-50%,-6px) scale(1.05)}
`;

// 캐릭터 데이터: 군집 위치(클러스터) -> 산개 최종 위치
// cluster 기준 원점(center bottom near single button): left 50%, top 70% 부근.
// 초기(line-up): 왼→오 순서로 일렬 배치 (수평), 산개 위치는 기존 이미지 느낌 유지
const characters = [
  { key:'c5', img:'/ox_image/char5.png', cx:-270, cy:0, ex:-420, ey:-390, rot:'-25deg' },
  { key:'c4', img:'/ox_image/char4.png', cx:-90,  cy:0, ex:-190, ey:-40,  rot:'-30deg' },
  { key:'c1', img:'/ox_image/char1.png', cx:90,   cy:0, ex:100,  ey:0,    rot:'25deg' },
  { key:'c3', img:'/ox_image/char3.png', cx:270,  cy:0, ex:370,  ey:-150, rot:'20deg' },
];

const BlankGameMain = () => {
  const [phase,setPhase] = useState('loading'); // loading|gather|monster|firing|boom|scatter|reveal
  const [walkFrame,setWalkFrame] = useState(0);
  const [shake,setShake] = useState(false);
  // 레이저/폭발 위치 계산용
  const [beamTop,setBeamTop] = useState(220); // px
  const [beamHeight,setBeamHeight] = useState(350); // px
  const [burstTop,setBurstTop] = useState('79%'); // px or %

  const containerRef = useRef(null);
  const monsterRef = useRef(null);

  // CSS 주입 1회
  useEffect(()=>{
    const tag=document.createElement('style');
    tag.innerHTML=dynamicCss;document.head.appendChild(tag);return()=>document.head.removeChild(tag);
  },[]);

  // 로딩 애니메이션
  useEffect(()=>{
    if(phase!=='loading') return; 
    const iv = setInterval(()=> setWalkFrame(f=> (f+1)%4),180);
    const to = setTimeout(()=> setPhase('gather'), 2200);
    return ()=> {clearInterval(iv); clearTimeout(to);} ;
  },[phase]);

  // 시퀀스 진행
  useEffect(()=>{
    if(phase==='gather') { // 캐릭터 클러스터 보이게 잠깐 멈춤
      const t = setTimeout(()=> setPhase('monster'), 700); return ()=> clearTimeout(t);
    }
    if(phase==='monster') { // 몬스터 떨어진 뒤 레이저
      const t = setTimeout(()=> setPhase('firing'), 950); return ()=> clearTimeout(t);
    }
    if(phase==='firing') { // 레이저 유지 후 폭발
      // 몬스터 위치 기준 빔/폭발 재계산
      requestAnimationFrame(()=>{
        if(!containerRef.current || !monsterRef.current) return;
        const cRect = containerRef.current.getBoundingClientRect();
        const mRect = monsterRef.current.getBoundingClientRect();
        const topPx = mRect.bottom - cRect.top - 4; // 몬스터 하단 조금 아래부터
        const targetBurstY = cRect.top + cRect.height * 0.79; // 기존 비율 유지
        const heightPx = Math.max(120, targetBurstY - topPx); // 최소 높이 보장
        setBeamTop(topPx);
        setBeamHeight(heightPx);
        setBurstTop((targetBurstY - cRect.top) + 'px');
      });
      const t = setTimeout(()=> setPhase('boom'), 450); return ()=> clearTimeout(t);
    }
    if(phase==='boom') {
      setShake(true);
      const t1 = setTimeout(()=> setShake(false), 600);
      const t2 = setTimeout(()=> setPhase('scatter'), 620);
      return ()=> {clearTimeout(t1); clearTimeout(t2);} ;
    }
    if(phase==='scatter') { // 캐릭터 산개 후 로고/버튼 등장
      const t = setTimeout(()=> setPhase('reveal'), 950); return ()=> clearTimeout(t);
    }
  },[phase]);

  const enterMulti = ()=> window.location.href='OX_Lobby';
  const enterSingle = ()=> window.location.href='blankgamesingle';

  if(phase==='loading') {
    const walkImgs=['/ox_image/walk1.png','/ox_image/walk2.png','/ox_image/walk3.png','/ox_image/walk4.png'];
    return (
      <div style={loadingStyle}>
        <img src={walkImgs[walkFrame]} alt="loading" style={{width:'110px'}} />
        로딩중...
      </div>
    );
  }

  const showMonster=['monster','firing','boom','scatter','reveal'].includes(phase);
  // 레이저: firing 이후에도 끝까지 유지
  const showLaser=['firing','boom','scatter','reveal'].includes(phase);
  const laserPersist = ['boom','scatter','reveal'].includes(phase);
  const showBurst=phase==='boom' || ['scatter','reveal'].includes(phase); // 폭발 유지
  const revealLogo=phase==='reveal';
  const revealBtns=phase==='reveal';
  const scatter = ['scatter','reveal'].includes(phase);

  // 기준점: left 50%, top 70% (cluster origin)
  return (
    <div ref={containerRef} style={baseStyle} className={`blank-stage ${shake?'shake':''}`}>      
  <div className="chars-layer">
        {characters.map(c=>{
          const x = scatter? c.ex : c.cx;
          const y = scatter? c.ey : c.cy;
          const scale = scatter && (c.key==='c5' || c.key==='c3') ? 1.7 : 1;
          const jumping = phase==='monster';
          return (
            <div key={c.key}
                 className={`blank-char ${jumping? 'jump':''}`}
                 style={{left:'46%', top:'70%', transform:`translate(${x}px,${y}px) rotate(${c.rot}) scale(${scale})`, zIndex:'1000'}}>
              <img src={c.img} alt="char" className="char-img" />
            </div>
          );
        })}
      </div>

      {/* 몬스터 */}
    <img ref={monsterRef} src="/ox_image/monster.png" alt="monster" className={`blank-monster ${showMonster? 'in':''}`} />
      {/* 레이저 & 폭발 */}
  {showLaser && <img src="/ox_image/laserYellow1.png" alt="laser" className={`blank-laser ${laserPersist? 'persist':'on'}`} style={{top:beamTop+'px', height:beamHeight+'px'}} />}
  {showBurst && <img src="/ox_image/laserboom2.png" alt="burst" className={`blank-burst show`} style={{top:burstTop}} />}

      {/* 로고 & 버튼 */}
      <img src="/gamelogo/BlankLogo.png" alt="logo" className={`blank-logo ${revealLogo? 'reveal':''}`} />
      <img src="/ox_image/multibutton.png" alt="멀티" className={`blank-btn multi ${revealBtns? 'reveal':''}`} onClick={enterMulti} />
      <img src="/ox_image/singlebutton.png" alt="싱글" className={`blank-btn single ${revealBtns? 'reveal':''}`} onClick={enterSingle} />
    </div>
  );
};

export default BlankGameMain;