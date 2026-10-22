const { test, expect } = require('@playwright/test');

async function ready(page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}
const offset = (page) => page.locator('.tools-track').evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).m41);
const phase = (page) => page.locator('.contact-orbit-card').first().evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).m41);

test('tools resume after keyboard activation while the original button stays focused', async ({ page }) => {
  await ready(page);
  await page.locator('.tools-marquee').scrollIntoViewIfNeeded();
  await page.locator('.tool-group').first().locator('button').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.locator('.tools-marquee')).toHaveAttribute('data-paused', 'true');
  await expect(page.locator('.tool-group').first().locator('[aria-pressed="true"]')).toHaveCount(1);
  await expect.poll(() => page.locator('.tools-marquee').getAttribute('data-paused'), { timeout: 5500 }).toBeNull();
  await expect(page.locator('.tool-group').first().locator('[aria-pressed="true"]')).toHaveCount(0);
  const before = await offset(page);
  await page.waitForTimeout(400);
  expect(await offset(page)).toBeLessThan(before - 5);
  expect(await page.evaluate(() => document.activeElement.classList.contains('tool-button'))).toBe(true);
});

test('touching a tool resets its appearance and restarts the loop without another tap', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8003/');
  await page.locator('.tools-marquee').scrollIntoViewIfNeeded();
  const tool = page.locator('.tool-group').first().locator('[data-tool="figma"] button');
  const bounds = await tool.boundingBox();
  await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await expect(tool).toHaveAttribute('aria-pressed', 'true');
  await tool.tap();
  await expect(tool).toHaveAttribute('aria-pressed', 'false');
  const reopened = await tool.boundingBox();
  await page.touchscreen.tap(reopened.x + reopened.width / 2, reopened.y + reopened.height / 2);
  await expect(tool).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => tool.getAttribute('aria-pressed'), { timeout: 5500 }).toBe('false');
  const before = await offset(page);
  await page.waitForTimeout(400);
  expect(await offset(page)).toBeLessThan(before - 5);
  await context.close();
});

test('CTA resumes after hold, drag, pointer cancellation and keyboard release, even while hovered/focused', async ({ page }) => {
  await ready(page);
  const orbit = page.locator('.contact-orbit');
  await orbit.scrollIntoViewIfNeeded();
  const r = await orbit.boundingBox();
  const x = r.x + r.width / 2, y = r.y + r.height / 2;
  await page.mouse.move(x, y);
  let before = await phase(page);
  await page.waitForTimeout(350);
  expect(Math.abs(await phase(page) - before)).toBeGreaterThan(3);
  await page.mouse.down();
  before = await phase(page);
  await page.waitForTimeout(400);
  expect(Math.abs(await phase(page) - before)).toBeLessThan(.1);
  await page.mouse.move(x + 90, y, { steps: 8 });
  expect(Math.abs(await phase(page) - before)).toBeGreaterThan(30);
  await page.mouse.up();
  before = await phase(page);
  await page.waitForTimeout(400);
  expect(Math.abs(await phase(page) - before)).toBeGreaterThan(3);
  await expect(orbit).not.toHaveAttribute('data-dragging', 'true');
  await page.mouse.down();
  await orbit.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' });
  await page.mouse.up();
  before = await phase(page);
  await page.waitForTimeout(400);
  expect(Math.abs(await phase(page) - before)).toBeGreaterThan(3);
  await orbit.focus();
  await page.keyboard.down('ArrowRight');
  before = await phase(page);
  await page.waitForTimeout(300);
  expect(Math.abs(await phase(page) - before)).toBeLessThan(.1);
  await page.keyboard.up('ArrowRight');
  before = await phase(page);
  await page.waitForTimeout(400);
  expect(Math.abs(await phase(page) - before)).toBeGreaterThan(3);
  await page.keyboard.press('Space');
  before = await phase(page);
  await page.waitForTimeout(300);
  expect(Math.abs(await phase(page) - before)).toBeLessThan(.1);
  await page.keyboard.press('Space');
});

test('CTA shows complete frames and unstretched full sprite artwork at phone and desktop widths', async ({ page }) => {
  for (const width of [320,390,779,1440,1920]) {
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    const orbit = page.locator('.contact-orbit');
    await orbit.scrollIntoViewIfNeeded();
    await orbit.focus();
    await page.keyboard.press('Space');
    for (let i = 0; i < 12; i++) {
      const metrics = await orbit.evaluate((root) => {
        const r = root.getBoundingClientRect();
        return [...root.querySelectorAll('.contact-orbit-card')].filter((c) => c.style.visibility === 'visible' && Number(c.style.opacity) > .02).map((c) => {
          const b = c.getBoundingClientRect();
          const art = c.querySelector('.contact-preview-art');
          return { left: b.left-r.left, right: r.right-b.right, top: b.top-r.top, bottom: r.bottom-b.bottom, artWidth: art.offsetWidth, artHeight: art.offsetHeight, clip: getComputedStyle(art).overflow };
        });
      });
      expect(metrics.length).toBeGreaterThanOrEqual(width < 600 ? 3 : 6);
      for (const m of metrics) {
        expect(Math.min(m.left,m.right,m.top,m.bottom)).toBeGreaterThanOrEqual(9);
        expect(Math.abs(m.artWidth-m.artHeight)).toBeLessThanOrEqual(1);
        expect(m.clip).toBe('hidden');
      }
      await page.keyboard.press('ArrowRight');
    }
  }
});

test('every main section fills one screen, cards fit both dimensions and filters keep their position', async ({ page }) => {
  const viewports = [[320,740],[360,740],[375,667],[390,844],[414,896],[600,960],[768,1024],[820,1180],[1024,768],[1280,720],[1366,768],[1440,766],[1440,800],[1440,900],[1536,758],[1920,948],[1920,1080],[2560,1440]];
  await ready(page);
  for (const [width,height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(100);
    const metrics=await page.locator('main > section').evaluateAll((sections) => sections.map((s) => ({ name:s.id||s.className, height:s.offsetHeight, screen:innerHeight-document.querySelector('header').offsetHeight })));
    for (const m of metrics) expect(Math.abs(m.height-m.screen),`${width}×${height} ${m.name}: ${m.height}/${m.screen}`).toBeLessThanOrEqual(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}×${height}`).toBe(true);
    const section=await page.locator('#portfolio').boundingBox();
    const gallery=await page.locator('.project-grid').evaluate(e=>({width:e.offsetWidth,shell:e.parentElement.offsetWidth}));
    expect(Math.abs(gallery.width-gallery.shell)).toBeLessThanOrEqual(1);
    for (const card of await page.locator('.project-card').all()) {
      const r=await card.boundingBox();
      expect(r.y+r.height).toBeLessThanOrEqual(section.y+section.height+1);
    }
  }
  await page.setViewportSize({width:1440,height:800});
  await page.locator('#portfolio').evaluate(e=>window.scrollTo({top:e.offsetTop-document.querySelector('header').offsetHeight,behavior:'instant'}));
  await page.waitForTimeout(1100);
  const headingPosition=()=>page.locator('.projects-heading').evaluate(e=>e.getBoundingClientRect().top-e.closest('#portfolio').getBoundingClientRect().top);
  const before=await headingPosition();
  for(const [category,count] of [['ui',2],['web',2],['photo',2],['all',6]]) {
    await page.locator(`[data-filter="${category}"]`).click();
    await expect(page.locator('.project-card:visible')).toHaveCount(count);
    const after=await headingPosition();
    expect(Math.abs(after-before)).toBeLessThan(1);
  }
});

test('no horizontal overflow on narrow screens, landscape, and 200% text; hero join stays clean', async ({ page }) => {
  await ready(page);
  for (const [width,height] of [[240,653],[280,700],[320,568],[390,844],[667,375],[844,390],[1024,600],[1440,766]]) {
    await page.setViewportSize({width,height});
    for (const scale of ['100%','200%']) {
      await page.evaluate((value)=>document.documentElement.style.fontSize=value,scale);
      await page.waitForTimeout(100);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}×${height} at ${scale}`).toBe(true);
    }
  }
  expect(await page.locator('.hero').evaluate((e)=>getComputedStyle(e).boxShadow)).toBe('none');
  expect(await page.locator('.services-section').evaluate((e)=>getComputedStyle(e).boxShadow)).toBe('none');
});

test('Work Experience is centered in its section on desktop and phone', async ({ page }) => {
  await ready(page);
  for (const [width,height] of [[390,844],[820,1180],[1440,766],[1920,1080]]) {
    await page.setViewportSize({width,height});
    await page.locator('#work-experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1100);
    const section=await page.locator('#work-experience').boundingBox();
    const content=await page.locator('.experience-grid').boundingBox();
    expect(Math.abs(content.x+content.width/2-width/2)).toBeLessThan(1);
    expect(Math.abs(content.y+content.height/2-section.y-section.height/2)).toBeLessThan(2);
  }
});

test('reduced motion, native contacts and anchors remain functional', async ({ page, browser }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await ready(page);
  await expect(page.locator('.contact-orbit')).toHaveAttribute('data-static','');
  await page.locator('.tools-marquee').scrollIntoViewIfNeeded();
  const before=await offset(page);await page.waitForTimeout(300);expect(await offset(page)).toBe(before);
  await page.locator('.artwork-link').click();
  await expect(page).toHaveURL(/#recent-projects$/);
  await expect(page.locator('.nav-link[aria-current="location"]')).toHaveAttribute('href','#portfolio');
  await expect(page.locator('.footer-contact')).toHaveCount(4);
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const nj=await nojs.newPage();await nj.goto('http://127.0.0.1:8003/');
  await expect(nj.locator('.footer-contact[href]')).toHaveCount(4);
  await expect(nj.locator('.orbit-fallback')).toBeVisible();
  await nojs.close();
});

test('custom certificate images remain whole and mobile touch dragging resumes automatically', async ({ browser }) => {
  const { readFileSync }=require('node:fs');
  const html=readFileSync('index.html','utf8')
    .replace('data-preview-source="projects"','data-preview-source="custom"')
    .replace('<template id="contact-custom-previews"></template>','<template id="contact-custom-previews"><figure><img src="./assets/logo.svg" alt="Example certificate" width="119" height="36"><figcaption>Example certificate</figcaption></figure></template>');
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();
  await page.route('http://127.0.0.1:8003/',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('http://127.0.0.1:8003/');
  const orbit=page.locator('.contact-orbit');
  await expect(page.locator('.contact-orbit-card')).toHaveCount(12);
  await expect(page.locator('.contact-orbit-card img').first()).toHaveAttribute('alt','Example certificate');
  expect(await page.locator('.contact-orbit-card img').first().evaluate(e=>getComputedStyle(e).objectFit)).toBe('contain');
  await orbit.scrollIntoViewIfNeeded();
  const r=await orbit.boundingBox();
  const cdp=await context.newCDPSession(page);
  const point={x:r.x+r.width/2,y:r.y+r.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
  let before=await phase(page);await page.waitForTimeout(300);
  expect(Math.abs(await phase(page)-before)).toBeLessThan(.1);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x+60,y:point.y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  before=await phase(page);await page.waitForTimeout(400);
  expect(Math.abs(await phase(page)-before)).toBeGreaterThan(1);
  await expect(orbit).not.toHaveAttribute('data-dragging','true');
  await context.close();
});

test('hero preview replays the same cinematic sequence used on the website', async ({ page }) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/preview/hero.html');
  const hero=page.frameLocator('#hero-preview').locator('.hero');
  await expect(hero).toHaveAttribute('data-hero-motion','cinematic');
  await expect(hero).toHaveAttribute('data-scene-state','running');
  await expect(hero).toHaveAttribute('data-scene-state','complete');
  await page.locator('[data-replay]').click();
  await expect(hero).toHaveAttribute('data-scene-state','running');
  expect(errors).toEqual([]);
});

test('a second click or Enter on the selected tool closes its name and resumes immediately', async ({ page }) => {
  await ready(page);
  await page.locator('.tools-marquee').scrollIntoViewIfNeeded();
  const tool=page.locator('.tool-group').first().locator('[data-tool="figma"] button');
  const bounds=await tool.boundingBox();
  await page.mouse.click(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
  await expect(tool).toHaveAttribute('aria-pressed','true');
  await tool.click();await expect(tool).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.tools-marquee')).not.toHaveAttribute('data-paused','true');
  await expect(page.locator('[data-tool="figma"] .tool-name').first()).toBeHidden();
  let before=await offset(page);await page.waitForTimeout(400);expect(await offset(page)).toBeLessThan(before-5);
  await tool.focus();await page.keyboard.press('Enter');
  await expect(tool).toHaveAttribute('aria-pressed','true');
  await page.keyboard.press('Enter');
  await expect(tool).toHaveAttribute('aria-pressed','false');
  before=await offset(page);await page.waitForTimeout(400);expect(await offset(page)).toBeLessThan(before-5);
});

test('scrollbar is hidden while wheel scrolling, section alignment and the footer remain usable', async ({ page }) => {
  await ready(page);
  expect(await page.locator('html').evaluate(e=>getComputedStyle(e).scrollbarWidth)).toBe('none');
  await page.mouse.wheel(0,700);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(600);
  await expect.poll(()=>page.locator('#services').evaluate(e=>Math.abs(e.getBoundingClientRect().top-document.querySelector('header').offsetHeight))).toBeLessThan(2);
  await page.locator('.nav-link[href="#portfolio"]').click();
  await expect.poll(()=>page.locator('#portfolio').evaluate(e=>Math.abs(e.getBoundingClientRect().top-document.querySelector('header').offsetHeight))).toBeLessThan(2);
  await page.locator('.site-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('.footer-copyright')).toBeInViewport();
  await expect(page.locator('.footer-contact').last()).toBeInViewport();
});

test('CTA advances a card within two seconds and cycles through custom collections larger than its physical ring', async ({ page }) => {
  const {readFileSync}=require('node:fs');
  const figures=Array.from({length:17},(_,i)=>`<figure><img src="./assets/logo.svg" alt="Certificate ${i}"><figcaption>Certificate ${i}</figcaption></figure>`).join('');
  const html=readFileSync('index.html','utf8').replace('data-preview-source="projects"','data-preview-source="custom"')
    .replace('<template id="contact-custom-previews"></template>',`<template id="contact-custom-previews">${figures}</template>`);
  await page.route('http://127.0.0.1:8003/',route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('/');
  const orbit=page.locator('.contact-orbit');
  await orbit.scrollIntoViewIfNeeded();
  const angle=()=>page.locator('.contact-orbit-card').first().evaluate(e=>Number(e.style.transform.match(/rotateY\((.*?)deg/)[1]));
  const before=await angle();await page.waitForTimeout(1950);
  expect(Math.abs(await angle()-before)).toBeGreaterThan(30);
  await orbit.focus();await page.keyboard.press('Space');
  const seen=new Set();
  for(let i=0;i<36;i++) {
    const indexes=await page.locator('.contact-orbit-card').evaluateAll(cards=>cards
      .filter(e=>!e.hidden&&e.style.visibility==='visible'&&Number(e.style.opacity)>.05)
      .map(e=>Number(e.dataset.sourceIndex)));
    indexes.forEach(index=>seen.add(index));
    await page.keyboard.press('ArrowRight');
  }
  expect([...seen].sort((a,b)=>a-b)).toEqual(Array.from({length:17},(_,i)=>i));
});
