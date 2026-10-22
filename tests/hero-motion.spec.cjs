const { test, expect } = require('@playwright/test');

async function loadHero(page) {
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveAttribute('data-motion-ready', 'true');
  await expect(page.locator('.hero')).toHaveAttribute('data-scene-state', 'running');
}
async function sampleAt(page, time) {
  return page.locator('.hero').evaluate((hero, time) => {
    hero.getAnimations({subtree:true}).forEach(a => { a.pause(); a.currentTime=time; });
    const title=hero.querySelector('.hero-title').getBoundingClientRect();
    const opacity=selector=>Number(getComputedStyle(hero.querySelector(selector)).opacity);
    return {centerX:title.x+title.width/2,centerY:title.y+title.height/2,
      expectedY:hero.getBoundingClientRect().top+hero.offsetHeight/2,
      photo:opacity('.hero-photo'),circle:opacity('.hero-portrait-circle'),
      copy:opacity('.hero-description'),button:opacity('.artwork-link')};
  }, time);
}

test('cinematic opening holds the title in the center, then reveals the portrait before supporting elements', async ({ page }) => {
  await loadHero(page);
  const first=await sampleAt(page,500);
  expect(Math.abs(first.centerX-720)).toBeLessThan(1);
  expect(Math.abs(first.centerY-first.expectedY)).toBeLessThan(1);
  expect([first.photo,first.circle,first.copy,first.button]).toEqual([0,0,0,0]);
  const next=await sampleAt(page,1650);
  expect(next.photo).toBeGreaterThan(0);
  expect([next.circle,next.copy,next.button]).toEqual([0,0,0]);
  expect(next.centerX).toBeGreaterThan(first.centerX+100);
  await page.locator('.hero').evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>a.finish()));
  await expect(page.locator('.hero')).toHaveAttribute('data-scene-state','complete');
  const layout=()=>page.locator('.hero').evaluate(hero=>[...hero.querySelectorAll('.hero-portrait,.hero-title,.hero-description,.artwork-link')].map(e=>{
    const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,opacity:getComputedStyle(e).opacity};
  }));
  const final=await layout();
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  await expect(page.locator('.hero')).toHaveAttribute('data-motion-ready','true');
  expect(await layout()).toEqual(final);
});

test('resize and user interaction finish the opening immediately without hidden content or a second intro', async ({ page }) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await loadHero(page);
  await page.setViewportSize({width:1280,height:720});
  await expect(page.locator('.hero')).toHaveAttribute('data-scene-state','complete');
  for(const selector of ['.hero-title','.hero-photo','.hero-description','.artwork-link']) {
    expect(await page.locator(selector).evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
  }
  await page.reload();await expect(page.locator('.hero')).toHaveAttribute('data-scene-state','running');
  await page.keyboard.press('Escape');
  await expect(page.locator('.hero')).toHaveAttribute('data-scene-state','complete');
  await page.locator('#portfolio').scrollIntoViewIfNeeded();
  await page.locator('#about').scrollIntoViewIfNeeded();
  expect(await page.locator('.hero').evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
  expect(errors).toEqual([]);
});

test('phone opening centers the title within the viewport and keeps artwork navigation functional', async ({ browser }) => {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:8003/');
  await expect(page.locator('.hero')).toHaveAttribute('data-scene-state','running');
  const first=await sampleAt(page,500);
  expect(Math.abs(first.centerX-195)).toBeLessThan(1);
  expect(Math.abs(first.centerY-first.expectedY)).toBeLessThan(1);
  await page.locator('.hero').tap({position:{x:20,y:20}});
  await expect(page.locator('.hero')).toHaveAttribute('data-scene-state','complete');
  expect(await page.locator('.hero').evaluate(e=>e.offsetHeight)).toBe(780);
  await page.locator('.artwork-link').tap();
  await expect(page).toHaveURL(/#recent-projects$/);
  await expect(page.locator('.nav-link[aria-current="location"]')).toHaveAttribute('href','#portfolio');
  await context.close();
});

test('reduced motion cancels the scene immediately; no JavaScript leaves the content visible', async ({ page, browser }) => {
  await loadHero(page);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.hero')).toHaveAttribute('data-scene-state','complete');
  expect(await page.locator('.hero').evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
  await page.reload();
  await expect(page.locator('.hero')).toHaveAttribute('data-motion-ready','true');
  expect(await page.locator('.hero-description').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const nj=await nojs.newPage();await nj.goto('http://127.0.0.1:8003/');
  for(const selector of ['.hero-title','.hero-photo','.hero-description','.artwork-link']) await expect(nj.locator(selector)).toBeVisible();
  await nojs.close();
});
