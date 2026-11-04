/* zero water · анімації та дрібна логіка */
(function(){
  var d=document, root=d.documentElement;
  var RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* запуск заголовків */
  function go(){ root.classList.add('ready'); }
  if(d.fonts && d.fonts.ready){
    var done=false, f=function(){ if(!done){ done=true; requestAnimationFrame(function(){ requestAnimationFrame(go); }); } };
    d.fonts.ready.then(f); setTimeout(f,700);
  } else { requestAnimationFrame(go); }

  /* лічильники */
  function count(el){
    if(el.dataset.done) return; el.dataset.done='1';
    var raw=el.getAttribute('data-count'), end=parseFloat(raw);
    var dec=(raw.split('.')[1]||'').length, pre=el.getAttribute('data-pre')||'', suf=el.getAttribute('data-suf')||'';
    var fin=el.textContent;
    if(RM || isNaN(end)) return;
    var t0=null, D=1500;
    function step(t){
      if(t0===null) t0=t;
      var k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,3), v=end*e;
      el.textContent=pre+(dec? v.toFixed(dec) : String(Math.round(v)))+suf;
      if(k<1) requestAnimationFrame(step); else el.textContent=fin;
    }
    requestAnimationFrame(step);
  }

  /* циферблат 00:00 → 05:00 */
  function dial(el){
    var t=el.querySelector('[data-clock]'); if(!t || RM) return;
    var total=parseInt(t.getAttribute('data-clock'),10)||300, fin=t.textContent, t0=null, D=2600;
    function fmt(s){ var m=Math.floor(s/60), r=s%60; return (m<10?'0':'')+m+':'+(r<10?'0':'')+r; }
    function step(ts){
      if(t0===null) t0=ts;
      var k=Math.min(1,(ts-t0)/D), e=k<.5? 2*k*k : 1-Math.pow(-2*k+2,2)/2;
      t.textContent=fmt(Math.round(total*e));
      if(k<1) requestAnimationFrame(step); else t.textContent=fin;
    }
    requestAnimationFrame(step);
  }

  /* поява при прокрутці */
  var targets=d.querySelectorAll('.rv,[data-count],.dial,.meter,.scale-box,.capsule');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        var el=e.target; el.classList.add('in'); io.unobserve(el);
        if(el.hasAttribute('data-count')) count(el);
        if(el.classList.contains('dial')) dial(el);
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.15});
    targets.forEach(function(el){ io.observe(el); });
  } else {
    targets.forEach(function(el){ el.classList.add('in'); });
  }

  /* прогрес, таймлайн, паралакс */
  var bar=d.querySelector('.prog i'), tls=[].slice.call(d.querySelectorAll('.tl')), stage=d.querySelector('.stage'), ticking=false;
  function frame(){
    ticking=false;
    var h=root.scrollHeight-innerHeight, y=window.scrollY||pageYOffset;
    if(bar) bar.style.transform='scaleX('+(h>0? Math.min(1,y/h) : 0)+')';
    var mid=innerHeight*.62;
    tls.forEach(function(tl){
      var r=tl.getBoundingClientRect(), k=Math.max(0,Math.min(1,(mid-r.top)/r.height));
      tl.style.setProperty('--k',k.toFixed(3));
      [].forEach.call(tl.children,function(li){ li.classList.toggle('on', li.getBoundingClientRect().top+8<mid); });
    });
    if(stage && !RM) stage.style.setProperty('--sy', Math.min(y,700));
  }
  function onScroll(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } }
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); frame();

  /* банка: тап = підскок і піксельний салют */
  [].forEach.call(d.querySelectorAll('.can'),function(c){
    c.addEventListener('click',function(){
      c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
      if(RM || !c.animate) return;
      var r=c.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height*.22;
      for(var i=0;i<16;i++){
        var s=d.createElement('i'), z=5+Math.random()*7, a=-Math.PI*(.08+Math.random()*.84), dist=70+Math.random()*150;
        s.className='px'; s.style.left=cx+'px'; s.style.top=cy+'px'; s.style.width=s.style.height=z+'px';
        s.style.background=Math.random()<.72? '#eda607' : '#f5f5f7';
        d.body.appendChild(s);
        s.animate([
          {transform:'translate(-50%,-50%) rotate(0deg)',opacity:1},
          {transform:'translate(calc(-50% + '+(Math.cos(a)*dist)+'px),calc(-50% + '+(Math.sin(a)*dist)+'px)) rotate('+(Math.random()*240-120)+'deg)',opacity:0}
        ],{duration:650+Math.random()*550,easing:'cubic-bezier(.16,1,.3,1)'}).onfinish=(function(n){ return function(){ n.remove(); }; })(s);
      }
    });
  });
  [].forEach.call(d.querySelectorAll('.can'),function(c){ c.addEventListener('animationend',function(e){ if(e.animationName==='pop') c.classList.remove('pop'); }); });

  /* відео: своя кнопка play, далі рідні контроли */
  [].forEach.call(d.querySelectorAll('.phone'),function(ph){
    var v=ph.querySelector('video'); if(!v) return;
    v.removeAttribute('controls');
    var b=d.createElement('button'); b.type='button'; b.className='play'; b.setAttribute('aria-label','Дивитись відео');
    b.innerHTML='<i></i>';
    ph.appendChild(b);
    b.addEventListener('click',function(){ v.setAttribute('controls',''); b.remove(); var p=v.play(); if(p && p.catch) p.catch(function(){}); });
  });

  /* підказка «гортай», лише коли є що гортати */
  [].forEach.call(d.querySelectorAll('.shots'),function(s){
    var hint=s.nextElementSibling;
    if(!hint || !hint.classList.contains('swipe')) return;
    function chk(){ hint.style.display = s.scrollWidth>s.clientWidth+4 ? '' : 'none'; }
    chk(); addEventListener('resize',chk);
    s.addEventListener('scroll',function(){ if(s.scrollLeft>20) hint.style.opacity='0'; },{passive:true});
  });
})();
