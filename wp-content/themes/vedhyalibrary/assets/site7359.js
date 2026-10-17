/* ===== Vedhya Library — Shared behaviours ===== */
(function(){
  const header=document.getElementById('header');
  const progress=document.getElementById('progress');
  const onScroll=()=>{
    const st=window.scrollY;
    if(header)header.classList.toggle('scrolled',st>30);
    if(progress){const h=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(st/(h||1)*100)+'%';}
  };
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Reveal on scroll
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Counters
  const cio=new IntersectionObserver((es)=>{es.forEach(e=>{
    if(!e.isIntersecting)return;const el=e.target,t=+el.dataset.count;let c=0,s=Math.max(1,t/60);
    const tick=()=>{c+=s;if(c<t){el.textContent=Math.floor(c)+(t>=1000?'+':'');requestAnimationFrame(tick);}else el.textContent=t+(t>=1000?'+':'');};
    tick();cio.unobserve(el);});},{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(c=>cio.observe(c));

  // Magnetic buttons + tilt
  if(window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.btn').forEach(b=>{
      b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.32}px)`;});
      b.addEventListener('mouseleave',()=>{b.style.transform='';});
    });
    document.querySelectorAll('[data-tilt]').forEach(c=>{
      c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(800px) rotateY(${px*6}deg) rotateX(${-py*6}deg) translateY(-8px)`;});
      c.addEventListener('mouseleave',()=>{c.style.transform='';});
    });
  }

  // Accessible mobile menu toggle
  const mb=document.querySelector('.menu-btn'),mm=document.querySelector('.mobile-menu');
  const setMobileMenu=open=>{
    if(!mb||!mm)return;
    mm.classList.toggle('open',open);
    mm.setAttribute('aria-hidden',String(!open));
    mb.setAttribute('aria-expanded',String(open));
    mb.setAttribute('aria-label',open?'Close menu':'Open menu');
    document.body.classList.toggle('menu-open',open);
  };
  if(mb&&mm){
    mb.addEventListener('click',()=>setMobileMenu(mb.getAttribute('aria-expanded')!=='true'));
    mm.addEventListener('click',e=>{if(e.target.closest('a')&&!e.target.closest('[data-fee-open]'))setMobileMenu(false);});
    document.addEventListener('click',e=>{if(mb.getAttribute('aria-expanded')==='true'&&!mm.contains(e.target)&&!mb.contains(e.target))setMobileMenu(false);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mb.getAttribute('aria-expanded')==='true'){setMobileMenu(false);mb.focus();}});
    window.matchMedia('(min-width: 941px)').addEventListener('change',e=>{if(e.matches)setMobileMenu(false);});
  }

  /* ===== Seat timings & fees pop-up ===== */
  const fm=document.getElementById('feeModal');
  if(fm){
    let opener=null;
    const open=()=>{
      opener=document.activeElement;
      fm.hidden=false;
      document.body.classList.add('fee-open');
      setMobileMenu(false);
      const x=fm.querySelector('.fee-modal-x');
      if(x)x.focus();
    };
    const close=()=>{
      if(fm.hidden)return;
      fm.hidden=true;
      document.body.classList.remove('fee-open');
      if(opener&&opener.focus)opener.focus();
      opener=null;
    };
    document.addEventListener('click',e=>{
      const t=e.target.closest('[data-fee-open]');
      if(t){e.preventDefault();open();return;}
      if(e.target.closest('[data-fee-close]')){e.preventDefault();close();}
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    // Open automatically the first time a visitor lands on the membership page.
    if(fm.dataset.auto==='1'){
      let shown=false;
      try{shown=sessionStorage.getItem('vlFeesSeen')==='1';}catch(err){}
      if(!shown){
        setTimeout(()=>{open();try{sessionStorage.setItem('vlFeesSeen','1');}catch(err){}},700);
      }
    }
  }
})();
