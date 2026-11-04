import React from 'react';

export default function SelectedWork() {
  return (
    <section id="work" aria-label="Selected work">
      <div className="w" suppressHydrationWarning>
        <h2 className="h rv" suppressHydrationWarning>
          Things I <em>build.</em>
        </h2>
        <p className="lede rv" suppressHydrationWarning>
          Community platforms, UI systems and product-focused web apps, shipped end to end.
        </p>

        <div style={{ marginTop: '56px' }} suppressHydrationWarning>
          {/* Card 0: Codex Monarch */}
          <article className="pc c0" style={{ '--i': 0 } as React.CSSProperties} suppressHydrationWarning>
            <div>
              <p className="k">Community platform</p>
              <h3>
                Codex <em>Monarch</em>
              </h3>
              <p>
                A student-led technical community platform for events, workshops and collaboration. Co-founded and led by me.
              </p>
              <a className="b" href="https://www.codexmonarch.me/" target="_blank" rel="noopener noreferrer">
                <span>Live project</span>
              </a>
            </div>
            <div className="fr">
              <div className="cr">
                <i />
                <i />
                <i />
              </div>
              <div className="mk" style={{ background: '#1a110a', color: '#f4e9dc' }}>
                <h4>We build what others only imagine.</h4>
                <div className="r">
                  <b />
                  <s />
                </div>
              </div>
            </div>
          </article>

          {/* Card 1: ReadyToGo */}
          <article className="pc c1" style={{ '--i': 1 } as React.CSSProperties} suppressHydrationWarning>
            <div>
              <p className="k">Career platform</p>
              <h3>
                Ready<em>ToGo</em>
              </h3>
              <p>
                Career-readiness and placement preparation platform that helps students prepare and get hired.
              </p>
              <a className="b" href="https://readytogo.codexmonarch.me/" target="_blank" rel="noopener noreferrer">
                <span>Live project</span>
              </a>
            </div>
            <div className="fr">
              <div className="cr">
                <i />
                <i />
                <i />
              </div>
              <div className="mk" style={{ background: '#fff', color: '#101827' }}>
                <h4>Make strategy and demonstrate potential.</h4>
                <div className="bl">
                  <b />
                  <b />
                  <b />
                </div>
              </div>
            </div>
          </article>

          {/* Card 2: Orbit UI */}
          <article className="pc c2" style={{ '--i': 2 } as React.CSSProperties} suppressHydrationWarning>
            <div>
              <p className="k">Component library</p>
              <h3>
                Orbit <em>UI</em>
              </h3>
              <p>
                A lightweight, zero-dependency component library for fast, accessible interfaces.
              </p>
              <a className="b" href="https://orbitui-eta.vercel.app/" target="_blank" rel="noopener noreferrer">
                <span>Live project</span>
              </a>
              <a className="b o" href="https://github.com/AnkitRajMaurya/ORBITUI" target="_blank" rel="noopener noreferrer">
                <span>Source code</span>
              </a>
            </div>
            <div className="fr">
              <div className="cr">
                <i />
                <i />
                <i />
              </div>
              <div className="mk" style={{ background: 'linear-gradient(135deg,#0b1030,#2b3bb0)', color: '#eef0ff' }}>
                <h4>Book your seat to space.</h4>
                <div className="r">
                  <b />
                  <s />
                </div>
              </div>
            </div>
          </article>

          {/* Card 3: Weather App */}
          <article className="pc c3" style={{ '--i': 3 } as React.CSSProperties} suppressHydrationWarning>
            <div>
              <p className="k">Web app</p>
              <h3>
                Weather <em>App</em>
              </h3>
              <p>
                Live conditions and forecasts in a clean, minimal interface.
              </p>
              <a className="b" href="https://ankitrajmaurya.github.io/PRODIGY_WD_02/" target="_blank" rel="noopener noreferrer">
                <span>Live project</span>
              </a>
              <a className="b o" href="https://github.com/AnkitRajMaurya/PRODIGY_WD_02" target="_blank" rel="noopener noreferrer">
                <span>Source code</span>
              </a>
            </div>
            <div className="fr">
              <div className="cr">
                <i />
                <i />
                <i />
              </div>
              <div className="mk" style={{ background: 'linear-gradient(160deg,#12343a,#0a1417)', color: '#d6f0f2' }}>
                <h4 style={{ fontSize: 'clamp(44px,8vw,96px)' }}>24°</h4>
                <div className="wx">
                  <b style={{ height: '55%' }} />
                  <b style={{ height: '80%' }} />
                  <b style={{ height: '45%' }} />
                  <b style={{ height: '100%' }} />
                  <b style={{ height: '70%' }} />
                  <b style={{ height: '60%' }} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
