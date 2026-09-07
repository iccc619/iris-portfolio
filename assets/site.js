
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
  const frame=(name,alt="Realm app interface")=>img(`app/App Frames/${name}`,alt,"er-phone-img");
  const next=projects[(projects.indexOf(p)+1)%projects.length];

  const members=[
    ["AeRi","Leader · Lead Rapper","Daffodil","character/aeri.png","character/aeri_intro.svg"],
    ["Lin","Main Vocalist","Lavender","character/lin.png","character/lin_intro.svg"],
    ["Shira","Main Rapper","Cherry Pink","character/shira.png","character/shira_intro.svg"],
    ["JinSoo","Main Dancer","Sky Blue","character/jinsoo.png","character/jinsoo_intro.svg"],
    ["Navi","Center · Visual","Silver","character/navi.png","character/navi_intro.svg"]
  ];
  const appFrames=[
    "APP_ETH_RR_ForYou.png","APP_ETH_RealsRealm_Realm.png","APP_ETH_Shop_Photocards.png",
    "APP_ETH_Shop_Product_PC.png","APP_ETH_Shop_ShoppingCart.png","APP_ETH_Album_Home.png",
    "APP_ETH_Album_Cards_01.png","APP_ETH_Album_Player.png","APP_ETH_Profile_Posts.png"
  ];

  document.body.classList.add("compact-brand","project-ethereal");
  document.documentElement.style.setProperty("--project-accent","#6044FF");
  document.title="EtheReal / Realm — Iris Wang";
  document.body.insertAdjacentHTML("afterbegin",header()+`<div class="reading-progress er-progress" id="progress"></div>`);

  document.querySelector("#project-root").innerHTML=`
  <article class="er">
    <nav class="er-rail" aria-label="EtheReal sections">
      ${["World","Identity","Members","Album","Campaign","Realm","UX","Interface","Prototype"].map((x,i)=>`<a href="#er-${i+1}" data-label="${x}"><i></i><span>${String(i+1).padStart(2,"0")}</span></a>`).join("")}
    </nav>

    <section class="er-hero" id="er-1">
      ${img("svg/hero.svg","EtheReal identity hero","er-hero-art")}
      <div class="er-hero-glow"></div>
      <div class="shell er-hero-copy">
        <span class="er-meta">Brand identity · AI-assisted art direction · UI/UX · 2024</span>
        <h1>ETHEREAL</h1>
        <p>A virtual K-pop girl group living entirely in a pixelated world — and Realm, the digital home built to bring that world closer to its fandom.</p>
        <div class="er-hero-tags"><span>Branding</span><span>Art Direction</span><span>App Design</span><span>Promotion</span></div>
      </div>
    </section>

    <section class="er-intro" id="er-2">
      <div class="shell er-intro-grid">
        <div>
          <span class="er-meta">02 — Brand world</span>
          <h2>Between the screen<br>and reality.</h2>
        </div>
        <div class="er-intro-copy">
          <p>EtheReal is a K-pop virtual girl group produced by RR Official. Five members exist only in the digital world, each with distinct personalities, talents and cultural backgrounds.</p>
          <p>The identity uses pixelation, brackets and a star-like favicon to frame EtheReal as a world outside reality: brief, luminous appearances that disappear when the screen turns off.</p>
          <p class="er-ai-note"><b>AI-assisted image making</b><br>Character and atmospheric static imagery were generated with AI as part of the world-building process. Identity systems, compositions, Realm UX/UI and promotional materials were designed and developed by Iris Wang.</p>
        </div>
      </div>

      <div class="er-type-band">
        <div class="shell">
          <div class="er-type-row"><span>Pixeloid Sans</span><strong class="er-pixel">ETHEREAL</strong><small>Brand display</small></div>
          <div class="er-type-row"><span>TT Octosquares</span><strong class="er-octo">ELECTRONIC BUTTERFLY</strong><small>Album display</small></div>
        </div>
      </div>

      <div class="shell er-colours">
        <div style="--c:#1B03A3"><b>Neon Blue</b><span>#1B03A3</span></div>
        <div style="--c:#01060A"><b>Ultra Black</b><span>#01060A</span></div>
        <div style="--c:#7DF9FF"><b>Electric Blue</b><span>#7DF9FF</span></div>
        <div style="--c:#FF7AAD"><b>Butterfly Pink</b><span>#FF7AAD</span></div>
      </div>
    </section>

    <section class="er-members" id="er-3">
      <div class="shell">
        <div class="er-head"><span class="er-meta">03 — Members</span><h2>Five signals.<br>One realm.</h2></div>
        <div class="er-member-grid">
          ${members.map((m,i)=>`<article class="er-member" style="--i:${i}">
            <div class="er-member-portrait">${img(m[3],`${m[0]} character`)}</div>
            <div class="er-member-name">${img(m[4],`${m[0]} name graphic`)}</div>
            <div class="er-member-meta"><b>${m[0]}</b><span>${m[1]}</span><em>${m[2]}</em></div>
          </article>`).join("")}
        </div>
      </div>
    </section>

    <section class="er-album" id="er-4">
      <div class="shell er-album-copy">
        <span class="er-meta">04 — 1st Mini Album</span>
        ${img("svg/electronic butterfly.svg","Electronic Butterfly title","er-album-logo")}
        <p>The album concept comes from the Chinese term “电子蝴蝶”: electronic butterflies whose wings are heart-stirring on screen, yet become untouchable once the device is switched off — as if the dream ends.</p>
      </div>
      <div class="er-static-strip">
        ${[1,2,3,4,5,6].map((n,i)=>img(`ai statics/static_${n}.${n===1?"png":"jpg"}`,`AI-assisted EtheReal atmosphere ${n}`,i%2?"er-static-tall":"")).join("")}
      </div>
      <div class="shell er-album-mockups">
        ${["Album Mockup Dark Op1.png","Album Mockup Dark Op2.png","Album Mockup Light Op1.png","Album Mockup Light Op2.png"].map(f=>img(`promotion/${f}`,"Electronic Butterfly album mockup")).join("")}
      </div>
    </section>

    <section class="er-campaign" id="er-5">
      <div class="shell">
        <div class="er-head"><span class="er-meta">05 — Promotion system</span><h2>Designed to<br>appear everywhere.</h2></div>
        <div class="er-tracklist">
          ${["Launch Tracklist_1080x1080.png","Launch Tracklist_1080x10802.png","Launch Tracklist_1080x10803.png","Launch Tracklist_1080x10804.png"].map(f=>img(`promotion/${f}`,"Electronic Butterfly track list")).join("")}
        </div>
        <div class="er-social-grid">
          <div class="wide">${img("promotion/YT Banner.png","EtheReal YouTube banner")}</div>
          ${["IG Profile-01.png","IG Profile-02.png","IG Profile-03.png","Instagram Post_Debut Live Show_03.png","Instagram Post_Promotion Schedule_02.png","YT Highlight Medley Thumbnail.png"].map(f=>img(`promotion/${f}`,"EtheReal promotional design")).join("")}
        </div>
      </div>
      <div class="er-video-band">
        <video autoplay muted loop playsinline preload="metadata"><source src="${A}/web-video/Highlight%20Medley.mp4" type="video/mp4"></video>
        <div class="shell"><span>Highlight Medley / moving identity</span></div>
      </div>
    </section>

    <section class="er-realm" id="er-6">
      <div class="shell er-realm-intro">
        <div>
          <span class="er-meta">06 — Realm App</span>
          ${img("svg/Realm App.svg","Realm app logo","er-realm-logo")}
        </div>
        <div>
          <h2>The ultimate home<br>for the fans.</h2>
          <p>Realm brings EtheReal’s social posts, merchandise, album collection and artist-to-fan communication into one mobile experience. It is designed for fans who want an immediate, deeper connection to the group and to one another.</p>
        </div>
      </div>
      <div class="er-app-marquee" aria-label="Realm final interface preview">
        <div class="er-app-track">
          ${[...appFrames,...appFrames].map((f,i)=>`<div class="er-phone" ${i>=appFrames.length?'aria-hidden="true"':''}>${frame(f)}</div>`).join("")}
        </div>
      </div>
    </section>

    <section class="er-ux" id="er-7">
      <div class="shell">
        <div class="er-head er-head-ux"><span class="er-meta">07 — UX process</span><h2>From fandom needs<br>to a connected system.</h2></div>
        <div class="er-persona">
          <div class="er-persona-title"><span>Target audience</span><strong>HAZEL, REALS</strong><small>21 · Seoul · University student</small></div>
          <div class="er-persona-copy"><p>A new K-pop fan fascinated by EtheReal who wants immediate updates, access to member content, live interaction, albums and collectible cards — without fragmenting the experience across multiple platforms.</p></div>
          <div class="er-needs"><span>Updates immediately</span><span>Member materials</span><span>Chat + live</span><span>Albums + cards</span></div>
        </div>

        <div class="er-ia">
          <span class="er-meta">Information architecture</span>
          <div class="er-ia-root">HOME</div>
          <div class="er-ia-line"></div>
          <div class="er-ia-nodes"><span>REAL'S REALM<br><small>Social community</small></span><span>SHOP<br><small>Merchandise</small></span><span>ALBUM<br><small>Music + cards</small></span><span>CHAT<br><small>Message + live</small></span><span>PROFILE<br><small>ReaLv + settings</small></span></div>
        </div>

        <div class="er-wireframe">
          <div class="er-wire-copy"><span class="er-meta">Wireframe → final UI</span><h3>Home as a living dashboard.</h3><p>News, check-in, schedule and shortcuts establish the home screen as the app’s daily entry point. The structure then expands into community, commerce, collection and direct communication.</p></div>
          <div class="er-wire-visual">
            <div class="er-wire-phone"><span>9:41</span><i></i><i></i><i></i><i></i><b>HOME / WIREFRAME</b></div>
            <div class="er-arrow">→</div>
            <div class="er-final-phone">${frame("APP_ETH_RR_ForYou.png","Realm final social interface")}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="er-interface" id="er-8">
      <div class="shell">
        <div class="er-head"><span class="er-meta">08 — Interface flows</span><h2>One app.<br>Multiple relationships.</h2></div>
        <div class="er-flow er-flow-social">
          <div class="er-flow-copy"><b>01 / Social community</b><h3>Realm + For You</h3><p>Member posts and fan posts coexist in a social feed, with comments and translation supporting an international fandom.</p></div>
          <div class="er-flow-phones">${frame("APP_ETH_RealsRealm_Realm.png")}${frame("APP_ETH_RR_ForYou.png")}${frame("APP_ETH_Profile_Comments.png")}</div>
        </div>
        <div class="er-flow er-flow-shop">
          <div class="er-flow-copy"><b>02 / Shopping flow</b><h3>Discover → product → cart → order</h3><p>Merchandise, albums and photo cards move through a connected purchasing flow with order-state feedback.</p></div>
          <div class="er-flow-phones">${frame("APP_ETH_Shop_Photocards.png")}${frame("APP_ETH_Shop_Product_PC.png")}${frame("APP_ETH_Shop_ShoppingCart.png")}${frame("APP_ETH_Shop_MyOrders.png")}</div>
        </div>
        <div class="er-flow er-flow-album">
          <div class="er-flow-copy"><b>03 / Album collection</b><h3>Music becomes collectible.</h3><p>Album playback, music video and digital photo cards extend the release beyond a conventional streaming screen.</p></div>
          <div class="er-flow-phones">${frame("APP_ETH_Album_Home.png")}${frame("APP_ETH_Album_Cards_01.png")}${frame("APP_ETH_Album_Cards_03.png")}${frame("APP_ETH_Album_Player.png")}</div>
        </div>
        <div class="er-flow er-flow-profile">
          <div class="er-flow-copy"><b>04 / Profile + ReaLv</b><h3>Participation has a visible rhythm.</h3><p>ReaLv reflects purchase and app activity, while profile settings, posts and comments give fans a persistent identity inside the community.</p></div>
          <div class="er-flow-phones">${frame("APP_ETH_Profile_Posts.png")}${frame("APP_ETH_Profile_Comments.png")}${frame("APP_ETH_Profile_Settings.png")}</div>
        </div>
      </div>
    </section>

    <section class="er-prototype" id="er-9">
      <div class="shell er-prototype-copy">
        <span class="er-meta">09 — Final prototype</span>
        <h2>A complete route<br>through Realm.</h2>
        <p>The final prototype links onboarding and the home experience to social community, shop, album, communication and profile flows — demonstrating the app as one connected fan ecosystem rather than a set of isolated screens.</p>
        <a class="er-proto-link" href="https://www.figma.com/proto/d1Gr3gDRCKigTX1UVpodvi/ETHEREAL-Branding-2024--Community-?node-id=1593-54443&t=fZNlTHgpmb8kezNI-1" target="_blank" rel="noreferrer">Open interactive prototype ↗</a>
      </div>
      <div class="er-prototype-stage">
        ${frame("APP_ETH_RR_ForYou.png")}${frame("APP_ETH_Shop_Product_PC.png")}${frame("APP_ETH_Album_Player.png")}${frame("APP_ETH_Profile_Posts.png")}
      </div>
    </section>

    <section class="er-finale">
      <video autoplay muted loop playsinline preload="metadata"><source src="${A}/web-video/Digit%20Wings.mp4" type="video/mp4"></video>
      <div class="er-finale-shade"></div>
      <div class="shell"><span>WHEN THE SCREEN GOES DARK,</span><strong>THE DREAM DISAPPEARS.</strong></div>
    </section>

    <a class="next-project er-next" href="/work/${next.slug}/"><span class="meta-mono">Next project</span><br>${esc(next.title)} →</a>
  </article>`;

  document.body.insertAdjacentHTML("beforeend",footer());
  const progress=document.querySelector("#progress");
  addEventListener("scroll",()=>{
    const h=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=`${h?scrollY/h*100:0}%`;
  },{passive:true});

  const rail=[...document.querySelectorAll(".er-rail a")];
  const sections=rail.map(a=>document.querySelector(a.getAttribute("href")));
  const obs=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const i=sections.indexOf(e.target);
      rail.forEach((a,j)=>a.classList.toggle("active",i===j));
    }
  }),{rootMargin:"-42% 0px -48% 0px"});
  sections.forEach(s=>s&&obs.observe(s));

  const track=document.querySelector(".er-app-track");
  if(track && innerWidth>760 && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    let x=0,raf,paused=false;
    const move=()=>{
      if(!paused){
        x-=.45;
        const half=track.scrollWidth/2;
        if(-x>=half)x=0;
        track.style.transform=`translate3d(${x}px,0,0)`;
      }
      raf=requestAnimationFrame(move);
    };
    raf=requestAnimationFrame(move);
    track.addEventListener("mouseenter",()=>paused=true);
    track.addEventListener("mouseleave",()=>paused=false);
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
  if(p.slug==="ethereal-realm"){ renderEtherealRealm(p,projects); return; }

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
