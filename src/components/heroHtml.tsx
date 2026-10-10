/* generated from the original hero markup */
export const heroHtml = ({ T, esc, titleAr, titleEn, desc, count }) => `<section class="hero" id="hero" aria-label="Hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="hero-grid-lines"></div>
        <div class="hero-3d-mount" id="hero3dMount" aria-hidden="true"></div>
        <div class="hero-orb hero-orb-1"></div>
        <div class="hero-orb hero-orb-2"></div>
        <div class="hero-orb hero-orb-3"></div>
        <div class="hero-shapes">
          <div class="hero-shape hero-shape-1"></div>
          <div class="hero-shape hero-shape-2"></div>
          <div class="hero-shape hero-shape-3"></div>
          <div class="hero-shape hero-shape-4"></div>
          <div class="hero-shape hero-shape-5"></div>
        </div>
        <canvas class="hero-particles" id="heroParticles"></canvas>
        <svg
          class="hero-circuit"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="circuitGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ff8c42" stop-opacity="0" />
              <stop offset="50%" stop-color="#ff8c42" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path
            class="circuit-line"
            d="M0,300 Q300,200 600,300 T1200,300"
            stroke="url(#circuitGrad)"
            stroke-width="1.5"
            fill="none"
          />
          <path
            class="circuit-line"
            d="M0,400 Q400,300 700,400 T1200,400"
            stroke="url(#circuitGrad)"
            stroke-width="1"
            fill="none"
          />
          <path
            class="circuit-line"
            d="M0,200 Q350,300 650,200 T1200,200"
            stroke="url(#circuitGrad)"
            stroke-width="1"
            fill="none"
          />
          <circle class="circuit-dot" cx="600" cy="300" r="4" />
          <circle class="circuit-dot" cx="700" cy="400" r="3" />
          <circle class="circuit-dot" cx="650" cy="200" r="3" />
        </svg>
      </div>

      <div class="wrap hero-wrap">
        <div class="hero-grid">
          <div class="hero-stat" id="heroStat">
            <div class="hero-stat-inner">
              <span class="num" id="heroCount">${count}</span>
              <span class="label">${T("engineered")}</span>
            </div>
            <svg
              class="hero-stat-ring"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255,140,66,0.25)"
                stroke-width="0.5"
              />
              <circle
                class="ring-progress"
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#ringGrad)"
                stroke-width="1.5"
                stroke-dasharray="289"
                stroke-dashoffset="289"
                stroke-linecap="round"
              />
              <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#ff8c42" />
                  <stop offset="100%" stop-color="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div class="hero-main">
            <div class="hero-eyebrow">
              <span class="hero-eyebrow-dot"></span>
              <span>${T("heroEyebrow")}</span>
            </div>

            <h1 class="hero-title">
              <span class="hero-title-line">
                <span class="hero-title-ar" id="heroTitleAr"
                  >${esc(titleAr)}</span
                >
              </span>
              <span class="hero-title-line hero-title-line-2">
                <span class="hero-title-en" id="heroTitleEn" dir="ltr"
                  >${esc(titleEn)}</span
                >
              </span>
            </h1>

            <p class="hero-desc" id="heroDesc">${esc(desc)}</p>

            <div class="hero-actions flex flex-wrap items-center gap-4">
              <a
                class="btn p hero-cta ripple"
                href="#list"
                aria-label="${T("explore")}"
              >
                <span class="hero-cta-shine" aria-hidden="true"></span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
                <span>${T("ctaExplore")}</span>
              </a>
              <a
                class="btn hero-cta-ghost"
                href="#sl"
                aria-label="${T("featT")}"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"
                  />
                </svg>
                <span>${T("ctaFeatured")}</span>
              </a>
            </div>

            <div class="hero-meta">
              <div class="hero-meta-item">
                <span
                  class="hero-meta-dot"
                  style="background: #2dd4bf; color: #2dd4bf"
                ></span>
                <span>${T("metaEmbedded")}</span>
              </div>
              <div class="hero-meta-item">
                <span
                  class="hero-meta-dot"
                  style="background: #ff8c42; color: #ff8c42"
                ></span>
                <span>${T("metaWeb")}</span>
              </div>
              <div class="hero-meta-item">
                <span
                  class="hero-meta-dot"
                  style="background: #a78bfa; color: #a78bfa"
                ></span>
                <span>${T("metaMobile")}</span>
              </div>
            </div>
          </div>
        </div>

        <a
          class="hero-scroll"
          href="#list"
          aria-label="${T("scroll")}"
        >
          <span class="hero-scroll-mouse">
            <span class="hero-scroll-wheel"></span>
          </span>
          <span class="hero-scroll-text">${T("scroll")}</span>
        </a>
      </div>
    </section>`;
