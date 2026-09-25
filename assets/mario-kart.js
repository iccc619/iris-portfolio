/* =========================================================
   MARIO KART 8 DELUXE
   Focused portfolio case study
   ========================================================= */

window.renderMarioKart = function renderMarioKart(p, projects){

  const A =
    sitePath("/public/projects/mario-kart");

  const asset =
    file => `${A}/${file}`;


  const img = (
    file,
    alt = "",
    cls = ""
  ) => `
    <img
      class="${cls}"
      src="${asset(file)}"
      alt="${esc(alt)}"
      loading="lazy"
      decoding="async">
  `;


  const video = (
    file,
    label,
    cls = ""
  ) => `
    <video
      class="${cls}"
      src="${asset(file)}"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      aria-label="${esc(label)}">
    </video>
  `;


  const currentIndex =
    projects.findIndex(
      project =>
        project.slug === p.slug
    );


  const next =
    projects[
      (currentIndex + 1) %
      projects.length
    ];


  document.body.classList.add(
    "compact-brand",
    "project-mario-kart"
  );


  document.documentElement
    .style
    .setProperty(
      "--project-accent",
      "#FFCC00"
    );


  document.title =
    "Mario Kart 8 Deluxe Website — Iris Wang";


  document.body.insertAdjacentHTML(
    "afterbegin",
    header() +
    `<div
       class="reading-progress"
       id="progress">
     </div>`
  );


  document.querySelector(
    "#project-root"
  ).innerHTML = `

    <article class="mk-case">


      <!-- ================================================
           HERO
           ================================================ -->

      <section
        class="mk-hero"
        id="mk-hero"
        data-mk-section>

        <div class="shell mk-hero-inner">


          <div class="mk-hero-meta">

            <span class="meta-mono">
              WEB DESIGN · INTERACTION DESIGN · FRONT-END · ACADEMIC TEAM PROJECT · 2025
            </span>

          </div>


          <div class="mk-hero-main">


            <div class="mk-hero-copy">

              <h1>
                <span>MARIO KART</span>
                <span>8 DELUXE</span>
              </h1>

              <p class="mk-hero-intro">
                A seven-page interactive website built
                with HTML, CSS and vanilla JavaScript.
              </p>

            </div>


            <figure class="mk-hero-art">

              <div class="mk-hero-art-stage">

                ${img(
                  "hero/mariodrift.jpg",
                  "Mario Kart 8 Deluxe drifting scene",
                  "mk-hero-drift"
                )}

              </div>

            </figure>


          </div>


          <div class="mk-hero-bottom">


            <div class="mk-hero-role">

              <span class="meta-mono">
                MY ROLE
              </span>

              <p>
                Team Leader · Homepage Design + Development ·
                Explanation Page · Final CSS / JS Integration
              </p>

            </div>


            <a
              class="mk-hero-scroll"
              href="#mk-live">

              <span class="meta-mono">
                SCROLL TO EXPLORE
              </span>

              <i></i>

            </a>


          </div>


        </div>

      </section>



      <!-- ================================================
           01 LIVE WEBSITE
           ================================================ -->

      <section
        class="mk-live-site"
        id="mk-live"
        data-mk-section>

        <div class="shell">


          <div class="mk-live-head">

            <span class="meta-mono">
              01 — LIVE WEBSITE
            </span>


            <div>

              <h2>
                Explore the
                <span>working homepage.</span>
              </h2>

              <p>
                This is the original homepage I designed
                and developed. The embedded version preserves
                the structure, styling and interaction
                behaviour of the original build.
              </p>

            </div>

          </div>


          <div class="mk-live-browser">

            <div class="mk-browser-bar">

              <div>
                <i></i>
                <i></i>
                <i></i>
              </div>

              <span class="meta-mono">
                ORIGINAL HOMEPAGE / INTERACTIVE BUILD
              </span>

              <a
                href="${A}/live/index.html"
                target="_blank"
                rel="noopener noreferrer">
                OPEN FULL SITE ↗
              </a>

            </div>


            <iframe
              src="${A}/live/index.html"
              title="Interactive Mario Kart homepage"
              loading="lazy">
            </iframe>

          </div>


          <div class="mk-live-caption">

            <span class="meta-mono">
              DESIGNED + DEVELOPED BY IRIS WANG
            </span>

            <p>
              Homepage visual direction, layout,
              interaction and front-end implementation.
            </p>

          </div>


        </div>

      </section>



      <!-- ================================================
           02 HOMEPAGE DESIGN
           ================================================ -->

      <section
      class="mk-resolved-home"
      id="mk-homepage"
      data-mk-section>

      <div class="shell">


        <header class="mk-resolved-head">

          <span class="meta-mono">
            02 — HOMEPAGE DESIGN
          </span>


          <h2>
            The homepage I
            <span>designed and built.</span>
          </h2>


          <p>
            I designed and developed the homepage in full,
            establishing its visual direction, content rhythm
            and interaction language before implementing it
            in HTML, CSS and vanilla JavaScript.
          </p>

        </header>



        <div class="mk-resolved-layout">


          <!-- ============================================
               LEFT — ORIGINAL HOMEPAGE
               ============================================ -->

          <figure class="mk-resolved-left">

            <div class="mk-resolved-homepage">

              ${img(
                "hero/homepage-source.png",
                "Original Mario Kart homepage designed and developed by Iris Wang",
                "mk-resolved-homepage-image"
              )}

            </div>


            <figcaption>

              <span class="meta-mono">
                01 / HOMEPAGE SYSTEM
              </span>

              <p>
                Character scale, dark space and strong focal
                hierarchy establish the experience from the
                opening screen.
              </p>

            </figcaption>

          </figure>



          <!-- ============================================
               RIGHT
               ============================================ -->

          <div class="mk-resolved-right">


            <figure class="mk-resolved-card">

              <div class="mk-resolved-media">

                ${video(
                  "homepage/intro.mp4",
                  "Motion sequence from the original Mario Kart homepage",
                  "mk-resolved-motion"
                )}

              </div>


              <figcaption>

                <span class="meta-mono">
                  02 / MOTION
                </span>

                <p>
                  Animated transitions create pacing
                  between homepage sections.
                </p>

              </figcaption>

            </figure>



            <figure
              class="mk-resolved-card"
              data-resolved-equipment>

              <div class="mk-resolved-media mk-resolved-equipment">

                <img
                  class="mk-resolved-equipment-image"
                  src="${A}/homepage/switch.jpg"
                  alt="Nintendo Switch">


                <button
                  class="mk-resolved-arrow mk-resolved-prev"
                  type="button"
                  aria-label="Previous equipment">
                  ←
                </button>


                <button
                  class="mk-resolved-arrow mk-resolved-next"
                  type="button"
                  aria-label="Next equipment">
                  →
                </button>


                <div class="mk-resolved-equipment-label">

                  <span
                    class="meta-mono
                           mk-resolved-count">
                    01 / 03
                  </span>

                  <strong class="mk-resolved-name">
                    NINTENDO SWITCH
                  </strong>

                </div>

              </div>


              <figcaption>

                <span class="meta-mono">
                  03 / EQUIPMENT CAROUSEL
                </span>

                <p>
                  Use the arrows to view the three
                  equipment states from the homepage.
                </p>

              </figcaption>

            </figure>


          </div>


        </div>


      </div>

    </section>



      <!-- ================================================
           03 PROCESS
           ================================================ -->

      <section
        class="mk-process"
        id="mk-process"
        data-mk-section>

        <div class="shell">


          <div class="mk-process-head">

            <span class="meta-mono">
              03 — PROCESS
            </span>


            <div>

              <h2>
                From separate ideas
                <span>to one coded system.</span>
              </h2>

              <p>
                My process moved between visual direction,
                page development and team integration:
                designing my assigned pages first, then
                resolving the shared system once the
                separate builds were combined.
              </p>

            </div>

          </div>



          <div class="mk-process-grid">


            <article class="mk-process-step">

              <span class="mk-process-number">
                01
              </span>

              <div>
                <b>DIRECTION</b>

                <h3>
                  Establish the visual language
                </h3>

                <p>
                  Define hierarchy, dark space,
                  image scale, accent colour and
                  motion rhythm.
                </p>
              </div>

            </article>



            <article class="mk-process-step">

              <span class="mk-process-number">
                02
              </span>

              <div>
                <b>BUILD</b>

                <h3>
                  Design directly in code
                </h3>

                <p>
                  Develop the Homepage and
                  Explanation page through
                  HTML, CSS and JavaScript.
                </p>
              </div>

            </article>



            <article class="mk-process-step">

              <span class="mk-process-number">
                03
              </span>

              <div>
                <b>PARALLEL WORK</b>

                <h3>
                  Pages developed separately
                </h3>

                <p>
                  Team members worked on
                  different website areas before
                  the final merge.
                </p>
              </div>

            </article>



            <article class="mk-process-step">

              <span class="mk-process-number">
                04
              </span>

              <div>
                <b>MERGE + TEST</b>

                <h3>
                  Resolve the shared system
                </h3>

                <p>
                  I led the final integration,
                  fixing CSS and JavaScript
                  conflicts across the site.
                </p>
              </div>

            </article>


          </div>


        </div>

      </section>



      <!-- ================================================
           04 EXPLANATION
           ================================================ -->

      <section
      class="mk-s04x"
      id="mk-explanation"
      data-mk-section>

      <div class="shell">


        <!-- ============================================
             HEADER
             ============================================ -->

        <header class="mk-s04x-head">

          <span class="meta-mono">
            04 — EXPLANATION PAGE
          </span>


          <h2>
            Code becomes
            <span>interaction.</span>
          </h2>


          <div class="mk-s04x-intro">

            <p>
              I designed and built the Explanation page
              to connect implementation with its visible
              behaviour.
            </p>


            <a
              class="mk-s04x-link"
              href="${A}/live/explanation.html"
              target="_blank"
              rel="noopener noreferrer">

              <span>VIEW PAGE</span>
              <span>↗</span>

            </a>

          </div>

        </header>



        <!-- ============================================
             EFFECT SWITCHER
             ============================================ -->

        <div
          class="mk-s04x-switcher"
          data-s04-effect-switcher>


          <!-- CONTROLS -->

          <div
            class="mk-s04x-tabs"
            role="tablist"
            aria-label="Interaction examples">


            <button
              class="mk-s04x-tab is-active"
              type="button"
              role="tab"
              aria-selected="true"
              data-effect="character">

              <span>01</span>
              <strong>CHARACTER ENTRANCE</strong>

            </button>


            <button
              class="mk-s04x-tab"
              type="button"
              role="tab"
              aria-selected="false"
              data-effect="glow">

              <span>02</span>
              <strong>GLOW</strong>

            </button>


            <button
              class="mk-s04x-tab"
              type="button"
              role="tab"
              aria-selected="false"
              data-effect="pulse">

              <span>03</span>
              <strong>PULSE</strong>

            </button>


          </div>



          <!-- ACTIVE EFFECT -->

          <div class="mk-s04x-stage">


            <!-- RESULT — DOMINANT -->

            <figure class="mk-s04x-result">

              <div class="mk-s04x-result-media">

                <video
                  class="mk-s04x-result-video"
                  src="${A}/explanation/character-ease.mp4?v=s04-media-v2"
                  autoplay
                  muted
                  loop
                  playsinline>
                </video>

              </div>


              <figcaption>

                <span class="meta-mono">
                  RESULT
                </span>

                <strong class="mk-s04x-active-title">
                  CHARACTER ENTRANCE
                </strong>

              </figcaption>

            </figure>



            <!-- CODE — NARROWER -->

            <figure class="mk-s04x-code">

              <div class="mk-s04x-code-media">

                <img
                  class="mk-s04x-code-image"
                  src="${A}/explanation/code-character-ease.png"
                  alt="CSS code for character entrance effect">

              </div>


              <figcaption>

                <span class="meta-mono">
                  CODE
                </span>

                <span class="mk-s04x-code-type">
                  CSS / KEYFRAMES
                </span>

              </figcaption>

            </figure>


          </div>



          <!-- SINGLE QUIET CAPTION -->

          <div class="mk-s04x-caption">

            <span class="meta-mono mk-s04x-count">
              01 / 03
            </span>


            <p class="mk-s04x-description">
              A CSS keyframe transition brings the character
              into view and creates the page entrance.
            </p>

          </div>


        </div>



        <p class="mk-s04x-note">
          These examples are presented as material from the
          Explanation page. Supporting written content was
          developed collaboratively.
        </p>


      </div>

    </section>



      <!-- ================================================
           05 TEAM INTEGRATION
           ================================================ -->

      <section
      class="mk-s05"
      id="mk-integration"
      data-mk-section>

      <div class="shell">


        <header class="mk-s05-head">

          <span class="meta-mono">
            05 — TEAM INTEGRATION
          </span>


          <h2>
            Four separate builds.
            <span>One working site.</span>
          </h2>


          <p>
            Each team member initially developed their assigned
            pages separately. As team leader, I handled the final
            integration pass when conflicting CSS and JavaScript
            appeared across the combined website.
          </p>

        </header>



        <div class="mk-s05-pages">


          <figure>

            ${img(
              "structure/characters.jpg",
              "Characters page from the Mario Kart website",
              ""
            )}

            <figcaption>
              <span class="meta-mono">
                01
              </span>
              <strong>CHARACTERS</strong>
            </figcaption>

          </figure>


          <figure>

            ${img(
              "structure/courses.webp",
              "Courses page from the Mario Kart website",
              ""
            )}

            <figcaption>
              <span class="meta-mono">
                02
              </span>
              <strong>COURSES</strong>
            </figcaption>

          </figure>


          <figure>

            ${img(
              "structure/items.jpg",
              "Items page from the Mario Kart website",
              ""
            )}

            <figcaption>
              <span class="meta-mono">
                03
              </span>
              <strong>ITEMS</strong>
            </figcaption>

          </figure>


          <figure>

            ${img(
              "structure/battles.jpg",
              "Battles page from the Mario Kart website",
              ""
            )}

            <figcaption>
              <span class="meta-mono">
                04
              </span>
              <strong>BATTLES</strong>
            </figcaption>

          </figure>


        </div>



        <div class="mk-s05-flow">


          <div class="mk-s05-flow-before">

            <span class="meta-mono">
              BEFORE MERGE
            </span>

            <strong>
              04
            </strong>

            <p>
              independently developed
              page systems
            </p>

          </div>


          <span class="mk-s05-arrow">
            →
          </span>


          <div class="mk-s05-flow-role">

            <span class="meta-mono">
              MY ROLE / TEAM LEADER
            </span>

            <div>
              <strong>CSS</strong>
              <strong>JS</strong>
            </div>

            <p>
              Resolve style collisions, shared scripts,
              broken behaviour and inconsistent layout
              across the merged build.
            </p>

          </div>


          <span class="mk-s05-arrow">
            →
          </span>


          <div class="mk-s05-flow-after">

            <span class="meta-mono">
              FINAL SYSTEM
            </span>

            <strong>
              07
            </strong>

            <p>
              connected pages
            </p>

          </div>


        </div>


      </div>

    </section>



      <!-- ================================================
           06 OUTCOME
           ================================================ -->

      <section
      class="mk-s06"
      id="mk-outcome"
      data-mk-section>

      <div class="shell">


        <header class="mk-s06-head">

          <span class="meta-mono">
            06 — OUTCOME
          </span>


          <h2>
            Designing it also meant
            <span>making it work.</span>
          </h2>


          <p>
            Building the homepage and leading the final
            integration made the relationship between
            interface design and front-end behaviour
            much more tangible.
          </p>

        </header>



        <div class="mk-s06-summary">


          <div class="mk-s06-tags">

            <span>
              WEB DESIGN
            </span>

            <span>
              HTML / CSS
            </span>

            <span>
              VANILLA JS
            </span>

            <span>
              TEAM LEADERSHIP
            </span>

          </div>


          <p class="mk-s06-reflection">
            The project strengthened my understanding
            of how visual concepts translate into
            functioning interfaces — where interaction,
            structure and technical constraints become
            part of the design itself.
          </p>


        </div>


        <small class="mk-s06-disclaimer">
          Academic project using Mario Kart 8 Deluxe
          intellectual property. Not affiliated with
          or endorsed by Nintendo.
        </small>


      </div>

    </section>



      <!-- ================================================
           CHAPTER RAIL
           ================================================ -->

      <nav
        class="chapter-rail mk-rail"
        aria-label="Mario Kart project sections">

        <a
          href="#mk-hero"
          data-label="HERO"
          aria-label="Hero">
        </a>

        <a
          href="#mk-live"
          data-label="LIVE WEBSITE"
          aria-label="Live Website">
        </a>

        <a
          href="#mk-homepage"
          data-label="HOMEPAGE"
          aria-label="Homepage">
        </a>

        <a
          href="#mk-process"
          data-label="PROCESS"
          aria-label="Process">
        </a>

        <a
          href="#mk-explanation"
          data-label="EXPLANATION"
          aria-label="Explanation">
        </a>

        <a
          href="#mk-integration"
          data-label="TEAM INTEGRATION"
          aria-label="Team Integration">
        </a>

        <a
          href="#mk-outcome"
          data-label="OUTCOME"
          aria-label="Outcome">
        </a>

      </nav>


      <div
        class="chapter-tip mk-tip"
        id="mk-tip">
      </div>



      <a
        class="next-project mk-next"
        href="${sitePath(`/work/${next.slug}/`)}">

        <span class="meta-mono next-project-label">
          NEXT PROJECT
        </span>

        <span class="next-project-title">
          ${esc(next.title)}
        </span>

        <span class="next-project-arrow">
          →
        </span>

      </a>


    </article>

  `;


  document.body.insertAdjacentHTML(
    "beforeend",
    footer()
  );

  /* ======================================================
     RESOLVED HOMEPAGE EQUIPMENT
     ====================================================== */

  const resolvedEquipmentItems = [
    {
      src: `${A}/homepage/switch.jpg`,
      name: "NINTENDO SWITCH",
      alt: "Nintendo Switch"
    },
    {
      src: `${A}/homepage/joycon.jpg`,
      name: "JOY-CONS",
      alt: "Nintendo Switch Joy-Con controllers"
    },
    {
      src: `${A}/homepage/console.jpg`,
      name: "CONSOLE",
      alt: "Nintendo Switch console"
    }
  ];


  const resolvedEquipment =
    document.querySelector(
      "[data-resolved-equipment]"
    );


  if(resolvedEquipment){

    let equipmentIndex = 0;

    const equipmentImage =
      resolvedEquipment.querySelector(
        ".mk-resolved-equipment-image"
      );

    const equipmentName =
      resolvedEquipment.querySelector(
        ".mk-resolved-name"
      );

    const equipmentCount =
      resolvedEquipment.querySelector(
        ".mk-resolved-count"
      );


    const updateResolvedEquipment = () => {

      const item =
        resolvedEquipmentItems[
          equipmentIndex
        ];

      equipmentImage.classList.add(
        "is-changing"
      );

      window.setTimeout(
        () => {

          equipmentImage.src =
            item.src;

          equipmentImage.alt =
            item.alt;

          equipmentName.textContent =
            item.name;

          equipmentCount.textContent =
            `${String(
              equipmentIndex + 1
            ).padStart(
              2,
              "0"
            )} / 03`;

          equipmentImage.classList.remove(
            "is-changing"
          );

        },
        120
      );

    };


    resolvedEquipment
      .querySelector(
        ".mk-resolved-prev"
      )
      ?.addEventListener(
        "click",
        () => {

          equipmentIndex =
            (
              equipmentIndex -
              1 +
              resolvedEquipmentItems.length
            )
            %
            resolvedEquipmentItems.length;

          updateResolvedEquipment();

        }
      );


    resolvedEquipment
      .querySelector(
        ".mk-resolved-next"
      )
      ?.addEventListener(
        "click",
        () => {

          equipmentIndex =
            (
              equipmentIndex + 1
            )
            %
            resolvedEquipmentItems.length;

          updateResolvedEquipment();

        }
      );

  }



  /* ======================================================
     EXACT LEFT / RIGHT HEIGHT MATCH
     ====================================================== */

  const syncResolvedHomepage = () => {

    const left =
      document.querySelector(
        ".mk-resolved-left"
      );

    const right =
      document.querySelector(
        ".mk-resolved-right"
      );


    if(!left || !right){
      return;
    }


    if(
      window.matchMedia(
        "(max-width:700px)"
      ).matches
    ){
      right.style.height = "";
      return;
    }


    right.style.height = "";


    const leftHeight =
      Math.ceil(
        left.getBoundingClientRect()
          .height
      );


    right.style.height =
      `${leftHeight}px`;

  };


  const runResolvedSync = () => {

    requestAnimationFrame(
      () => {

        syncResolvedHomepage();

        requestAnimationFrame(
          syncResolvedHomepage
        );

      }
    );

  };


  runResolvedSync();


  window.addEventListener(
    "load",
    runResolvedSync
  );


  window.addEventListener(
    "resize",
    runResolvedSync,
    {
      passive:true
    }
  );


  const resolvedHomepageImage =
    document.querySelector(
      ".mk-resolved-homepage-image"
    );


  if(
    resolvedHomepageImage
    &&
    !resolvedHomepageImage.complete
  ){
    resolvedHomepageImage
      .addEventListener(
        "load",
        runResolvedSync,
        {
          once:true
        }
      );
  }


  const resolvedVideo =
    document.querySelector(
      ".mk-resolved-motion"
    );


  resolvedVideo?.addEventListener(
    "loadedmetadata",
    runResolvedSync,
    {
      once:true
    }
  );


  if(
    "ResizeObserver"
    in window
  ){

    const left =
      document.querySelector(
        ".mk-resolved-left"
      );

    if(left){

      const resolvedObserver =
        new ResizeObserver(
          runResolvedSync
        );

      resolvedObserver.observe(
        left
      );

    }

  }




  /* S04 EFFECT SWITCHER START */

  const s04Effects = {

    character: {
      number: "01 / 03",
      title: "CHARACTER ENTRANCE",
      code: `${A}/explanation/code-character-ease.png`,
      video: `${A}/explanation/character-ease.mp4?v=s04-media-v2`,
      alt: "CSS code for character entrance effect",
      type: "CSS / KEYFRAMES",
      description:
        "A CSS keyframe transition brings the character into view and creates the page entrance."
    },

    glow: {
      number: "02 / 03",
      title: "GLOW",
      code: `${A}/explanation/code-glowing.png`,
      video: `${A}/explanation/glowing.mp4?v=s04-media-v2`,
      alt: "Code for glowing item interaction",
      type: "CSS / INTERACTION",
      description:
        "The selected item gains a luminous state, making interaction feedback immediately visible."
    },

    pulse: {
      number: "03 / 03",
      title: "PULSE",
      code: `${A}/explanation/code-pulsing.png`,
      video: `${A}/explanation/pulsing.mp4?v=s04-media-v2`,
      alt: "Code for pulsing list interaction",
      type: "CSS / ANIMATION",
      description:
        "A repeating pulse introduces movement into the interface and draws attention to selectable content."
    }

  };


  const s04Switcher =
    document.querySelector(
      "[data-s04-effect-switcher]"
    );


  if(s04Switcher){

    const tabs = [
      ...s04Switcher.querySelectorAll(
        ".mk-s04x-tab"
      )
    ];

    const video =
      s04Switcher.querySelector(
        ".mk-s04x-result-video"
      );

    const code =
      s04Switcher.querySelector(
        ".mk-s04x-code-image"
      );

    const title =
      s04Switcher.querySelector(
        ".mk-s04x-active-title"
      );

    const count =
      s04Switcher.querySelector(
        ".mk-s04x-count"
      );

    const codeType =
      s04Switcher.querySelector(
        ".mk-s04x-code-type"
      );

    const description =
      s04Switcher.querySelector(
        ".mk-s04x-description"
      );


    const selectEffect = key => {

      const effect =
        s04Effects[key];

      if(!effect){
        return;
      }


      tabs.forEach(
        tab => {

          const active =
            tab.dataset.effect === key;

          tab.classList.toggle(
            "is-active",
            active
          );

          tab.setAttribute(
            "aria-selected",
            active
              ? "true"
              : "false"
          );

        }
      );


      code.classList.add(
        "is-changing"
      );

      video.classList.add(
        "is-changing"
      );


      window.setTimeout(
        () => {

          code.src =
            effect.code;

          code.alt =
            effect.alt;

          video.pause();

          video.src =
            effect.video;

          video.load();

          const playPromise =
            video.play();

          if(
            playPromise
            &&
            typeof playPromise.catch
            === "function"
          ){
            playPromise.catch(
              () => {}
            );
          }


          title.textContent =
            effect.title;

          count.textContent =
            effect.number;

          codeType.textContent =
            effect.type;

          description.textContent =
            effect.description;


          code.classList.remove(
            "is-changing"
          );

          video.classList.remove(
            "is-changing"
          );

        },
        130
      );

    };


    tabs.forEach(
      tab => {

        tab.addEventListener(
          "click",
          () => {

            selectEffect(
              tab.dataset.effect
            );

          }
        );

      }
    );

  }

  /* S04 EFFECT SWITCHER END */

const progress =
    document.querySelector("#progress");


  const updateProgress = () => {

    const height =
      document.documentElement.scrollHeight -
      innerHeight;

    if(progress){

      progress.style.width =
        `${height
          ? scrollY / height * 100
          : 0}%`;

    }

  };


  updateProgress();


  addEventListener(
    "scroll",
    updateProgress,
    {passive:true}
  );



  /* chapter rail */

  const railLinks = [
    ...document.querySelectorAll(
      ".mk-rail a"
    )
  ];


  const sections =
    railLinks.map(
      link =>
        document.querySelector(
          link.getAttribute("href")
        )
    );


  const tip =
    document.querySelector("#mk-tip");


  railLinks.forEach(link => {

    const show = () => {

      if(!tip) return;

      tip.textContent =
        link.dataset.label || "";

      tip.classList.add("visible");

    };


    const hide = () => {

      if(!tip) return;

      tip.classList.remove("visible");

    };


    link.addEventListener(
      "mouseenter",
      show
    );

    link.addEventListener(
      "mouseleave",
      hide
    );

    link.addEventListener(
      "focus",
      show
    );

    link.addEventListener(
      "blur",
      hide
    );

  });


  if(
    "IntersectionObserver" in window
  ){

    const observer =
      new IntersectionObserver(

        entries => {

          entries.forEach(
            entry => {

              if(!entry.isIntersecting){
                return;
              }

              const index =
                sections.indexOf(
                  entry.target
                );

              railLinks.forEach(
                (link,i) =>
                  link.classList.toggle(
                    "active",
                    i === index
                  )
              );

            }
          );

        },

        {
          rootMargin:
            "-42% 0px -48% 0px"
        }

      );


    sections
      .filter(Boolean)
      .forEach(
        section =>
          observer.observe(section)
      );

  }

};
