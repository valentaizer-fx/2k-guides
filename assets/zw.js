/* zero water · тиха поява і прогрес прокрутки */
(function(){
  var d=document, root=d.documentElement;
  function go(){ root.classList.add('ready'); }
  if(d.fonts && d.fonts.ready){ var done=false, f=function(){ if(!done){ done=true; requestAnimationFrame(go); } }; d.fonts.ready.then(f); setTimeout(f,600); } else { go(); }

  var els=d.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -6% 0px',threshold:.1});
    [].forEach.call(els,function(el){ io.observe(el); });
  } else { [].forEach.call(els,function(el){ el.classList.add('in'); }); }

  var bar=d.querySelector('.prog i'), t=false;
  function frame(){ t=false; var h=root.scrollHeight-innerHeight; if(bar) bar.style.transform='scaleX('+(h>0? Math.min(1,(window.scrollY||pageYOffset)/h) : 0)+')'; }
  addEventListener('scroll',function(){ if(!t){ t=true; requestAnimationFrame(frame); } },{passive:true});
  addEventListener('resize',frame); frame();
})();
