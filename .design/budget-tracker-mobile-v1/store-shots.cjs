/**
 * store-shots.cjs — editorial App Store / Play screenshot generator.
 *
 * Composes REAL device screenshots (dropped in docs/store-assets/raw/) into
 * marketing frames: soft lavender canvas, Poppins + italic-serif headline,
 * realistic device bezel, varied layouts.
 *
 * Usage:
 *   node store-shots.cjs            # writes poster html to the scratchpad
 * then screenshot each frame with headless Brave at 1290x2796 / 1080x1920.
 *
 * Frames whose source screenshot is missing are skipped with a warning, so you
 * can drop files in incrementally.
 */

const fs = require('fs');
const path = require('path');

const ROOT = '/Users/Courage/Desktop/Budgetplanner';
const RAW = path.join(ROOT, 'docs/store-assets/raw');
const OUT = process.env.SHOT_OUT || '/private/tmp/claude-501/-Users-Courage-Desktop-Budgetplanner/6d3cff67-4ccc-4f40-98b2-326c7a7f1c1b/scratchpad';
const FONTDIR = path.join(ROOT, 'node_modules/@expo-google-fonts/poppins');

function fontData(dir, file) {
  return `data:font/ttf;base64,${fs.readFileSync(path.join(FONTDIR, dir, file)).toString('base64')}`;
}
const P400 = fontData('400Regular', 'Poppins_400Regular.ttf');
const P600 = fontData('600SemiBold', 'Poppins_600SemiBold.ttf');
const P700 = fontData('700Bold', 'Poppins_700Bold.ttf');

function imgData(file) {
  const p = path.join(RAW, file);
  if (!fs.existsSync(p)) return null;
  return `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
}
const ICON = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, 'apps/mobile/assets/icon.png')).toString('base64')}`;

// ── Palette ───────────────────────────────────────────────────────────
const BG = '#E7E6F7';       // soft lavender canvas
const INK = '#15151A';
const SUB = '#4C4C5A';
const BRAND = '#5046E6';

/**
 * Frames. `shot` = filename in docs/store-assets/raw/.
 * `layout`:
 *   'bleed-right'  headline top-left, phone angled + bleeding off the right
 *   'top'          headline top-centre, phone below (bleeds off bottom)
 *   'phone-top'    phone at top, headline underneath
 */
const FRAMES = [
  {
    key: 'confidence', shot: 'home.png', layout: 'bleed-right', icon: true,
    head: ['Spend with', 'confidence'],
    sub: 'Know exactly what you can spend today.',
  },
  {
    key: 'log', shot: 'log.png', layout: 'top',
    head: ['Log it in', 'seconds'],
    sub: 'Amount, category, done — no forms.',
  },
  {
    key: 'balanced', shot: 'category.png', layout: 'top',
    head: ['Keep every', 'bucket balanced'],
    sub: 'See what’s left, category by category.',
  },
  {
    key: 'private', shot: 'lock.png', layout: 'phone-top',
    head: ['Private money', 'clarity'],
    sub: 'A PIN or Face ID to open. Hide figures any time.',
  },
  {
    key: 'shape', shot: 'adjust.png', layout: 'bleed-right',
    head: ['Shape your', 'month'],
    sub: 'Income, priorities, savings — your split, your way.',
  },
  {
    key: 'every', shot: 'activity.png', layout: 'top',
    head: ['Every spend,', 'at a glance'],
    sub: 'A quiet record of where your money went.',
  },
];

const available = FRAMES.filter((f) => {
  const ok = !!imgData(f.shot);
  if (!ok) console.warn(`! missing raw/${f.shot} — frame "${f.key}" skipped`);
  return ok;
});
if (available.length === 0) {
  console.warn('No raw screenshots found. Rendering with placeholders.');
}

// Use a placeholder when the shot is missing so layout can still be reviewed.
function shotSrc(file) {
  return imgData(file) || '';
}

function headlineHTML(head) {
  const [plain, italic] = head;
  return `<span class="h-plain">${plain}</span><br><span class="h-italic">${italic}</span>`;
}

function frameHTML(f) {
  const src = shotSrc(f.shot);
  const phone = `
    <div class="phone">
      <div class="bezel">
        ${src ? `<img class="shot" src="${src}">` : '<div class="shot placeholder">screenshot</div>'}
        <div class="island"></div>
      </div>
    </div>`;

  if (f.layout === 'bleed-right') {
    return `
      <div class="poster l-bleed">
        ${f.icon ? `<img class="appicon" src="${ICON}">` : ''}
        <div class="copy">
          <h1>${headlineHTML(f.head)}</h1>
          ${f.sub ? `<p>${f.sub}</p>` : ''}
        </div>
        <div class="stage-bleed">${phone}</div>
      </div>`;
  }
  if (f.layout === 'phone-top') {
    return `
      <div class="poster l-phonetop">
        <div class="stage-top">${phone}</div>
        <div class="copy bottom">
          <h1>${headlineHTML(f.head)}</h1>
          ${f.sub ? `<p>${f.sub}</p>` : ''}
        </div>
      </div>`;
  }
  return `
    <div class="poster l-top">
      <div class="copy center">
        <h1>${headlineHTML(f.head)}</h1>
        ${f.sub ? `<p>${f.sub}</p>` : ''}
      </div>
      <div class="stage-under">${phone}</div>
    </div>`;
}

const posters = (available.length ? available : FRAMES)
  .map((f) => `<div class="wrap" data-key="${f.key}">${frameHTML(f)}</div>`)
  .join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:P;font-weight:400;src:url(${P400})format('truetype')}
@font-face{font-family:P;font-weight:600;src:url(${P600})format('truetype')}
@font-face{font-family:P;font-weight:700;src:url(${P700})format('truetype')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{overflow:hidden;background:${BG}}
.wrap{display:none;width:100vw;height:100vh}
.wrap.show{display:block}
.poster{position:relative;width:100vw;height:100vh;overflow:hidden;background:${BG}}

.appicon{position:absolute;top:5.5vh;left:6vw;width:9vw;height:9vw;border-radius:2.2vw;z-index:3}

.copy{position:absolute;z-index:2;left:6vw;right:6vw;top:14vh}
.copy.center{text-align:center;top:7vh}
.copy.bottom{top:auto;bottom:9vh}
h1{font-family:P,sans-serif;font-weight:700;color:${INK};font-size:8.4vw;line-height:1.04;letter-spacing:-0.03em}
.h-italic{font-family:Didot,'Bodoni 72',Baskerville,Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-0.01em}
.copy p{font-family:P,sans-serif;font-weight:400;color:${SUB};font-size:3.6vw;line-height:1.45;margin-top:3.2vh;max-width:78%}
.copy.center p{margin-left:auto;margin-right:auto}

/* Device */
.phone{position:relative;height:100%;aspect-ratio:1290/2796}
.bezel{position:absolute;inset:0;background:#0A0A0C;border-radius:12%/5.6%;
  padding:1.1%;box-shadow:0 6vh 11vh -3vh rgba(40,30,90,.42),0 2vh 5vh rgba(0,0,0,.18)}
.shot{width:100%;height:100%;object-fit:cover;border-radius:11%/5.2%;display:block}
.shot.placeholder{display:flex;align-items:center;justify-content:center;background:#FAFAF7;
  color:#9A9AA0;font-family:P,sans-serif;font-size:2vw}
.island{position:absolute;top:2%;left:50%;transform:translateX(-50%);width:32%;height:2.6%;
  background:#000;border-radius:99px}

/* Layout: headline left, phone angled bleeding off the right.
   Kept clear of the copy block so the headline never sits under the device. */
.l-bleed .copy{max-width:64vw}
.l-bleed .copy p{max-width:100%}
.l-bleed .stage-bleed{position:absolute;top:34vh;left:30vw;height:70vh;
  transform:rotate(-7deg);transform-origin:top left}
/* Layout: headline top-centre, phone below bleeding off the bottom */
.l-top .stage-under{position:absolute;top:30vh;left:50%;transform:translateX(-50%);height:76vh}
/* Layout: phone up top, headline beneath */
.l-phonetop .stage-top{position:absolute;top:6vh;left:50%;transform:translateX(-50%);height:60vh}
</style></head><body>
${posters}
<script>
function pick(){
  var key=(location.hash||'').slice(1);
  var all=document.querySelectorAll('.wrap');
  var found=false;
  all.forEach(function(w){var on=w.dataset.key===key;w.classList.toggle('show',on);if(on)found=true;});
  if(!found&&all.length)all[0].classList.add('show');
}
window.addEventListener('load',pick);
window.addEventListener('hashchange',pick);
pick();
</script></body></html>`;

const outFile = path.join(OUT, 'store-shots.html');
fs.writeFileSync(outFile, html);
console.log('wrote', outFile, (html.length / 1024).toFixed(0) + 'KB');
console.log('frames:', (available.length ? available : FRAMES).map((f) => f.key).join(', '));
