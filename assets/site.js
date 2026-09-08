
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




function renderEtherealRealm(p,projects){
  const A="/public/projects/ethereal-realm";
  const enc=s=>s.split("/").map(encodeURIComponent).join("/");
  const img=(src,alt,cls="")=>`<img class="${cls}" src="${A}/${enc(src)}" alt="${esc(alt)}" loading="lazy">`;
  const frame=(name,alt="Realm app interface",cls="")=>img(`app/App Frames/${name}`,alt,`er2-phone-img ${cls}`);
  const homeAsset=(candidates,alt,cls="")=>{
    const urls=candidates.map(s=>`${A}/${enc(`app/homepage/${s}`)}`);
    const fallback=`${A}/${enc("app/App Frames/APP_ETH_RR_ForYou.png")}`;
    const first=urls.shift()||fallback;
    const list=[...urls,fallback].map(u=>u.replace(/"/g,"&quot;")).join("|");
    return `<img class="${cls}" src="${first}" data-fallbacks="${list}" alt="${esc(alt)}" loading="lazy">`;
  };
  const appFolderImg=(folder,name,alt,cls="")=>img(`app/${folder}/${name}`,alt,cls);
  const flowFrames=(folder,names,altPrefix="Realm app flow")=>names.map((name,i)=>appFolderImg(folder,name,`${altPrefix} ${i+1}`,"er4-flow-frame")).join("");
  const svgAsset=(candidates,alt,cls="")=>{
    const urls=candidates.map(s=>`${A}/${enc(`svg/${s}`)}`);
    const first=urls.shift()||"";
    const list=urls.map(u=>u.replace(/"/g,"&quot;")).join("|");
    return `<img class="${cls}" src="${first}" data-fallbacks="${list}" alt="${esc(alt)}" loading="lazy">`;
  };
  const next=projects[(projects.indexOf(p)+1)%projects.length];

  const members=[
    {n:"AeRi",native:"『애리』",role:"Leader · Lead Rapper",dob:"15 Mar 2004",mbti:"INFP",nationality:"Korean",colour:"Daffodil",emojiSvg:"AeRi.svg",interest:"Visual arts · graphic design · virtual fashion",fact:"Has a dog named Hima.",img:"aeri.png",intro:"aeri_intro.svg",swatch:"#ECEBB8"},
    {n:"Lin",native:"『시림 / 施霖』",role:"Main Vocalist",dob:"05 May 2004",mbti:"INFJ",nationality:"Chinese",colour:"Lavender",emojiSvg:"Lin.svg",interest:"Photography · guitar",fact:"Loves lavender scent, ice cream and rainy days.",img:"lin.png",intro:"lin_intro.svg",swatch:"#C4ADEB"},
    {n:"Shira",native:"『시라 / 白姫』",role:"Main Rapper",dob:"10 Aug 2004",mbti:"ESFP",nationality:"Japanese",colour:"Cherry Pink",emojiSvg:"Shira.svg",interest:"Video games · films",fact:"Enjoys watching cooking videos.",img:"shira.png",intro:"shira_intro.svg",swatch:"#FFCAE9"},
    {n:"JinSoo",native:"『진수』",role:"Main Dancer",dob:"22 Oct 2004",mbti:"ENTP",nationality:"Korean",colour:"Sky Blue",emojiSvg:"JinSoo.svg",interest:"Swimming · gymnastics",fact:"Confident, passionate and competitive.",img:"jinsoo.png",intro:"jinsoo_intro.svg",swatch:"#C2FCFF"},
    {n:"Navi",native:"『나비 / 娜比 / ナビ』",role:"Center · Visual",dob:"Debut date",mbti:"INTJ",nationality:"Virtual",colour:"Silver",emojiSvg:"Navi.svg",interest:"Composing · writing beats",fact:"Speaks three languages and has high affinity.",img:"navi.png",intro:"navi_intro.svg",swatch:"#C6C5C6"}
  ];

  document.body.classList.add("compact-brand","project-ethereal","ethereal-v2","ethereal-v3","ethereal-v4","ethereal-v5","ethereal-v6","ethereal-v7");
  document.documentElement.style.setProperty("--project-accent","#6044FF");
  document.title="EtheReal / Realm — Iris Wang";
  document.body.insertAdjacentHTML("afterbegin",header()+`<div class="reading-progress er2-progress" id="progress"></div>`);

  document.querySelector("#project-root").innerHTML=`
  <article class="er2">
    <nav class="er2-rail" aria-label="EtheReal sections">
      ${["World","Identity","Members","Album","Campaign","Realm","System","Flows","Prototype"].map((x,i)=>`<a href="#er2-${i+1}" aria-label="${x}"><i></i><span>${String(i+1).padStart(2,"0")}</span></a>`).join("")}
    </nav>

    <section class="er2-hero" id="er2-1">
      ${img("svg/hero.svg","EtheReal pixel identity graphic","er2-hero-art")}
      <div class="er2-hero-overlay"></div>
      <div class="shell er2-hero-inner">
        <div class="er2-kicker">Brand identity · AI-assisted art direction · UI/UX · 2024</div>
        <h1 class="er2-pixel">ETHEREAL</h1>
        <div class="er2-hero-lower">
          <p>A virtual K-pop girl group living entirely in a pixelated world — and Realm, the digital home built to bring that world closer to its fandom.</p>
        </div>
      </div>
    </section>

    <section class="er2-world" id="er2-2">
      <div class="shell er2-world-grid">
        <div class="er2-heading-block">
          <span class="er2-label">02 — Brand world</span>
          ${img("svg/hero.svg","EtheReal hero identity mark","er5-world-hero")}
        </div>
        <div class="er2-world-copy">
          <p>EtheReal is a K-pop virtual girl group produced by RR Official. Five members appear only in the digital world, each with distinct personalities, specialties and cultural backgrounds.</p>
          <p>The logo uses pixelation and enclosing brackets to suggest another world outside reality. A pixelated star becomes the main favicon — a reference to the glow of idols and the brief illumination of a screen.</p>
          <aside><b>AI-assisted image making</b><span>Character and atmospheric static imagery were generated with AI as part of the visual world-building process. The brand identity, graphic system, Realm UI/UX, compositions and promotional material were designed and developed by Iris Wang.</span></aside>
        </div>
      </div>

      <div class="er2-identity shell">
        <div class="er2-type-card">
          <span>Pixeloid Sans Bold</span>
          <strong class="er2-pixel">ETHEREAL</strong>
          <em>Brand / logo display</em>
        </div>
        <div class="er2-type-card">
          <span>TT Octosquares Trl Cnd XBd</span>
          <strong class="er2-octo">ELECTRONIC BUTTERFLY</strong>
          <em>Album display</em>
        </div>
      </div>

      <div class="shell er5-colour-svg-display">
        ${svgAsset(["colour_01.svg","Colour_01.svg","colour 01.svg"],"EtheReal brand colour system 01","er5-colour-svg")}
        ${svgAsset(["colour_02.svg","Colour_02.svg","colour 02.svg"],"EtheReal brand colour system 02","er5-colour-svg")}
      </div>
    </section>

    <section class="er2-members" id="er2-3">
      <div class="shell">
        <div class="er2-section-head">
          <span class="er2-label">03 — Members</span>
          <h2>Five signals. One realm.</h2>
          <p>EtheReal is composed of five members from multicultural backgrounds, one of whom is fully virtual. Hover or focus a member to reveal the profile system.</p>
        </div>
        <div class="er2-member-grid">
          ${members.map((m,i)=>`<article class="er2-member" tabindex="0" style="--member:${m.swatch}">
            <div class="er2-member-image">${img(`character/${m.img}`,`${m.n} character`)}</div>
            <div class="er2-member-basic"><div><b>${m.n} <small>${m.native}</small></b><span>${m.role}</span><i>${m.colour}</i></div>${img(`svg/${m.emojiSvg}`,`${m.n} pixel symbol`,"er3-member-emoji")}</div>
            <div class="er2-member-detail"><span><b>Birthday</b>${m.dob}</span><span><b>MBTI</b>${m.mbti}</span><span><b>Nationality</b>${m.nationality}</span><span><b>Interest</b>${m.interest}</span><span class="wide"><b>Fun fact</b>${m.fact}</span></div>
          </article>`).join("")}
        </div>
        <div class="er2-member-colours">${members.map(m=>`<div style="--member:${m.swatch}"><span>${m.n}</span><i></i><b>${m.colour}</b></div>`).join("")}</div>
      </div>
    </section>

    <section class="er2-album" id="er2-4">
      <div class="shell er2-album-intro er3-album-intro">
        <span class="er2-label">04 — 1st Mini Album</span>
        ${img("svg/electronic butterfly.svg","Electronic Butterfly","er2-album-logo")}
        <p>The central concept of Electronic Butterfly stems from a Chinese term “电子蝴蝶“. It reveals the instantaneous nature of all idols’ appearance, that once the screen is turned off, they are untouchable most of the time. This leads to the main idea of the album that compares EtheReal to electronic butterflies, whose fluttered wings is heart-stirring for all fans, yet can never be found once all phones are shut down, as if the dream ends.</p>
      </div>

      <div class="er2-static-flow" aria-label="AI-assisted visual-world imagery">
        <div class="er2-static-track">
          ${[1,2,3,4,5,6,1,2,3,4,5,6].map((n,i)=>img(`ai statics/static_${n}.${n===1?"png":"jpg"}`,`Electronic Butterfly visual ${n}`,i>=6?"dup":"")).join("")}
        </div>
      </div>

      <div class="shell er2-album-outcomes">
        <div class="er2-subhead"><span>Album applications</span><p>Dark-version packaging is shown as the resolved album family.</p></div>
        <div class="er2-album-pair">
          ${img("promotion/Album Mockup Dark Op1.png","Electronic Butterfly dark album mockup option 1")}
          ${img("promotion/Album Mockup Dark Op2.png","Electronic Butterfly dark album mockup option 2")}
        </div>
      </div>
    </section>

    <section class="er2-campaign" id="er2-5">
      <div class="shell">
        <div class="er2-section-head">
          <span class="er2-label">05 — Promotion system</span>
          <h2>Welcome to EtheReal's Realm!</h2>
          <p>The campaign translates the pixel-and-butterfly system across track-list graphics, social media, YouTube, teasers and launch communication.</p>
        </div>
        <div class="er2-youtube">
          <div><span class="er2-label">YouTube channel</span><h3>EtheReal on YouTube</h3></div>
          <a href="https://www.youtube.com/@EtheReal-itsreal" target="_blank" rel="noreferrer">Visit @EtheReal-itsreal ↗</a>
        </div>
      </div>

      <div class="er2-motion-pair shell">
        <figure><video autoplay muted loop playsinline preload="metadata"><source src="${A}/web-video/Logo_1.mp4" type="video/mp4"></video><figcaption>Logo motion</figcaption></figure>
        <figure><video autoplay muted loop playsinline preload="metadata"><source src="${A}/web-video/Date_1.mp4" type="video/mp4"></video><figcaption>Date / launch motion</figcaption></figure>
      </div>
    </section>

    <section class="er2-realm" id="er2-6">
      <div class="shell er2-realm-header">
        <div class="er2-realm-brand">
          ${img("app/App Icon.png","Realm app icon")}
          <div><span class="er2-label">06 — Realm App</span><strong class="er2-pixel">REALM</strong></div>
        </div>
        <div><h2>The ultimate home for the fans.</h2><p>Realm gathers social posts, merchandise, album collection and artist-to-fan communication into one mobile experience. Unlike a single-purpose fan network, the concept connects fan community, member interaction, commerce and collection inside one branded system.</p></div>
      </div>

      
    </section>

    <section class="er2-system er3-system" id="er2-7">
      <div class="er3-dark-process">
        <div class="shell">
          <div class="er2-app-colour er5-app-colour er6-app-colour">
            <span class="er2-label">App colour</span>

            <div class="er6-app-colour-svg">
              ${svgAsset(
                [
                  "app colour.svg",
                  "App Colour.svg",
                  "app_colour.svg",
                  "App_Colour.svg"
                ],
                "Realm app colour system",
                "er6-app-colour-img"
              )}
            </div>
          </div>

          <div class="er2-ia">
            <span class="er2-label">Information architecture</span>
            <div class="root">HOME</div><div class="stem"></div>
            <div class="nodes"><div><b>REAL'S REALM</b><small>Social community</small></div><div><b>SHOP</b><small>Merchandise</small></div><div><b>ALBUM</b><small>Music + cards</small></div><div><b>CHAT</b><small>Message + live</small></div><div><b>PROFILE</b><small>ReaLv + settings</small></div></div>
          </div>

          <div class="shell er5-navigation er6-navigation er7-navigation">

      <div class="er5-nav-copy">
        <span class="er2-label">Navigation</span>
        

        <p>
          Five persistent destinations create a consistent navigation
          system across Realm, connecting community, shopping, albums,
          EtheReal and the user's profile.
        </p>
      </div>

      <div class="er8-nav-showcase">

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/rrealm_white.svg","Realm navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/rrealm.svg","Realm navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>RRealm</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/shop_white.svg","Shop navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/shop.svg","Shop navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>Shop</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/album_white.svg","Album navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/album.svg","Album navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>Album</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/erealM_white.svg","EtheReal navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/erealM.svg","EtheReal navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>ERealM</span>
        </div>

        <div class="er8-nav-item">
          <div class="er8-nav-icon-wrap">
            ${img("svg/profile_white.svg","Profile navigation default","er8-nav-icon er8-nav-default")}
            ${img("svg/profile.svg","Profile navigation hover","er8-nav-icon er8-nav-hover")}
          </div>
          <span>Profile</span>
        </div>

      </div>

    </div>

    </div>

    <div class="shell er3-homepage er5-homepage er6-homepage">
            <div class="er5-home-title">
              <span class="er2-label">Home page</span>
              
            </div>

            <div class="er6-home-diagram">

              <div class="er6-info-box er6-wireframe-label">
                Wireframe
              </div>

              <div class="er6-home-phone">
                ${appFolderImg(
                  "homepage",
                  "APP_ETH_Home_01.png",
                  "Realm home wireframe",
                  "er6-home-img"
                )}
              </div>

              <div class="er6-home-arrow">→</div>

              <div class="er6-home-phone">
                ${appFolderImg(
                  "homepage",
                  "APP_ETH_Home.png",
                  "Realm home interface",
                  "er6-home-img"
                )}
              </div>

              <div class="er6-home-actions">
                <div class="er6-info-box">
                  <b>Swipe</b>
                  <small>To next panel</small>
                </div>

                <div class="er6-info-box">
                  <b>Click</b>
                  <small>To check in</small>
                </div>
              </div>

              <div class="er6-home-phone">
                ${appFolderImg(
                  "homepage",
                  "APP_ETH_Home-1.png",
                  "Realm checked state",
                  "er6-home-img"
                )}
              </div>

              <div class="er6-home-features">
                <div class="er6-info-box">
                  <b>Chat box</b>
                  <small>A shortcut to Message page</small>
                </div>

                <div class="er6-info-box">
                  <b>Information Panel</b>
                  <small>Latest news updated for users</small>
                </div>

                <div class="er6-info-box">
                  <b>D-day</b>
                  <small>Count of checked days</small>
                </div>

                <div class="er6-info-box">
                  <b>Schedule</b>
                  <small>EtheReal's daily activities</small>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="er2-flows" id="er2-8">
      <div class="shell">
        <div class="er2-section-head">
          <span class="er2-label">08 — Interface flows</span>
          <h2>One app. Multiple relationships.</h2>
          <p>Final frames are grouped by task so the progression from feed interaction to commerce, collection and profile management remains visible.</p>
        </div>

        <article class="er2-flow">
          <div class="copy"><span>01 / Social community</span><h3>Realm + For You</h3><p>Fans posts, member posts and personalised content sit inside the same community system, supported by comments and translation.</p><b>Feed → post → comments</b></div>
          <div class="phones">${frame("APP_ETH_RealsRealm_Realm.png")}${frame("APP_ETH_RR_ForYou.png")}${frame("APP_ETH_Profile_Comments.png")}</div>
        </article>

        <article class="er2-flow">
          <div class="copy"><span>02 / Shopping flow</span><h3>Discover → product → cart → order</h3><p>Merchandise, albums and photo cards use a connected purchase path with visible order-state feedback.</p><b>Browse → detail → checkout → order state</b></div>
          <div class="phones four">${frame("APP_ETH_Shop_Photocards.png")}${frame("APP_ETH_Shop_Product_PC.png")}${frame("APP_ETH_Shop_ShoppingCart.png")}${frame("APP_ETH_Shop_MyOrders.png")}</div>
        </article>

        <article class="er2-flow">
          <div class="copy"><span>03 / Album collection</span><h3>Music becomes collectible.</h3><p>Playback, music video and digital photo cards extend the mini album beyond conventional streaming.</p><b>Album → cards → flip state → player</b></div>
          <div class="phones four">${frame("APP_ETH_Album_Home.png")}${frame("APP_ETH_Album_Cards_01.png")}${frame("APP_ETH_Album_Cards_03.png")}${frame("APP_ETH_Album_Player.png")}</div>
        </article>

        <article class="er2-flow">
          <div class="copy"><span>04 / Profile + ReaLv</span><h3>Participation has a visible rhythm.</h3><p>ReaLv represents purchase and app activity, while posts, comments and settings give each fan a persistent identity.</p><b>Profile → comments → settings</b></div>
          <div class="phones">${frame("APP_ETH_Profile_Posts.png")}${frame("APP_ETH_Profile_Comments.png")}${frame("APP_ETH_Profile_Settings.png")}</div>
        </article>

        <article class="er2-flow er6-realm-flow">
          <div class="copy">
            <span>05 / Realm communication</span>

            <h3>
              Messages, subscription and live.
            </h3>

            <p>
              Realm extends the fan relationship through member profiles,
              subscription states, direct chat and live communication.
            </p>
          </div>

          <div class="phones er6-realm-flow-phones">

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_01.png",
              "Realm communication frame 1",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_02.png",
              "Realm communication frame 2",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_Chat_02.png",
              "Realm chat interface",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_Chat_Navi.png",
              "Navi chat interface",
              "er4-flow-frame"
            )}

            ${appFolderImg(
              "realm flow",
              "APP_ETH_ER_Chat_Live.png",
              "Realm live interface",
              "er4-flow-frame"
            )}

          </div>
        </article>
      </div>
    </section>

    <section class="er2-prototype er3-prototype" id="er2-9">
      <div class="shell er2-proto-copy">
        <span class="er2-label">09 — Final prototype</span>
        <h2>A complete route through Realm.</h2>
        <p>The final prototype links onboarding and home to community, shop, album, communication and profile flows as one connected fan ecosystem.</p>
        <a href="https://www.figma.com/proto/d1Gr3gDRCKigTX1UVpodvi/ETHEREAL-Branding-2024--Community-?node-id=1593-54443&t=fZNlTHgpmb8kezNI-1" target="_blank" rel="noreferrer">Open interactive prototype ↗</a>
      </div>
            </div>
    

      <div class="shell er7-prototype-animation">

        <div class="er7-prototype-animation-heading">
          
          
        </div>

        <div class="er7-animation-track">

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Intro.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Login.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Home.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Profile_Posts.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_ER_Chat_Navi.png",
            "Realm prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_EtheRealRealm_Sub.png",
            "Realm subscription prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Album_Cards_02.png",
            "Realm album prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Album_Player.png",
            "Realm album player prototype frame",
            "er7-animation-frame"
          )}

          ${appFolderImg(
            "animation flow_01",
            "APP_ETH_Shop_Album.png",
            "Realm shop prototype frame",
            "er7-animation-frame"
          )}

        </div>

      </div>

    </section>

    <section class="er2-finale">
      <div class="er2-finale-bg">${img("pattern/Screenshot 2024-07-16 at 5.10.44 pm 3.jpeg","EtheReal pattern artwork")}</div>
      <div class="shell er-final-background"><span>WHEN THE SCREEN GOES DARK</span><strong>THE DREAM<br>DISAPPEARS.</strong></div>
    </section>

    <a class="next-project er2-next" href="/work/${next.slug}/"><span class="meta-mono">Next project</span><br>${esc(next.title)} →</a>
  </article>`;

  document.body.insertAdjacentHTML("beforeend",footer());

  const progress=document.querySelector("#progress");
  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const rail=[...document.querySelectorAll(".er2-rail a")];
  const sections=rail.map(a=>document.querySelector(a.getAttribute("href")));
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const i=sections.indexOf(e.target);
      rail.forEach((a,j)=>a.classList.toggle("active",i===j));
    }
  }),{rootMargin:"-42% 0px -48% 0px"});
  sections.forEach(s=>s&&obs.observe(s));

  const staticTrack=document.querySelector(".er2-static-track");
  if(staticTrack && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    let x=0,paused=false;
    const tick=()=>{
      if(!paused){
        x-=.35;
        const half=staticTrack.scrollWidth/2;
        if(-x>=half)x=0;
        staticTrack.style.transform=`translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(tick);
    };
    staticTrack.addEventListener("mouseenter",()=>paused=true);
    staticTrack.addEventListener("mouseleave",()=>paused=false);
    requestAnimationFrame(tick);
  }


  document.querySelectorAll("img[data-fallbacks]").forEach(el=>{
    const fallbacks=(el.dataset.fallbacks||"").split("|").filter(Boolean);
    el.addEventListener("error",()=>{
      const next=fallbacks.shift();
      if(next){ el.dataset.fallbacks=fallbacks.join("|"); el.src=next; }
    });
  });

  const startLoop=(track,speed=.38)=>{
    if(!track || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x=0,paused=false;
    const tick=()=>{
      if(!paused){
        x-=speed;
        const half=track.scrollWidth/2;
        if(half && -x>=half)x=0;
        track.style.transform=`translate3d(${x}px,0,0)`;
      }
      requestAnimationFrame(tick);
    };
    track.addEventListener("mouseenter",()=>paused=true);
    track.addEventListener("mouseleave",()=>paused=false);
    requestAnimationFrame(tick);
  };
  startLoop(document.querySelector(".er3-realm-track"),.42);
  

  document.querySelectorAll(".er2-motion-pair video").forEach(v=>{
    v.muted=true;
    const tryPlay=()=>v.play().catch(()=>{});
    v.addEventListener("canplay",tryPlay,{once:true});
    tryPlay();
  });
}



function renderGreenGridV1(p,projects){
  const A="/public/projects/green-grid";
  const enc=s=>s.split("/").map(encodeURIComponent).join("/");
  const img=(path,alt="",cls="")=>`<img class="${cls}" src="${A}/${enc(path)}" alt="${esc(alt)}" loading="lazy">`;
  const phone=(name,alt)=>img(`app frame/${name}`,alt,"gg-phone");
  const next=projects[(projects.indexOf(p)+1)%projects.length];

  document.body.classList.add("compact-brand","project-green-grid","gg-v1");
  document.documentElement.style.setProperty("--project-accent","#DAE436");
  document.documentElement.style.setProperty("--project-secondary","#6C4BFF");
  document.title="Green Grid — Iris Wang";

  document.body.insertAdjacentHTML(
    "afterbegin",
    header()+`<div class="reading-progress" id="progress"></div>`
  );

  document.querySelector("#project-root").innerHTML=`
  <article class="gg-case">

    <nav class="gg-rail" aria-label="Green Grid chapters">
      ${[
        "Overview",
        "Research",
        "Synthesis",
        "Product logic",
        "Paper prototype",
        "Evaluation",
        "Iteration",
        "Final flows",
        "Reflection"
      ].map((x,i)=>`
        <a href="#gg-${i+1}" aria-label="${x}">
          <i></i><span>${String(i+1).padStart(2,"0")}</span>
        </a>
      `).join("")}
    </nav>

    <!-- ==================================================
         01 HERO / OVERVIEW
         ================================================== -->

    <section class="gg-hero" id="gg-1">
      <div class="shell gg-hero-grid">

        <div class="gg-hero-copy">
          <div class="gg-hero-kicker">
      <span>UI/UX · RESEARCH · PRODUCT DESIGN</span>
      <span>2025</span>
    </div>

          <h1>GREEN<br>GRID</h1>

          <p class="gg-lead">
            A research-led mobile product for community-garden members,
            designed to support plot management, plant knowledge,
            coordination and social connection.
          </p>

          <div class="gg-meta">
            <div>
              <b>Context</b>
              <span>Academic · Team of 4</span>
            </div>

            <div>
              <b>Role</b>
              <span>Design + prototyping, research synthesis, personas and user-flow contribution</span>
            </div>

            <div>
              <b>Tools</b>
              <span>Figma · FigJam · Photoshop</span>
            </div>

            <div>
              <b>Year</b>
              <span>2025</span>
            </div>
          </div>
        </div>

        <div class="gg-hero-mark">
          ${img("App Icon.svg","Green Grid app icon","gg-app-icon")}
          <div class="gg-hero-word">
            <span>GREEN</span>
            <span>GRID</span>
          </div>
        </div>

      </div>

      <div class="shell gg-phone-hero">
        ${phone("APP_CG_Home.png","Green Grid home screen")}
        ${phone("APP_CG_Map.png","Green Grid garden map")}
        ${phone("APP_CG_Community.png","Green Grid community screen")}
      </div>
    </section>


    <!-- ==================================================
         02 RESEARCH QUESTION + ROLE
         ================================================== -->

    <section class="gg-research" id="gg-2">
      <div class="shell">

        <span class="gg-label">02 — RESEARCH QUESTION</span>

        <blockquote class="gg-question">
          How might digital tools support organisation,
          information sharing and social cohesion within
          community gardens?
        </blockquote>

        <div class="gg-scope-grid">

          <div class="gg-scope-intro">
            <h2>Start with people,<br>not screens.</h2>

            <p>
              The team investigated how gardeners participate, coordinate
              voluntary work and look for plant information before defining
              the final feature set.
            </p>
          </div>

          <div class="gg-role-card">
            <span>IRIS'S CONTRIBUTION</span>

            <ul>
              <li>Helped construct the semi-structured interview flow.</li>
              <li>Asked follow-up questions during an interview.</li>
              <li>Colour-coded and reviewed interview material.</li>
              <li>Identified recurring themes across transcripts.</li>
              <li>Helped consolidate findings into two personas.</li>
              <li>Designed the persona template in Figma.</li>
              <li>Mapped app functions, pages and user pathways.</li>
              <li>Translated requirements into interface concepts.</li>
              <li>Contributed to prototype design and linking.</li>
            </ul>
          </div>

        </div>

      </div>
    </section>


    <!-- ==================================================
         03 SYNTHESIS
         ================================================== -->

    <section class="gg-synthesis" id="gg-3">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">03 — SYNTHESIS</span>
          <h2>Patterns emerged across the interviews.</h2>
        </div>

        <div class="gg-synthesis-board">

          <section class="gg-synth-column">
            <h3>Motivations</h3>

            <div class="gg-synth-notes">
              <article class="gg-note note-yellow">
                <p>Reasons for growing plants</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-mint">
                <p>Views and experiences of community gardening and co-planting</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-white">
                <p>Helping others or receiving help with plant care</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-grey">
                <p>Struggles, deterrents and reflections on joining community gardens</p>
                <small>Interview synthesis</small>
              </article>
            </div>
          </section>

          <section class="gg-synth-column">
            <h3>Coordination</h3>

            <div class="gg-synth-notes">
              <article class="gg-note note-purple">
                <p>Techniques and approaches used to organise group work</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-green">
                <p>Features that remind members about tasks and responsibilities</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-blue">
                <p>Applications already used to organise group work</p>
                <small>Interview synthesis</small>
              </article>
            </div>
          </section>

          <section class="gg-synth-column">
            <h3>Information Sharing</h3>

            <div class="gg-synth-notes">
              <article class="gg-note note-pink">
                <p>Information people need or seek regarding plants</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-orange">
                <p>Perceived reasons for plant death or harm</p>
                <small>Interview synthesis</small>
              </article>

              <article class="gg-note note-coral">
                <p>How participants currently seek information about plants</p>
                <small>Interview synthesis</small>
              </article>
            </div>
          </section>

        </div>

        <div class="gg-synthesis-outcome">
          <span>RESEARCH SYNTHESIS</span>
          <p>
            These themes reframed the app around three connected needs:
            managing shared responsibilities, finding relevant plant knowledge,
            and maintaining communication within the garden community.
          </p>
        </div>

      </div>
    </section>


    <!-- ==================================================
         04 PRODUCT LOGIC
         ================================================== -->

    <section class="gg-product-logic" id="gg-4">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">04 — PRODUCT LOGIC</span>
          <h2>A garden is both a place<br>and a social system.</h2>
        </div>

        <div class="gg-feature-map">

          <article>
            <b>MAP</b>
            <span>Find plots</span>
            <span>See ownership</span>
            <span>Apply for space</span>
          </article>

          <article>
            <b>PLOTS</b>
            <span>Add plants</span>
            <span>Track current plants</span>
            <span>Manage available space</span>
          </article>

          <article>
            <b>PLANT INFO</b>
            <span>Soil pH</span>
            <span>Seasonal guidance</span>
            <span>Plant records</span>
          </article>

          <article>
            <b>COMMUNITY</b>
            <span>Share updates</span>
            <span>Like + comment</span>
            <span>Garden announcements</span>
          </article>

          <article>
            <b>CHAT</b>
            <span>Private messages</span>
            <span>Share a plot</span>
            <span>Share a plant</span>
          </article>

          <article>
            <b>PROFILE</b>
            <span>Current plants</span>
            <span>Past plants</span>
            <span>Settings</span>
          </article>

        </div>

        <div class="gg-hive-note">
          <div class="gg-hive-shape">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          </div>

          <p>
            The identity compares the community to a beehive:
            individual members maintain their own responsibilities
            while contributing to the health of a larger shared system.
          </p>
        </div>

      </div>
    </section>


    <!-- ==================================================
         05 PAPER PROTOTYPE
         ================================================== -->

    
    
    <section class="gg-personas" id="gg-personas">
      <div class="shell">

        <div class="gg-section-head gg-persona-intro">
          <span class="gg-label">04 — PERSONAS</span>

          <h2>Different gardeners,<br>shared infrastructure.</h2>

          <p>
            Interview findings were consolidated into two contrasting user
            profiles. Rather than treating the personas as finished artefacts,
            they are presented here as design inputs that helped define what
            Green Grid needed to support.
          </p>
        </div>


        <div class="gg-persona-system">

          <!-- TOBY -->
          <article class="gg-persona-row">

            <div class="gg-persona-identity">

              <div class="gg-persona-name">
                <span>01</span>
                <h3>Toby</h3>
              </div>

              <dl>
                <div>
                  <dt>Age</dt>
                  <dd>19</dd>
                </div>

                <div>
                  <dt>Location</dt>
                  <dd>Melbourne CBD</dd>
                </div>

                <div>
                  <dt>Occupation</dt>
                  <dd>University student</dd>
                </div>
              </dl>
            </div>


            <div class="gg-persona-story">
              <span class="gg-persona-eyebrow">PROFILE</span>

              <p class="gg-persona-summary">
                A young urban resident interested in locally growing fruit,
                but constrained by apartment living, limited cultivation
                space and the demands of university life.
              </p>

              <blockquote>
                “I’d love to have a garden space of my own, imagine there
                I can actually grow and eat the fruit I’ve nurtured myself.”
              </blockquote>

              <div class="gg-persona-signals">
                <div>
                  <span>Garden knowledge</span>
                  <b><i style="--level:41%"></i></b>
                </div>

                <div>
                  <span>Food sustainability</span>
                  <b><i style="--level:82%"></i></b>
                </div>

                <div>
                  <span>Social belonging</span>
                  <b><i style="--level:66%"></i></b>
                </div>
              </div>
            </div>


            <div class="gg-persona-needs">

              <section>
                <span>FRICTION</span>

                <p>Limited access to suitable urban growing space.</p>
                <p>Plant information can be difficult to retrieve quickly.</p>
                <p>Care routines compete with study and examination periods.</p>
              </section>

              <section>
                <span>NEEDS</span>

                <p>Scheduling and plant-care reminders.</p>
                <p>Guidance appropriate to urban growing conditions.</p>
                <p>A simple path from information to practical action.</p>
              </section>

            </div>

            <section class="gg-persona-design-response gg-persona-response-wide">
              <span>DESIGN RESPONSE</span>

              <strong>
                Make garden space, plant knowledge and reminders accessible
                through one connected system.
              </strong>
            </section>

          </article>


          <!-- VERONICA -->
          <article class="gg-persona-row">

            <div class="gg-persona-identity">

              <div class="gg-persona-name">
                <span>02</span>
                <h3>Veronica</h3>
              </div>

              <dl>
                <div>
                  <dt>Age</dt>
                  <dd>56</dd>
                </div>

                <div>
                  <dt>Location</dt>
                  <dd>East Malvern, Victoria</dd>
                </div>

                <div>
                  <dt>Occupation</dt>
                  <dd>English teacher</dd>
                </div>
              </dl>
            </div>


            <div class="gg-persona-story">
              <span class="gg-persona-eyebrow">PROFILE</span>

              <p class="gg-persona-summary">
                An experienced home gardener who values the wellbeing,
                knowledge-sharing and shared responsibility that can emerge
                through communal gardening.
              </p>

              <blockquote>
                “Apart from being able to harvest and eat some of them,
                seeing the growth process itself is also meaningful and
                enjoyable to me.”
              </blockquote>

              <div class="gg-persona-signals">
                <div>
                  <span>Garden knowledge</span>
                  <b><i style="--level:79%"></i></b>
                </div>

                <div>
                  <span>Food sustainability</span>
                  <b><i style="--level:76%"></i></b>
                </div>

                <div>
                  <span>Social belonging</span>
                  <b><i style="--level:35%"></i></b>
                </div>
              </div>
            </div>


            <div class="gg-persona-needs">

              <section>
                <span>FRICTION</span>

                <p>Professional gardening knowledge is not always accessible.</p>
                <p>Plant maintenance requires ongoing monitoring.</p>
                <p>Workdays limit the time available for garden care.</p>
              </section>

              <section>
                <span>NEEDS</span>

                <p>Reliable gardening advice and plant information.</p>
                <p>A community space for exchanging experience.</p>
                <p>Notifications relevant to plants and climate.</p>
              </section>

            </div>

            <section class="gg-persona-design-response gg-persona-response-wide">
              <span>DESIGN RESPONSE</span>

              <strong>
                Support experienced gardeners with useful information,
                communication and lightweight monitoring tools.
              </strong>
            </section>

          </article>

        </div>

      </div>
    </section>

<section class="gg-paper" id="gg-5">

      <div class="gg-paper-reference shell">

        <div class="gg-paper-section-head">
          <span class="gg-label">05 — PAPER PROTOTYPE</span>
        </div>

        <div class="gg-paper-reference-row">

          <div class="gg-sketch-phone">
            <div class="gg-sketch-tabs">
              <span>Community</span><span>Chat</span>
            </div>
            <div class="gg-sketch-user"></div>
            <i class="gg-sketch-line long"></i>
            <i class="gg-sketch-line mid"></i>

            <div class="gg-sketch-photo-row">
              <b></b><b></b><b></b>
            </div>

            <div class="gg-sketch-actions">♡ No.　○ No.</div>

            <div class="gg-sketch-user small"></div>
            <i class="gg-sketch-line long"></i>
            <i class="gg-sketch-line mid"></i>

            <div class="gg-sketch-nav">⌂　◇　◯　♙</div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-sketch-tabs">
              <span>Community</span><span class="under">Chat</span>
            </div>

            <div class="gg-chat-list">
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
              <div><i></i><span>Name<br><small>Text</small></span><b>Date</b></div>
            </div>

            <div class="gg-sketch-nav">⌂　◇　◯　♙</div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-message-head">‹ Name　⋮</div>

            <div class="gg-message-flow">
              <p class="left"></p>
              <p class="right short"></p>
              <span>Time</span>
              <p class="left tiny"></p>
              <p class="left"></p>
              <span>Time</span>
              <p class="right long"></p>
              <p class="right mid"></p>
              <p class="right short"></p>
            </div>

            <div class="gg-message-tools">
              <i></i><i></i><i></i><i></i>
            </div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-message-head">‹ Name　◉</div>

            <div class="gg-message-flow">
              <span>Time</span>
              <p class="left tiny"></p>
              <p class="left short"></p>
              <span>Time</span>
              <p class="right long"></p>
              <p class="right mid"></p>
              <p class="right short"></p>
            </div>

            <div class="gg-shared-plot">
              <b></b>
              <span>Plot Name<br><small>Description</small></span>
            </div>

            <div class="gg-message-tools compact">
              <i></i><i></i>
            </div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-profile-banner"></div>

            <div class="gg-profile-avatar"></div>

            <div class="gg-month-strip">
              <span>Sep 2025</span>
              <div>○ ○ ○ ○ ○ ○ ○</div>
            </div>

            <small class="gg-history-label">Plant History</small>

            <div class="gg-honey-grid">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>

            <div class="gg-sketch-nav">⌂　◇　◯　♙</div>
          </div>


          <div class="gg-sketch-phone">
            <div class="gg-message-head">‹ Plot</div>

            <div class="gg-search-bar">⌕ Search plants...</div>

            <div class="gg-plot-list">
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
              <div><i></i><span>Plot Name<br><small>Description</small></span></div>
            </div>
          </div>

        </div>

      </div>

    </section>


    <!-- ==================================================
         06 USABILITY TESTING
         ================================================== -->

    <section class="gg-testing" id="gg-6">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">06 — USABILITY EVALUATION</span>
          <h2>Eight participants.<br>Two kinds of evidence.</h2>
        </div>

        <div class="gg-test-grid">

          <article class="gg-test-type">
            <span>QUANTITATIVE</span>

            <p>
              Participants completed structured navigation and task prompts
              across home, map, chat and profile functions.
            </p>

            <div class="gg-task-list">
              <b>Example tasks</b>
              <span>Navigate to the garden map</span>
              <span>Apply for an unowned plot</span>
              <span>Add a carrot plant</span>
              <span>Check soil pH guidance</span>
              <span>Check the latest message</span>
              <span>Change profile settings</span>
            </div>
          </article>

          <article class="gg-test-type">
            <span>QUALITATIVE</span>

            <p>
              Open-ended prompts were used to understand first impressions,
              navigation logic and how participants interpreted key features.
            </p>

            <div class="gg-task-list">
              <b>Example prompts</b>
              <span>First impression of the homepage</span>
              <span>Review promotional events</span>
              <span>Inspect current plot plants</span>
              <span>Remove a harvested plant</span>
              <span>Like and comment on a post</span>
              <span>Share a plant through chat</span>
            </div>
          </article>

        </div>

        
        <div class="gg-participants">
          <span class="gg-mini-title">EVALUATION PARTICIPANTS</span>

          <div class="gg-participant-grid">
            ${[
              ["01","27","PhD student"],
              ["02","19","Undergraduate"],
              ["03","50","Human resources"],
              ["04","27","PhD student"],
              ["05","19","Undergraduate"],
              ["06","23","Postgraduate"],
              ["07","18","Undergraduate"],
              ["08","19","Undergraduate"]
            ].map(x=>`
              <div>
                <b>${x[0]}</b>
                <span>${x[1]} yrs</span>
                <small>${x[2]}</small>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="gg-findings">

          <article class="positive">
            <span>WHAT WORKED</span>

            <ul>
              <li>Pages had clear individual purposes.</li>
              <li>Simple actions could be completed quickly.</li>
              <li>The overall structure felt logical once understood.</li>
              <li>Participants liked the organisation of garden plots.</li>
              <li>The overall garden-management concept was valued.</li>
            </ul>
          </article>

          <article class="negative">
            <span>FRICTION FOUND</span>

            <ul>
              <li>Homepage information density felt overwhelming.</li>
              <li>Some arrows were unclear or non-functional.</li>
              <li>The community like button was poorly positioned.</li>
              <li>Owned and unowned plots were difficult to distinguish.</li>
              <li>Plot-application feedback lacked clarity.</li>
              <li>Banner arrows disappeared against imagery.</li>
            </ul>
          </article>

        </div>

      </div>
    </section>


    <!-- ==================================================
         07 ITERATION
         ================================================== -->

    <section class="gg-iteration" id="gg-7">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">07 — EVIDENCE-LED ITERATION</span>
          <h2>Findings became<br>interface changes.</h2>
        </div>

        <div class="gg-change-list">

          ${[
            ["01","Homepage density",
             "Removed the latest-message panel, Today’s Progress and What’s New; weather advice became a compact expandable strip."],

            ["02","Plot ownership",
             "Added the user’s profile image to owned plots and changed unowned plots to a lighter grey."],

            ["03","Application feedback",
             "Expanded the confirmation state to explain that further information would arrive by email within seven days."],

            ["04","Banner visibility",
             "Added a vignette behind navigation arrows so controls remain visible across promotional imagery."],

            ["05","Plant history",
             "Separated current and previous plants using darker grey treatment and a dashed divider."],

            ["06","Community actions",
             "Removed the duplicated like button beside the comment-entry field."],

            ["07","Interaction cues",
             "Used purple selectively for selected states and controls requiring stronger clickability."]
          ].map(x=>`
            <article>
              <span>${x[0]}</span>
              <h3>${x[1]}</h3>
              <p>${x[2]}</p>
            </article>
          `).join("")}

        </div>

      </div>
    </section>


    <!-- ==================================================
         08 FINAL FLOWS
         ================================================== -->

    <section class="gg-final" id="gg-8">
      <div class="shell">

        <div class="gg-section-head">
          <span class="gg-label">08 — FINAL PRODUCT</span>
          <h2>Research resolved<br>into connected flows.</h2>
        </div>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>01 / GARDEN MAP</span>
            <h3>Find, understand and apply.</h3>
            <p>
              The map distinguishes garden plots and supports the transition
              from viewing available space to submitting an application.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Map.png","Garden map")}
            ${phone("APP_CG_Map_Apply.png","Plot application")}
            ${phone("APP_CG_Map_Application Sent.png","Plot application confirmation")}
          </div>
        </article>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>02 / PLANT MANAGEMENT</span>
            <h3>Knowledge in context.</h3>
            <p>
              Plant records combine plot management with soil-pH guidance,
              planting information and ongoing garden care.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Map_AddPlant.png","Add plant")}
            ${phone("APP_CG_plant_info.png","Plant information")}
            ${phone("APP_CG_plant_PH.png","Plant soil pH information")}
          </div>
        </article>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>03 / COMMUNITY</span>
            <h3>Share knowledge publicly.</h3>
            <p>
              The community feed supports garden updates, posts,
              comments and peer-to-peer knowledge sharing.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Community.png","Community feed")}
            ${phone("APP_CG_Community_Post.png","Community post")}
            ${phone("APP_CG_Community_Comment.png","Community comments")}
          </div>
        </article>

        <article class="gg-flow">
          <div class="gg-flow-copy">
            <span>04 / CHAT + PROFILE</span>
            <h3>Coordinate privately.</h3>
            <p>
              Direct messaging supports plot and plant references while
              profiles preserve each member’s personal garden history.
            </p>
          </div>

          <div class="gg-flow-phones">
            ${phone("APP_CG_Chat.png","Green Grid chat")}
            ${img("app frame/APP_CG_Chat page.png","Green Grid chat page","gg-phone")}
            ${phone("APP_CG_Profile_MyPlants.png","Profile plant gallery")}
          </div>
        </article>

      </div>
    </section>


    <!-- ==================================================
         09 REFLECTION
         ================================================== -->

    <section class="gg-reflection" id="gg-9">
      <div class="shell gg-reflection-final">

        <div class="gg-reflection-brand">
          <span class="gg-label">09 — REFLECTION</span>

          ${img("green grid.svg","Green Grid","gg-final-logo")}
        </div>

        <div class="gg-reflection-copy">

          <p class="gg-reflection-lead">
            Green Grid demonstrates a complete research-to-iteration loop:
            qualitative evidence informed the product structure, usability
            testing exposed friction, and the final interface changed in
            response to those findings.
          </p>

          <div class="gg-limitations">
            <span>Future considerations</span>
            <p>Configurable garden maps for different sites.</p>
            <p>Clearer non-colour ownership labels and accessibility support.</p>
            <p>Help content for users with lower digital confidence.</p>
            <p>Privacy, moderation and transparent plot-allocation systems.</p>
          </div>

          <a class="gg-proto-link"
             href="https://www.figma.com/proto/GbshUdcmS4aRtFtdbxM3d7/Community-Garden?node-id=199-864&starting-point-node-id=199%3A864"
             target="_blank"
             rel="noreferrer">
            Open Figma prototype ↗
          </a>

        </div>

      </div>
    </section>

    <a class="next-project gg-next" href="/work/${next.slug}/">
      <span class="meta-mono">Next project</span><br>
      ${esc(next.title)} →
    </a>

  </article>
  `;

  document.body.insertAdjacentHTML("beforeend",footer());

  const progress=document.querySelector("#progress");

  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const links=[...document.querySelectorAll(".gg-rail a")];
  const sections=links.map(a=>document.querySelector(a.getAttribute("href")));

  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const i=sections.indexOf(entry.target);
        links.forEach((a,j)=>a.classList.toggle("active",i===j));
      }
    });
  },{rootMargin:"-42% 0px -48% 0px"});

  sections.forEach(s=>s&&io.observe(s));
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
  if(p.slug==="ethereal-realm"){ renderEtherealRealm(p,projects); return; }
  if(p.slug==="green-grid"){ renderGreenGridV1(p,projects); return; }

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
