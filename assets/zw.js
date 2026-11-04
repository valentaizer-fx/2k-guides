/* zero water · v3: поява, прогрес, лічильники, свайп-лінія, банка-гід */
(function(){
  var d=document, root=d.documentElement;
  var RM=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(){ root.classList.add('ready'); }
  if(d.fonts && d.fonts.ready){ var done=false, f=function(){ if(!done){ done=true; requestAnimationFrame(function(){ requestAnimationFrame(go); }); } }; d.fonts.ready.then(f); setTimeout(f,700); } else { go(); }

  /* лічильники */
  function count(el){
    if(el.dataset.done || RM) return; el.dataset.done='1';
    var raw=el.getAttribute('data-count'), end=parseFloat(raw), dec=(raw.split('.')[1]||'').length;
    var pre=el.getAttribute('data-pre')||'', fin=el.textContent, t0=null, D=1300;
    function step(t){ if(t0===null) t0=t; var k=Math.min(1,(t-t0)/D), e=1-Math.pow(1-k,3), v=end*e;
      el.textContent=pre+(dec? v.toFixed(dec) : String(Math.round(v))); if(k<1) requestAnimationFrame(step); else el.textContent=fin; }
    requestAnimationFrame(step);
  }

  /* поява */
  var els=d.querySelectorAll('.rv,[data-count],.range,.timer,.meter');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; var el=e.target; el.classList.add('in'); io.unobserve(el); if(el.hasAttribute('data-count')) count(el); }); },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    [].forEach.call(els,function(el){ io.observe(el); });
  } else { [].forEach.call(els,function(el){ el.classList.add('in'); }); }

  /* прогрес */
  var bar=d.querySelector('.prog i'), t=false;
  function frame(){ t=false; var h=root.scrollHeight-innerHeight, y=window.scrollY||pageYOffset; if(bar) bar.style.transform='scaleX('+(h>0? Math.min(1,y/h) : 0)+')'; tips(); }
  addEventListener('scroll',function(){ if(!t){ t=true; requestAnimationFrame(frame); } },{passive:true});
  addEventListener('resize',frame);

  /* лінія під каруселлю скрінів */
  [].forEach.call(d.querySelectorAll('.shots'),function(s){
    var tr=s.nextElementSibling; if(!tr || !tr.classList.contains('track')) return; var i=tr.querySelector('i');
    function upd(){ var max=s.scrollWidth-s.clientWidth; if(max<=4){ tr.style.display='none'; return; } tr.style.display=''; var vis=s.clientWidth/s.scrollWidth, p=s.scrollLeft/max; i.style.width=(vis*100)+'%'; i.style.transform='translateX('+(p*(1/vis-1)*100)+'%)'; }
    i.style.transformOrigin='0 50%'; s.addEventListener('scroll',function(){ requestAnimationFrame(upd); },{passive:true}); addEventListener('resize',upd); upd();
  });

  /* банка-гід: підказка міняється по розділах */
  var zg=d.querySelector('.zg'), zt=zg && zg.querySelector('.zg-t'), btn=zg && zg.querySelector('.zg-c');
  var spots=[].slice.call(d.querySelectorAll('[data-tip]')), cur=null;
  function setTip(txt){
    if(!zt || txt===cur) return; var first=cur===null; cur=txt;
    if(first || RM){ zt.textContent=txt; return; }
    zt.classList.add('swap'); setTimeout(function(){ zt.textContent=txt; zt.classList.remove('swap'); },220);
    if(zg.classList.contains('min')) zg.classList.add('new');
  }
  function tips(){
    if(!zg || !spots.length) return;
    var line=innerHeight*.55, pick=spots[0];
    spots.forEach(function(s){ if(s.getBoundingClientRect().top<line) pick=s; });
    setTip(pick.getAttribute('data-tip'));
  }
  if(zg){
    d.body.classList.add('has-zg');
    tips();
    setTimeout(function(){ zg.classList.add('on'); },900);
    btn.addEventListener('click',function(){ zg.classList.toggle('min'); zg.classList.remove('new'); btn.setAttribute('aria-label', zg.classList.contains('min')? 'Показати підказку' : 'Сховати підказку'); });
  }
  frame();
})();
