const fs = require('fs');
const path = require('path');

const FONTDIR = '/Users/Courage/Desktop/Budgetplanner/node_modules/@expo-google-fonts/poppins';
function font(w, name) {
  const p = path.join(FONTDIR, w, name);
  const b64 = fs.readFileSync(p).toString('base64');
  return `data:font/ttf;base64,${b64}`;
}
const F400 = font('400Regular', 'Poppins_400Regular.ttf');
const F500 = font('500Medium', 'Poppins_500Medium.ttf');
const F600 = font('600SemiBold', 'Poppins_600SemiBold.ttf');
const F700 = font('700Bold', 'Poppins_700Bold.ttf');

// ── App-accurate palette ──────────────────────────────────────────────
const C = {
  brand: '#5046E6', brandTint: '#EEEDFD', brandPress: '#3D34C2',
  ink: '#15151A', sec: '#6E6E73', tri: '#9A9AA0',
  appBg: '#FAFAF7', surface: '#FFFFFF', sunken: '#F1F0EC',
  hair: 'rgba(60,60,67,0.10)',
  ess: '#4A6FA5', essT: '#E3EBF4',
  gro: '#5C8A6B', groT: '#E4EEE7',
  sta: '#7A6B95', staT: '#EBE8F0',
  rew: '#B5755C', rewT: '#F2E4DE',
};

// ── Small helpers for app UI ──────────────────────────────────────────
const statusbar = `
  <div class="sb">
    <span class="sb-time">9:41</span>
    <span class="sb-right">
      <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="7" width="3" height="5" rx="1" fill="#15151A"/><rect x="5" y="4" width="3" height="8" rx="1" fill="#15151A"/><rect x="10" y="1.5" width="3" height="10.5" rx="1" fill="#15151A"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#15151A" opacity="0.35"/></svg>
      <svg width="26" height="13" viewBox="0 0 26 13"><rect x="0.5" y="0.5" width="21" height="12" rx="3.5" fill="none" stroke="#15151A" stroke-opacity="0.4"/><rect x="2" y="2" width="16" height="9" rx="2" fill="#15151A"/><rect x="23" y="4" width="2" height="5" rx="1" fill="#15151A" opacity="0.4"/></svg>
    </span>
  </div>`;

function bar(color, tint, pct) {
  return `<div class="bar" style="background:${tint}"><div class="fill" style="width:${pct}%;background:${color}"></div></div>`;
}
function catRow(name, color, tint, amount, pct) {
  return `<div class="crow">
    <div class="crow-top"><span class="dot" style="background:${color}"></span><span class="cname">${name}</span><span class="camt">${amount}</span></div>
    ${bar(color, tint, pct)}
  </div>`;
}

// ── Home markup reused behind the Log sheet for context ───────────────
function homeMarkup(withFab) {
  return `
      ${statusbar}
      <div class="screen-pad">
        <div class="row-between">
          <div></div>
          <div class="gear">⚙</div>
        </div>
        <div class="eyebrow">SAFE TO SPEND TODAY</div>
        <div class="hero"><span class="hero-sym">₦</span>3,403</div>
        <div class="hero-sub">15 days to go this month</div>
        <div class="card">
          ${catRow('Essentials', C.ess, C.essT, '₦75,424', 56)}
          <div class="divider"></div>
          ${catRow('Growth', C.gro, C.groT, '₦52,813', 41)}
          <div class="divider"></div>
          ${catRow('Stability', C.sta, C.staT, '₦29,888', 30)}
          <div class="divider"></div>
          ${catRow('Rewards', C.rew, C.rewT, '₦17,425', 66)}
        </div>
        <div class="card mini">
          <div class="mini-top"><span class="mini-eye">THIS MONTH</span><span class="mini-r">₦123,000 of ₦180,000</span></div>
          ${bar(C.brand, C.brandTint, 68)}
        </div>
        ${withFab ? '<div class="fab">+</div>' : ''}
      </div>`;
}

// ── Screens (built at 393 × 852 logical) ──────────────────────────────
const screens = {
  home: {
    cap: `Know what's <span class="hl">safe to spend</span> today`,
    sub: `One clear number, front and center — every day.`,
    bg: ['#F2F1FE', '#FBFAFF'], blob: '#DCD9FB',
    body: homeMarkup(true)
  },

  log: {
    cap: `Log a spend in <span class="hl">five seconds</span>`,
    sub: `Amount, category, done. No forms, no friction.`,
    bg: ['#EAEFF7', '#F7F9FC'], blob: '#D2DEEF',
    body: `
      <div class="behind">${homeMarkup(false)}</div>
      <div class="screen-dim"></div>
      <div class="sheet">
        <div class="sheet-grab"></div>
        <div class="row-between">
          <span class="sheet-title">Log a spend</span>
          <span class="sheet-x">✕</span>
        </div>
        <div class="log-amt"><span class="log-sym">₦</span>1,200<span class="caret"></span></div>
        <div class="log-label">CATEGORY</div>
        <div class="chips">
          <span class="chip sel"><span class="dot" style="background:#fff"></span>Essentials</span>
          <span class="chip"><span class="dot" style="background:${C.gro}"></span>Growth</span>
          <span class="chip"><span class="dot" style="background:${C.sta}"></span>Stability</span>
        </div>
        <div class="log-label">NOTE (OPTIONAL)</div>
        <div class="note">Lunch with the team</div>
        <div class="btn">Log</div>
      </div>`
  },

  plan: {
    cap: `A plan that fits <span class="hl">your month</span>`,
    sub: `Income, priorities and savings — balanced for you.`,
    bg: ['#EAF1EB', '#F6FAF7'], blob: '#D3E5D7',
    body: `
      ${statusbar}
      <div class="screen-pad">
        <div class="scr-h1">Your plan</div>
        <div class="card tight">
          <div class="prow"><span class="pl">Income</span><span class="pv pos">₦180,000</span></div>
          <div class="divider"></div>
          <div class="prow"><span class="pl">Priorities</span><span class="pv neg">−₦96,000</span></div>
          <div class="divider"></div>
          <div class="prow"><span class="pl">Savings</span><span class="pv neg">−₦27,000</span></div>
          <div class="divider strong"></div>
          <div class="prow"><span class="pl big">To spend</span><span class="pv big brand">₦57,000</span></div>
        </div>
        <div class="scr-h2">Your split</div>
        <div class="card tight">
          ${catRow('Essentials · 50%', C.ess, C.essT, '₦28,500', 50)}
          <div class="divider"></div>
          ${catRow('Growth · 25%', C.gro, C.groT, '₦14,250', 25)}
          <div class="divider"></div>
          ${catRow('Stability · 15%', C.sta, C.staT, '₦8,550', 15)}
          <div class="divider"></div>
          ${catRow('Rewards · 10%', C.rew, C.rewT, '₦5,700', 10)}
        </div>
      </div>`
  },

  today: {
    cap: `<span class="hl">Every spend</span>, at a glance`,
    sub: `See exactly where your money went today.`,
    bg: ['#F4EAE5', '#FBF6F3'], blob: '#EBD6CC',
    body: `
      ${statusbar}
      <div class="screen-pad">
        <div class="row-between">
          <div class="scr-h1">Today</div>
          <div class="day-total">₦25,200</div>
        </div>
        <div class="card list">
          ${txn('Coffee', 'Essentials', C.ess, '₦1,200', '8:12 AM')}
          <div class="divider"></div>
          ${txn('Bolt ride', 'Essentials', C.ess, '₦3,500', '9:40 AM')}
          <div class="divider"></div>
          ${txn('Gym membership', 'Growth', C.gro, '₦8,000', '1:05 PM')}
          <div class="divider"></div>
          ${txn('Groceries', 'Essentials', C.ess, '₦6,200', '6:22 PM')}
          <div class="divider"></div>
          ${txn('Dinner out', 'Rewards', C.rew, '₦4,300', '8:05 PM')}
          <div class="divider"></div>
          ${txn('Airtime', 'Stability', C.sta, '₦2,000', '9:18 PM')}
        </div>
        <div class="fab">+</div>
      </div>`
  },

  reminders: {
    cap: `Gentle nudges, <span class="hl">never nagging</span>`,
    sub: `A quiet reminder to check in — on your terms.`,
    bg: ['#EEEBF4', '#F8F6FB'], blob: '#DED7EC',
    body: `
      ${statusbar}
      <div class="screen-pad">
        <div class="scr-h1">Reminders</div>
        <div class="card tight">
          <div class="rrow">
            <div class="rtext"><div class="rt">Daily check-in</div><div class="rs">A nudge at 8:00 PM to log the day</div></div>
            <div class="toggle on"><div class="knob"></div></div>
          </div>
          <div class="divider"></div>
          <div class="rrow">
            <div class="rtext"><div class="rt">Month-end reminder</div><div class="rs">We'll remind you to close out the month</div></div>
            <div class="toggle on"><div class="knob"></div></div>
          </div>
        </div>
        <div class="notif-card">
          <div class="notif-ico">₦</div>
          <div class="notif-txt"><div class="nt">Budget Tracker</div><div class="ns">You have ₦3,403 safe to spend today 💜</div></div>
          <div class="notif-time">now</div>
        </div>
      </div>`
  },
};

function txn(name, cat, color, amt, time) {
  return `<div class="txn">
    <span class="dot lg" style="background:${color}"></span>
    <div class="txn-mid"><div class="txn-name">${name}</div><div class="txn-cat">${cat} · ${time}</div></div>
    <div class="txn-amt">${amt}</div>
  </div>`;
}

const order = ['home', 'log', 'plan', 'today', 'reminders'];
const posters = order.map(k => {
  const s = screens[k];
  return `<div class="poster" data-key="${k}" style="--bg1:${s.bg[0]};--bg2:${s.bg[1]};--blob:${s.blob}">
    <div class="caption"><h1>${s.cap}</h1><p>${s.sub}</p></div>
    <div class="stage"><div class="phone"><div class="island"></div><div class="screenclip"><div class="screen">${s.body}</div></div></div></div>
  </div>`;
}).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face{font-family:P;font-weight:400;src:url(${F400})format('truetype')}
@font-face{font-family:P;font-weight:500;src:url(${F500})format('truetype')}
@font-face{font-family:P;font-weight:600;src:url(${F600})format('truetype')}
@font-face{font-family:P;font-weight:700;src:url(${F700})format('truetype')}
*{margin:0;padding:0;box-sizing:border-box;font-family:P,sans-serif;-webkit-font-smoothing:antialiased}
html,body{overflow:hidden;background:#fff}
.poster{display:none;position:relative;width:100vw;height:100vh;overflow:hidden;
  background:linear-gradient(165deg,var(--bg1),var(--bg2));flex-direction:column}
.poster.show{display:flex}
.poster::before{content:'';position:absolute;width:90vw;height:90vw;border-radius:50%;
  right:-28vw;top:-30vw;background:radial-gradient(circle,var(--blob) 0%,transparent 68%);opacity:.75}
.caption{position:relative;z-index:2;padding:8.5vh 9vw 0;text-align:center}
.caption h1{font-weight:700;color:${C.ink};font-size:6.6vw;line-height:1.12;letter-spacing:-0.02em}
.caption h1 .hl{color:${C.brand}}
.caption p{margin-top:2.2vh;font-weight:500;color:${C.sec};font-size:3.5vw;line-height:1.4}
.stage{position:relative;z-index:2;flex:1;display:flex;align-items:center;justify-content:center;padding-bottom:2vh}
.phone{position:relative;height:63vh;aspect-ratio:393/852;background:#0a0a0c;
  border-radius:13.5%/6.3%;padding:0;
  box-shadow:0 5vh 9vh -2.5vh rgba(45,35,95,.42),0 1.5vh 4vh rgba(0,0,0,.16),inset 0 0 0 0.35vh rgba(255,255,255,.06)}
.island{position:absolute;top:1.5%;left:50%;transform:translateX(-50%);width:34%;height:3%;
  background:#000;border-radius:99px;z-index:5}
.screenclip{position:absolute;top:1.35%;bottom:1.35%;left:2.9%;right:2.9%;
  border-radius:11.4%/5.4%;overflow:hidden;background:${C.appBg}}
.screen{position:absolute;top:0;left:0;width:393px;height:852px;transform-origin:top left;background:${C.appBg}}

/* status bar */
.sb{display:flex;justify-content:space-between;align-items:center;padding:16px 30px 0}
.sb-time{font-weight:600;font-size:16px;color:${C.ink};letter-spacing:.2px}
.sb-right{display:flex;gap:7px;align-items:center}
.screen-pad{padding:20px 22px 0}

/* generic */
.row-between{display:flex;justify-content:space-between;align-items:center}
.eyebrow{margin-top:26px;font-weight:600;font-size:12px;letter-spacing:1.6px;color:${C.sec}}
.hero{margin-top:6px;font-weight:700;font-size:64px;color:${C.ink};letter-spacing:-1.5px;line-height:1}
.hero-sym{font-size:38px;font-weight:600;vertical-align:9px;margin-right:1px}
.hero-sub{margin-top:10px;font-weight:400;font-size:14px;color:${C.sec}}
.gear{font-size:20px;color:${C.sec}}
.card{margin-top:22px;background:${C.surface};border-radius:22px;padding:18px 18px;
  box-shadow:0 8px 24px rgba(30,25,60,.06),0 1px 0 ${C.hair}}
.card.tight{padding:6px 18px}
.card.list{padding:4px 18px}
.card.mini{margin-top:16px;padding:16px 18px}
.mini-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.mini-eye{font-weight:600;font-size:12px;letter-spacing:1.4px;color:${C.sec}}
.mini-r{font-weight:500;font-size:13px;color:${C.sec}}
.divider{height:1px;background:${C.hair};margin:14px 0}
.divider.strong{background:rgba(60,60,67,.16);margin:16px 0}
.crow-top{display:flex;align-items:center;margin-bottom:11px}
.dot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:9px}
.dot.lg{width:11px;height:11px;margin-right:0}
.cname{font-weight:600;font-size:16px;color:${C.ink}}
.camt{margin-left:auto;font-weight:600;font-size:16px;color:${C.ink}}
.bar{height:8px;border-radius:99px;overflow:hidden}
.fill{height:100%;border-radius:99px}
.fab{position:absolute;right:24px;bottom:34px;width:60px;height:60px;border-radius:50%;
  background:${C.brand};color:#fff;font-size:32px;font-weight:400;display:flex;align-items:center;
  justify-content:center;box-shadow:0 10px 22px rgba(80,70,230,.42)}

/* headings */
.scr-h1{font-weight:700;font-size:28px;color:${C.ink};letter-spacing:-.5px;margin-top:8px}
.scr-h2{font-weight:600;font-size:15px;color:${C.sec};margin:24px 4px 0}

/* plan */
.prow{display:flex;justify-content:space-between;align-items:center;padding:14px 0}
.pl{font-weight:500;font-size:16px;color:${C.ink}}
.pl.big{font-weight:700;font-size:18px}
.pv{font-weight:600;font-size:16px;color:${C.ink}}
.pv.pos{color:${C.gro}}
.pv.neg{color:${C.sec}}
.pv.big{font-size:22px}
.pv.brand{color:${C.brand}}

/* log sheet */
.behind{position:absolute;inset:0}
.screen-dim{position:absolute;inset:0;background:rgba(15,15,26,.40)}
.sheet{position:absolute;left:0;right:0;bottom:0;background:${C.surface};
  border-radius:28px 28px 0 0;padding:12px 22px 30px;box-shadow:0 -12px 40px rgba(0,0,0,.14)}
.sheet-grab{width:40px;height:5px;border-radius:99px;background:#D8D8D8;margin:2px auto 14px}
.sheet-title{font-weight:600;font-size:20px;color:${C.ink}}
.sheet-x{font-size:16px;color:${C.sec}}
.log-amt{text-align:center;font-weight:700;font-size:60px;color:${C.ink};margin:26px 0 8px;letter-spacing:-1.5px}
.log-sym{font-size:34px;font-weight:600;vertical-align:10px;color:${C.sec};margin-right:2px}
.caret{display:inline-block;width:3px;height:52px;background:${C.brand};vertical-align:-9px;margin-left:3px;border-radius:2px}
.log-label{font-weight:600;font-size:12px;letter-spacing:1.4px;color:${C.sec};margin:20px 0 12px}
.chips{display:flex;gap:9px}
.chip{display:flex;align-items:center;gap:7px;padding:11px 15px;border-radius:99px;
  border:1px solid ${C.hair};font-weight:600;font-size:14px;color:${C.ink};white-space:nowrap}
.chip.sel{background:${C.ink};color:#fff;border-color:${C.ink}}
.note{padding:15px 16px;border-radius:14px;background:${C.sunken};color:${C.sec};font-weight:400;font-size:15px}
.btn{margin-top:22px;background:${C.brand};color:#fff;text-align:center;padding:17px;border-radius:16px;
  font-weight:600;font-size:17px;box-shadow:0 10px 22px rgba(80,70,230,.34)}

/* today list */
.day-total{font-weight:700;font-size:20px;color:${C.ink}}
.txn{display:flex;align-items:center;gap:13px;padding:15px 0}
.txn-mid{flex:1}
.txn-name{font-weight:600;font-size:16px;color:${C.ink}}
.txn-cat{font-weight:400;font-size:13px;color:${C.sec};margin-top:2px}
.txn-amt{font-weight:600;font-size:16px;color:${C.ink}}

/* reminders */
.rrow{display:flex;align-items:center;justify-content:space-between;padding:16px 0;gap:14px}
.rt{font-weight:600;font-size:16px;color:${C.ink}}
.rs{font-weight:400;font-size:13px;color:${C.sec};margin-top:3px;line-height:1.35}
.toggle{width:50px;height:30px;border-radius:99px;background:#D6D6DA;position:relative;flex-shrink:0}
.toggle.on{background:${C.brand}}
.knob{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.toggle.on .knob{left:23px}
.notif-card{margin-top:26px;background:rgba(255,255,255,.78);backdrop-filter:blur(8px);
  border-radius:20px;padding:15px 16px;display:flex;align-items:center;gap:13px;
  box-shadow:0 8px 24px rgba(30,25,60,.08);border:1px solid rgba(255,255,255,.6)}
.notif-ico{width:40px;height:40px;border-radius:11px;background:${C.brand};color:#fff;
  font-weight:700;font-size:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.notif-txt{flex:1}
.nt{font-weight:600;font-size:14px;color:${C.ink}}
.ns{font-weight:400;font-size:13px;color:${C.sec};margin-top:2px}
.notif-time{font-size:12px;color:${C.tri}}
</style></head>
<body>
${posters}
<script>
function pick(){
  var key=(location.hash||'#home').slice(1);
  var all=document.querySelectorAll('.poster');
  all.forEach(function(p){p.classList.toggle('show',p.dataset.key===key)});
  var shown=document.querySelector('.poster.show');
  if(shown){
    var clip=shown.querySelector('.screenclip');
    var screen=shown.querySelector('.screen');
    var s=clip.clientWidth/393;
    screen.style.transform='scale('+s+')';
  }
}
window.addEventListener('load',function(){pick();requestAnimationFrame(pick)});
window.addEventListener('hashchange',pick);
pick();
</script>
</body></html>`;

const out = '/private/tmp/claude-501/-Users-Courage-Desktop-Budgetplanner/6d3cff67-4ccc-4f40-98b2-326c7a7f1c1b/scratchpad/poster.html';
fs.writeFileSync(out, html);
console.log('wrote', out, (html.length/1024).toFixed(0)+'KB');
