// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Shaping value-based healthcare', description: 'System-wide stewardship of public healthcare resources through corporate governance, financial oversight, risk management, and administration of national healthcare schemes.', image_url: 'https://www.mohh.com.sg/content/dam/mohhwebsites/home/Teaser%20Grid%20Card%20Portrait%201.jpg', category: 'Healthcare Stewardship' },
  { name: 'Developing healthcare talent', description: "Sectoral talent initiatives that attract, retain, recognise, and develop Singapore's public healthcare workforce at every career stage.", image_url: 'https://www.mohh.com.sg/content/dam/mohhwebsites/home/component_image.jpg', category: 'Talent Development' },
  { name: 'Building healthcare infrastructure', description: 'Planning, developing, and delivering healthcare facilities from acute hospitals to polyclinics and nursing homes, guided by collaboration, innovation, and sustainability.', image_url: 'https://www.mohh.com.sg/content/dam/mohhwebsites/home/mohh-home-driving-construction-efficiency-through-standardisation.jpg', category: 'Infrastructure' },
  { name: 'Clinical careers', description: "Careers in medicine and dentistry in Singapore's public healthcare sector, plus the CREATE+ scheme for allied health professionals.", image_url: 'https://www.mohh.com.sg/content/dam/mohhwebsites/home/what-we-do/developing-healthcare-talent/Clinical%20career.jpg', category: 'Talent Development' },
  { name: 'Capability development', description: 'Equipping healthcare leaders with the knowledge and tools to navigate the evolving challenges of the sector.', image_url: 'https://www.mohh.com.sg/content/dam/mohhwebsites/home/Corp_Shot3_1798-Edit-R2-Horizontal-RGB.jpg', category: 'Talent Development' },
  { name: 'Scholarships and grants', description: "Schemes and funding available to future healthcare professionals pursuing careers in Singapore's public healthcare sector.", image_url: 'https://www.mohh.com.sg/content/dam/mohhwebsites/home/what-we-do/developing-healthcare-talent/Scholarships%20and%20grants.jpg', category: 'Talent Development' },
  { name: 'Recognising excellence', description: "Efforts to honour the contributions of Singapore's healthcare workforce across its many facets.", image_url: 'https://www.mohh.com.sg/content/dam/mohhwebsites/home/what-we-do/developing-healthcare-talent/Recognising%20excellence.jpg', category: 'Talent Development' },
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#5ea6db'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const ACCENT = PALETTE[0] || '#2563eb';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.solutions — bare array outputSchema; key derived from actionName "browse_solutions"
      items = structuredContent?.solutions || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderItems(block, items, bridge) {
  const list = (items || []).slice(0, 10);

  const wrapper = document.createElement('div');
  wrapper.className = 'browse-solutions-wrapper';

  const track = document.createElement('div');
  track.className = 'browse-solutions-track';

  list.forEach((item, i) => {
    const card = document.createElement('article');
    card.className = 'browse-solutions-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'browse-solutions-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.loading = 'lazy';
      img.onerror = () => { if (img.parentNode) img.parentNode.replaceChild(colorDiv(), img); };
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const content = document.createElement('div');
    content.className = 'browse-solutions-content';
    content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'browse-solutions-title';
    title.textContent = item.name || '';
    content.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'browse-solutions-desc';
    desc.textContent = item.description || '';
    content.appendChild(desc);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'browse-solutions-badge';
      badge.textContent = item.category;
      content.appendChild(badge);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'browse-solutions-cta';
    btn.textContent = 'Learn More';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    content.appendChild(btn);

    card.appendChild(content);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'browse-solutions-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;
  wrapper.appendChild(fade);

  const leftBtn = document.createElement('button');
  leftBtn.type = 'button';
  leftBtn.className = 'browse-solutions-nav browse-solutions-nav-left';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.type = 'button';
  rightBtn.className = 'browse-solutions-nav browse-solutions-nav-right';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const cardStep = 236; // 220 card + 16 gap
  const scrollBy = (dir) => track.scrollBy({ left: dir * cardStep, behavior: 'smooth' });
  leftBtn.addEventListener('click', () => scrollBy(-1));
  rightBtn.addEventListener('click', () => scrollBy(1));
  const keyHandler = (dir) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollBy(dir); }
  };
  leftBtn.addEventListener('keydown', keyHandler(-1));
  rightBtn.addEventListener('keydown', keyHandler(1));

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  block.appendChild(wrapper);
}
