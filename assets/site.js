
const DATA_URL = "/data/projects.json";
const esc = (s="") => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const media = (p,label="project media") => `<div class="placeholder" style="--accent:${p.accent};--secondary:${p.secondary}"><span class="label">${esc(label)}</span></div>`;
const header = () => `<header class="site-header"><div class="shell"><a class="brand" href="/">Iris Wang</a><nav class="nav" aria-label="Primary"><a href="/work/">Work</a><a href="/about/">About</a><a href="mailto:iriswangsh@gmail.com">Contact</a></nav></div></header>`;
const footer = () => `<footer><div class="shell"><p class="footer-big">Systems<br>meet atmosphere.</p><div class="footer-row"><div><a href="mailto:iriswangsh@gmail.com">iriswangsh@gmail.com</a><br>Melbourne, Australia</div><div>Graphic + UX designer<br>© 2026 Iris Wang</div></div></div></footer>`;

async function getProjects(){
  const r=await fetch(DATA_URL);
  if(!r.ok) throw new Error("Project data unavailable");
  return r.json();
}

function shortStatus(s=""){
  return s.split("·")[0].trim();
}

function card(p,cls=""){
  return `<a class="project-card ${cls}" href="/work/${p.slug}/" data-project="${p.slug}" data-accent="${p.accent}" data-disciplines="${p.disciplines.join(" ").toLowerCase()}" aria-label="${esc(p.title)} case study">
    <div class="project-media">${media(p,`${p.title} — media placeholder`)}</div>
    <div class="project-info">
      <span class="project-num">${p.number}</span>
      <div>
        <h3 class="project-title">${esc(p.title)}</h3>
        <p class="project-summary">${esc(p.summary)}</p>
        <p class="meta-mono">${esc(p.disciplines.slice(0,2).join(" · "))} · ${esc(shortStatus(p.status))}</p>
      </div>
      <span class="project-year meta-mono">${p.year}</span>
    </div>
  </a>`;
}

const filterCopy = {
  all: "Systems and atmosphere across identity, interface and motion.",
  graphic: "Visual systems that stay recognisable across formats.",
  ux: "Research translated into clearer digital decisions.",
  motion: "Time, interaction and sequencing as design material."
};

function filterProjects(kind){
  document.querySelectorAll(".filter").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.filter===kind)));
  document.querySelectorAll(".project-card").forEach(c=>{
    const d=c.dataset.disciplines||"";
    const show=kind==="all"
      || (kind==="graphic" && /(brand|packaging|campaign|editorial|print|typography|exhibition|bookmaking)/.test(d))
      || (kind==="ux" && /(ui\/ux|ux research|product design|e-commerce|front-end|ui design|interaction)/.test(d))
      || (kind==="motion" && /(motion|filmmaking|interaction|front-end)/.test(d));
    c.classList.toggle("hidden-card",!show);
  });
  const copy=document.querySelector("#focus-slogan");
  if(copy) copy.textContent=filterCopy[kind]||filterCopy.all;
}

function setupHeroMotion(projects){
  const hero=document.querySelector(".hero");
  const layer=document.querySelector("#hero-windows");
  if(!hero||!layer||matchMedia("(prefers-reduced-motion: reduce)").matches||matchMedia("(pointer: coarse)").matches) return;

  const pool=Array.from({length:6},(_,i)=>{
    const p=projects[i%projects.length];
    const el=document.createElement("div");
    el.className="motion-trail";
    el.innerHTML=media(p,p.title);
    layer.appendChild(el);
    return el;
  });

  let index=0,lastX=-999,lastY=-999;
  hero.addEventListener("pointermove",e=>{
    const r=hero.getBoundingClientRect();
    const x=e.clientX-r.left,y=e.clientY-r.top;
    if(Math.hypot(x-lastX,y-lastY)<82) return;
    lastX=x;lastY=y;
    const el=pool[index%pool.length];
    const p=projects[(index+1)%projects.length];
    el.innerHTML=media(p,p.title);
    el.style.left=`${x}px`;el.style.top=`${y}px`;
    el.classList.remove("is-visible");
    requestAnimationFrame(()=>el.classList.add("is-visible"));
    setTimeout(()=>el.classList.remove("is-visible"),1450);
    document.documentElement.style.setProperty("--hero-accent",p.accent);
    index++;
  });

  hero.addEventListener("pointerleave",()=>{
    pool.forEach(el=>el.classList.remove("is-visible"));
    document.documentElement.style.setProperty("--hero-accent","#F5F3EE");
  });
}

function setupHomeCardSlogans(){
  document.querySelectorAll(".project-card").forEach(card=>{
    card.addEventListener("pointerenter",()=>{
      document.documentElement.style.setProperty("--accent",card.dataset.accent||"#CFDD2C");
    });
  });
}

function setupHeaderState(){
  const workNav=document.querySelector(".work-nav");
  const headerEl=document.querySelector(".site-header");
  if(!workNav || !headerEl) return;

  const sentinelTop=()=>workNav.getBoundingClientRect().top;
  const update=()=>{
    const active=sentinelTop()<=0;
    document.body.classList.toggle("work-nav-active",active);
  };

  update();
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update);
}

async function renderHome(){
  const projects=await getProjects();
  document.body.insertAdjacentHTML("afterbegin",header());
  const featured=projects.filter(p=>p.featured), more=projects.filter(p=>!p.featured);
  const classes=["wide","narrow","medium","large","large","medium"];
  document.querySelector("#featured-grid").innerHTML=featured.map((p,i)=>card(p,classes[i]||"")).join("");
  document.querySelector("#more-grid").innerHTML=more.map(p=>card(p)).join("");
  document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>filterProjects(b.dataset.filter)));

  const windows=[projects[0],projects[1],projects[2],projects[4]];
  document.querySelector("#hero-windows").innerHTML=windows.map((p,i)=>`<div class="hero-window" style="--accent:${p.accent};--secondary:${p.secondary}">${media(p,i===0?"interface":i===1?"identity":i===2?"prototype":"motion")}</div>`).join("");

  setupHeroMotion(projects);
  setupHomeCardSlogans();
  setupHeaderState();
  document.body.insertAdjacentHTML("beforeend",footer());
}

async function renderWork(){
  const projects=await getProjects();
  document.querySelector("#work-grid").innerHTML=projects.map(p=>card(p)).join("");
  document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>filterProjects(b.dataset.filter)));
  setupHomeCardSlogans();
  document.body.insertAdjacentHTML("beforeend",footer());
}

const flowModes=["full","split","offset","left","tall","band"];

function mediaLabel(title,index){
  if(/research|finding|synthesis|testing|method/i.test(title)) return "research / evidence";
  if(/solution|prototype|application|outcome|final|implementation/i.test(title)) return "final outcome";
  if(/identity|system|concept/i.test(title)) return "visual system";
  return index%2 ? "process detail" : "project media";
}

function projectMeta(p){
  return [
    ["Discipline",p.disciplines.join(", ")],
    ["Year",p.year],
    ["Status",p.status],
    ["Role",p.role],
    ["Tools",p.tools]
  ].filter(x=>x[1]);
}

function createChapterRail(p){
  return `<nav class="chapter-rail" aria-label="Project chapters">
    ${p.sections.map((s,i)=>`<a href="#section-${i+1}" data-label="${esc(s[0])}" aria-label="${esc(s[0])}"></a>`).join("")}
  </nav><div class="chapter-tip" id="chapter-tip"></div>`;
}

function setupChapterRail(){
  const links=[...document.querySelectorAll(".chapter-rail a")];
  const tip=document.querySelector("#chapter-tip");
  const sections=[...document.querySelectorAll(".flow-item")];
  if(!links.length) return;

  links.forEach(a=>{
    a.addEventListener("mouseenter",()=>{
      tip.textContent=a.dataset.label||"";
      tip.classList.add("visible");
    });
    a.addEventListener("mouseleave",()=>tip.classList.remove("visible"));
    a.addEventListener("focus",()=>{
      tip.textContent=a.dataset.label||"";
      tip.classList.add("visible");
    });
    a.addEventListener("blur",()=>tip.classList.remove("visible"));
  });

  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const i=sections.indexOf(entry.target);
        links.forEach((a,j)=>a.classList.toggle("active",i===j));
      }
    });
  },{rootMargin:"-42% 0px -48% 0px",threshold:0});
  sections.forEach(s=>io.observe(s));
}




function render60BPM(p,projects){
  const A="/public/projects/60-bpm";
  const pic=(src,alt,cls="")=>`<img class="${cls}" src="${A}/${src}" alt="${esc(alt)}" loading="lazy">`;
  const next=projects[(projects.indexOf(p)+1)%projects.length];

  document.body.classList.add("compact-brand","project-60");
  document.documentElement.style.setProperty("--project-accent","#CFDD2C");
  document.title="60 BPM — Iris Wang";
  document.body.insertAdjacentHTML("afterbegin",header()+`<div class="reading-progress" id="progress"></div>`);

  document.querySelector("#project-root").innerHTML=`
  <article class="bpm4">
    <nav class="bpm4-rail" aria-label="60 BPM sections">
      ${["Intro","System","Logo","Character","Gradients","Applications","Campaign","Website"].map((x,i)=>`<a href="#bpm4-${i+1}" data-label="${x}"><i></i><span>0${i+1}</span></a>`).join("")}
    </nav>
    <div class="bpm4-tip" id="bpm4-tip"></div>

    <section class="bpm4-hero" id="bpm4-1">
      ${pic("hero.jpg","60 BPM final brand collateral","bpm4-hero-img")}
      <div class="bpm4-shade"></div>
      <div class="shell bpm4-hero-copy">
        <span class="bpm4-meta">Brand identity · Packaging · Campaign · 2024</span>
        <h1>60<br>BPM</h1>
        <p>A café identity translating a 60-BPM tempo into a calm, rechargeable brand world.</p>
      </div>
    </section>

    <section class="bpm4-system" id="bpm4-2">
      <div class="shell bpm4-system-grid">
        <div class="bpm4-system-left">
          <span class="bpm4-meta">02 — Visual system</span>
          <div class="bpm4-font-label"><span>Yorkmade</span><span>Brand display type</span></div><div class="bpm4-yorkmade"><span>THE</span><span>SLOWER</span><span>THE</span><span>HUMAN-ER</span></div>
          <p>The brand slows the pace through soft rounded display forms, compact information and one memorable acid-green accent.</p>
        </div>

        <div class="bpm4-system-right" aria-label="60 BPM typography and colour system">
          <div class="bpm4-type-card">
            <div class="top"><b>Montserrat<br>Black</b><span>Bigger Text</span></div>
            <div class="sample black">Bpm</div>
          </div>
          <div class="bpm4-type-card">
            <div class="top"><b>Montserrat<br>Bold</b><span>Big Text</span></div>
            <div class="sample bold">Bpm</div>
          </div>
          <div class="bpm4-type-card">
            <div class="top"><b>Montserrat<br>Regular</b><span>Body Text</span></div>
            <div class="sample regular">Bpm</div>
          </div>

          <div class="bpm4-swatch green">
            <b>60 BPM Green</b>
            <div><span>Hex: #CFDD2C</span><span>CMYK: 6, 0, 80, 13</span><span>RGB: 207, 221, 44</span></div>
          </div>
          <div class="bpm4-swatch signature">
            <b>Signature</b>
            <div><span>Hex: #E4A3C9</span><span>CMYK: 0, 29, 12, 11</span><span>RGB: 228, 163, 201</span></div>
          </div>

          <div class="bpm4-swatch black">
            <b>60 BPM Black</b>
            <div><span>Hex: #020402</span><span>CMYK: 50, 0, 50, 98</span><span>RGB: 2, 4, 2</span></div>
          </div>
          <div class="bpm4-swatch cream">
            <b>60 BPM Cream</b>
            <div><span>Hex: #FEFEFA</span><span>CMYK: 0, 0, 2, 0</span><span>RGB: 254, 254, 250</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="bpm4-logo" id="bpm4-3">
      <div class="shell">
        <div class="bpm4-head"><span>03 — Logo</span><p></p></div>
        <div class="bpm4-logo-flow">
          <div class="bpm4-logo-copy">
            <h2>Refresh.<br>Recharge.<br>Rejuvenate.</h2>
            <p>The positive-dark logo combines a black coffee-bean form with the chartreuse battery top and positive cross, linking coffee with the idea of recharging.</p>
            <p class="note">The mark stays simple enough to carry across packaging, cups, bags, campaign graphics and digital touchpoints.</p>
          </div>
          <div class="bpm4-logo-main">
            ${pic("svg/60 BPM Black X.svg","Primary 60 BPM positive-dark logo")}
            <span>Primary · positive dark</span>
          </div>
          <div class="bpm4-logo-variants">
            <figure>${pic("svg/60 BPM Black -.svg","60 BPM negative-dark logo")}<figcaption>Negative dark</figcaption></figure>
            <figure>${pic("svg/60 BPM Green X.svg","60 BPM positive green logo")}<figcaption>Positive green</figcaption></figure>
            <figure>${pic("svg/60 BPM Green -.svg","60 BPM negative green logo")}<figcaption>Negative green</figcaption></figure>
          </div>
        </div>
      </div>
    </section>

    <section class="bpm4-dagee-intro" id="bpm4-4">
      <div class="bpm4-character-stage">
        <img src="${A}/character/CHARACTER_FULL.png" alt="THE SLOWER THE HUMAN-ER — Dagee character introduction" class="bpm4-character-full">
      </div>
    </section>

    <section class="bpm4-dagee">
      <div class="shell">
        <span class="bpm4-meta">04 — Character</span>
        <h2 class="bpm4-dagee-sub">Dagee, the creation of tempo</h2>
        <p class="bpm4-dagee-copy">The character’s name Dagee stems from the musical term “Adagio”, referring to a tempo of 60 BPM. Two stages of Dagee show a shift from a monster-like baby to a more human-like figure, echoing the idea of slowing down and keeping calm in daily life.</p>
        <div class="bpm4-dagee-cards">
          <figure>
            <div class="bpm4-dagee-panel young">${pic("character/dagee_1.svg","Young Dagee character")}</div>
            <figcaption><b>Young Dagee</b><span>open · energetic · recharged</span></figcaption>
          </figure>
          <figure>
            <div class="bpm4-dagee-panel grown">${pic("character/dagee_2.svg","Grown Dagee character")}</div>
            <figcaption><b>Grown Dagee</b><span>slower · softer · restored</span></figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="bpm4-gradients-section" id="bpm4-5">
      <div class="shell">
        <div class="bpm4-head light"><span>05 — Tempo gradients</span><p>Three tempo states translate the same visual language from Adagio through Moderato to Presto.</p></div>
        <div class="bpm4-gradients">
          <figure><img src="${A}/svg/60 BPM Pattern.svg" alt="60 BPM Adagio gradient pattern"><figcaption><b>60 BPM</b><span>Adagio</span></figcaption></figure>
          <figure><img src="${A}/svg/120 BPM Pattern.svg" alt="120 BPM Moderato gradient pattern"><figcaption><b>120 BPM</b><span>Moderato</span></figcaption></figure>
          <figure><img src="${A}/svg/180 BPM Pattern.svg" alt="180 BPM Presto gradient pattern"><figcaption><b>180 BPM</b><span>Presto</span></figcaption></figure>
        </div>
      </div>
    </section>

    <section class="bpm4-pack" id="bpm4-6">
      <div class="shell">
        <div class="bpm4-head light"><span>06 — Packaging + applications</span><p>The identity moves through description cards, printed pieces, coffee packaging and carry-bag applications as one connected café system.</p></div>

        <div class="bpm4-subhead"><h3>Description cards</h3></div>
        <div class="bpm4-desc-cards" aria-label="Interactive description cards">
          <button class="bpm4-flip-card" type="button" aria-pressed="false" aria-label="Flip Adagio description card">
            <span class="bpm4-flip-inner">
              <span class="bpm4-flip-face bpm4-flip-front"><img src="${A}/digital/Description Card_01.svg" alt="Adagio description card front"></span>
              <span class="bpm4-flip-face bpm4-flip-back"><img src="${A}/digital/Description Card Refinement2.png" alt="Adagio description card back"></span>
            </span>
          </button>
          <button class="bpm4-flip-card" type="button" aria-pressed="false" aria-label="Flip Moderato description card">
            <span class="bpm4-flip-inner">
              <span class="bpm4-flip-face bpm4-flip-front"><img src="${A}/digital/Description Card_02.svg" alt="Moderato description card front"></span>
              <span class="bpm4-flip-face bpm4-flip-back"><img src="${A}/digital/Description Card Refinement4.png" alt="Moderato description card back"></span>
            </span>
          </button>
          <button class="bpm4-flip-card" type="button" aria-pressed="false" aria-label="Flip Presto description card">
            <span class="bpm4-flip-inner">
              <span class="bpm4-flip-face bpm4-flip-front"><img src="${A}/digital/Description Card_03.svg" alt="Presto description card front"></span>
              <span class="bpm4-flip-face bpm4-flip-back"><img src="${A}/digital/Description Card Refinement6.png" alt="Presto description card back"></span>
            </span>
          </button>
        </div>
      </div>

      <div class="bpm4-merch-flow" aria-label="60 BPM paper and printed merchandise">
        <div class="bpm4-merch-flow-track">
          ${["1","6","2","11","10","8","7","9","12","1","6","2","11","10","8","7","9","12"].map((n,i)=>`<img src="${A}/merch/merch_${n}.jpg" alt="${i<9?`60 BPM printed merchandise ${n}`:""}" ${i>=9?'aria-hidden="true"':''} loading="lazy">`).join("")}
        </div>
      </div>

      <div class="shell">
        <div class="bpm4-bags-subsection">
          <div class="bpm4-subhead"><h3>Coffee bags + carry bags</h3></div>
          <div class="bpm4-mockup-layout">
            <div class="coffee-row">
              ${pic("mockup/Coffee Bag PSD Mockup black Adagio.jpg","Adagio coffee bag")}
              ${pic("mockup/Coffee Bag PSD Mockup black moderato.jpg","Moderato coffee bag")}
              ${pic("mockup/Coffee Bag PSD Mockup black.jpg","Presto coffee bag")}
            </div>
            <div class="bag-row">
              <div class="tote-stack">
                ${pic("mockup/Canvas Tote Bag Mockup 1.jpg","60 BPM canvas tote bag")}
                ${pic("mockup/Canvas Tote Bag Mockup white.jpg","White 60 BPM canvas tote bag")}
              </div>
              <div class="shopping-bag">
                ${pic("mockup/Shopping Paper Bag PSD Mockup.jpg","60 BPM shopping paper bag")}
              </div>
            </div>
          </div>
        </div>

        <div class="bpm4-merch-full">
          ${pic("merch/merch_5.jpg","60 BPM menu and identity applications")}
        </div>
      </div>
    </section>

    <section class="bpm4-campaign" id="bpm4-7">
      <div class="shell">
        <div class="bpm4-head"><span>07 — Campaign posters</span><p>Three character-led posters extend the slower-tempo language into direct campaign messages.</p></div>
        <div class="bpm4-posters">
          <div>${pic("digital/POSTER_01_A4_P.png","More Espresso campaign poster")}</div>
          <div>${pic("digital/POSTER_02_A4_P.png","Yes Desserts campaign poster")}</div>
          <div>${pic("digital/STAND POSTER_A4_P.png","60 BPM standing campaign poster")}</div>
        </div>
      </div>
    </section>

    <section class="bpm4-digital" id="bpm4-8">
      <div class="shell">
        <div class="bpm4-head light"><span>08 — Interactive website</span><p>Dagee becomes an icebreaker and “mind teller”, translating the same tone into a lightweight mobile interaction.</p></div>
      </div>
      <div class="bpm4-phone-field">
        <div class="bpm4-phone-track" id="bpm4-track">
          ${["WEB_60 BPM_INTRO.svg","WEB_60 BPM_CHAT-1.svg","WEB_60 BPM_CHAT-2.svg","WEB_60 BPM_CHAT-3.svg","WEB_60 BPM_CHAT-4.svg","WEB_60 BPM_CHAT.svg","WEB_60 BPM_INTRO.svg","WEB_60 BPM_CHAT-1.svg","WEB_60 BPM_CHAT-2.svg","WEB_60 BPM_CHAT-3.svg","WEB_60 BPM_CHAT-4.svg","WEB_60 BPM_CHAT.svg"].map((f,i)=>`<div class="phone" ${i>=6?'aria-hidden="true"':''}><img src="${A}/website/${f}" alt="${i<6?`60 BPM mobile interface screen ${i+1}`:""}" loading="lazy"></div>`).join("")}
        </div>
      </div>
      <div class="shell bpm4-digital-note"><p>Visitors move from the introduction into a short emotional check-in and receive suggestions connected to menu choices and ways to rest.</p></div>
    </section>

    <section class="bpm4-finale" aria-label="60 BPM closing statement">
      <img class="bpm4-finale-bg" src="${A}/merch/merch_4.jpg" alt="60 BPM final branded merchandise and café application">
      <img class="bpm4-finale-logo" src="${A}/svg/Secondary Logo 4.svg" alt="60 BPM secondary logo 4">
    </section>

    <a class="next-project bpm4-next" href="/work/${next.slug}/"><span class="meta-mono">Next project</span><br>${esc(next.title)} →</a>
  </article>`;

  document.body.insertAdjacentHTML("beforeend",footer());

  const progress=document.querySelector("#progress");
  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const rail=[...document.querySelectorAll(".bpm4-rail a")];
  const sections=rail.map(a=>document.querySelector(a.getAttribute("href")));
  const tip=document.querySelector("#bpm4-tip");
  rail.forEach(a=>{
    a.addEventListener("mouseenter",()=>{tip.textContent=a.dataset.label;tip.classList.add("show")});
    a.addEventListener("mouseleave",()=>tip.classList.remove("show"));
  });
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const i=sections.indexOf(e.target);
      rail.forEach((a,j)=>a.classList.toggle("active",i===j));
    }
  }),{rootMargin:"-42% 0px -48% 0px"});
  sections.forEach(s=>obs.observe(s));

  const flipCards=[...document.querySelectorAll(".bpm4-flip-card")];
  flipCards.forEach(card=>{
    let locked=false;
    const setFlip=(on)=>{
      card.classList.toggle("is-flipped",on);
      card.setAttribute("aria-pressed",on?"true":"false");
    };
    card.addEventListener("click",()=>{
      locked=!locked;
      setFlip(locked);
    });
    if(matchMedia("(hover:hover) and (pointer:fine)").matches){
      card.addEventListener("mouseenter",()=>{ if(!locked) setFlip(true); });
      card.addEventListener("mouseleave",()=>{ if(!locked) setFlip(false); });
    }
  });

  const gradientSection=document.querySelector(".bpm4-gradients");
  if(gradientSection){
    const gio=new IntersectionObserver(([entry])=>{
      gradientSection.classList.toggle("is-offscreen",!entry.isIntersecting);
    },{rootMargin:"100px"});
    gio.observe(gradientSection);
  }

  const track=document.querySelector("#bpm4-track");
  if(track && innerWidth>768 && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    let x=0,raf;
    const move=()=>{
      x-=.62;
      const half=track.scrollWidth/2;
      if(-x>=half)x=0;
      track.style.transform=`translate3d(${x}px,0,0)`;
      raf=requestAnimationFrame(move);
    };
    raf=requestAnimationFrame(move);
    track.addEventListener("mouseenter",()=>cancelAnimationFrame(raf));
    track.addEventListener("mouseleave",()=>raf=requestAnimationFrame(move));
  }

  const cards=[...document.querySelectorAll(".dagee-card")];
  if(cards.length && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    cards.forEach((card,i)=>{
      card.animate(
        [{transform:"translateY(0) rotate(0deg)"},{transform:`translateY(-10px) rotate(${i?1.4:-1.4}deg)`},{transform:"translateY(0) rotate(0deg)"}],
        {duration:3200+i*500,iterations:Infinity,easing:"ease-in-out"}
      );
    });
  }
}


async function renderProject(){
  const projects=await getProjects();
  const slug=location.pathname.split("/").filter(Boolean).pop();
  const p=projects.find(x=>x.slug===slug);
  if(!p){
    document.body.innerHTML="<main class='shell section'><h1>Project not found.</h1><a href='/work/'>Back to work</a></main>";
    return;
  }

  if(p.slug==="60-bpm"){ render60BPM(p,projects); return; }

  document.body.classList.add("compact-brand");
  document.documentElement.style.setProperty("--project-accent",p.accent);
  document.documentElement.style.setProperty("--project-secondary",p.secondary);
  document.title=`${p.title} — Iris Wang`;
  document.body.insertAdjacentHTML("afterbegin",header()+`<div class="reading-progress" id="progress"></div>`);

  const next=projects[(projects.indexOf(p)+1)%projects.length];
  const meta=projectMeta(p);
  const theme=p.theme==="dark"?"theme-dark":"theme-light";

  const flow=p.sections.map((s,i)=>{
    const mode=flowModes[i%flowModes.length];
    return `<section class="flow-item ${mode}" id="section-${i+1}">
      <div class="flow-copy">
        <span class="flow-label">${String(i+1).padStart(2,"0")} / ${esc(s[0])}</span>
        <p>${esc(s[1])}</p>
      </div>
      <div class="flow-media">${media(p,mediaLabel(s[0],i))}</div>
    </section>`;
  }).join("");

  document.querySelector("#project-root").innerHTML=`
    <article class="project-page ${theme} p-${p.slug}">
      <header class="project-hero shell">
        <div class="project-kicker meta-mono"><span>${p.number} / 11</span><span>${esc(shortStatus(p.status))}</span></div>
        <h1>${esc(p.title)}</h1>
        <p class="project-summary-big">${esc(p.summary)}</p>
        <div class="meta-grid">${meta.map(m=>`<div class="meta-item"><b>${m[0]}</b><span>${esc(m[1])}</span></div>`).join("")}</div>
        <div class="hero-media">${media(p,"hero media — asset to confirm")}</div>
      </header>
      <section class="demonstrates"><div class="inner"><span class="meta-mono">What this demonstrates</span><p>${esc(p.demonstrates)}</p></div></section>
      <div class="shell case-flow">${flow}</div>
      ${createChapterRail(p)}
      <a class="next-project" href="/work/${next.slug}/"><span class="meta-mono">Next</span><br>${esc(next.title)} →</a>
    </article>`;

  document.body.insertAdjacentHTML("beforeend",footer());
  const prog=document.querySelector("#progress");
  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    prog.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});
  setupChapterRail();
}

function renderAbout(){
  document.body.insertAdjacentHTML("afterbegin",header());
  document.body.insertAdjacentHTML("beforeend",footer());
}

document.addEventListener("DOMContentLoaded",()=>{
  const page=document.body.dataset.page;
  if(page==="home")renderHome().catch(console.error);
  if(page==="work")renderWork().catch(console.error);
  if(page==="project")renderProject().catch(console.error);
  if(page==="about")renderAbout();
});
