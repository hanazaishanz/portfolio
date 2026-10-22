const { test, expect } = require('@playwright/test');

async function loadHero(page) {
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveAttribute('data-motion-ready', 'true');
}

async function settledEntrance(page) {
  await expect.poll(() => page.locator('.hero').evaluate(e => e.getAnimations({subtree:true}).length)).toBe(0);
}

async function translation(page, selector) {
  return page.locator(selector).evaluate(e => {
    const m = new DOMMatrixReadOnly(getComputedStyle(e).transform);
    return {x:m.m41, y:m.m42};
  });
}

test('hero title enters in stages and ends at the original responsive layout', async ({ page }) => {
  await loadHero(page);
  const stages = await page.locator('.hero').evaluate(hero => {
    const title = ['hero-title-better','hero-title-call','hero-title-name'];
    return title.map(name => {
      const animation=hero.querySelector(`.${name}`).getAnimations()[0];
      return animation?.effect.getTiming().delay;
    });
  });
  expect(stages[0]).toBeLessThan(stages[1]);
  expect(stages[1]).toBeLessThan(stages[2]);
  await settledEntrance(page);
  const finalLayout=await page.locator('.hero').evaluate(hero => {
    return [...hero.querySelectorAll('.hero-portrait,.hero-title,.hero-description,.artwork-link')].map(e => {
      const r=e.getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height};
    });
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await expect(page.locator('.hero')).toHaveAttribute('data-motion-ready','true');
  const staticLayout=await page.locator('.hero').evaluate(hero => {
    return [...hero.querySelectorAll('.hero-portrait,.hero-title,.hero-description,.artwork-link')].map(e => {
      const r=e.getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height};
    });
  });
  expect(finalLayout).toEqual(staticLayout);
});

test('parallax has distinct depths, returns to neutral and stops offscreen', async ({ page }) => {
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await loadHero(page);
  await settledEntrance(page);
  const hero=page.locator('.hero');
  const r=await hero.boundingBox();
  await page.mouse.move(r.x+r.width*.8,r.y+r.height*.7,{steps:8});
  await expect.poll(async () => (await translation(page,'.hero-portrait-art')).x).toBeGreaterThan(3);
  const art=await translation(page,'.hero-portrait-art');
  const circle=await translation(page,'.hero-orbit');
  expect(circle.x).toBeLessThan(-6);
  expect(Math.abs(circle.x/art.x)).toBeCloseTo(2,0);
  expect(art.y).toBeGreaterThanOrEqual(0);
  expect(art.x).toBeLessThanOrEqual(7);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.mouse.move(2,2);
  await expect.poll(()=>page.locator('.hero-portrait-art').evaluate(e=>e.style.transform)).toBe('');
  expect(await page.locator('.hero-orbit').evaluate(e=>e.style.transform)).toBe('');

  await page.mouse.move(r.x+r.width*.8,r.y+r.height*.7);
  await expect.poll(async () => (await translation(page,'.hero-portrait-art')).x).toBeGreaterThan(1);
  await page.locator('#portfolio').scrollIntoViewIfNeeded();
  await expect.poll(()=>page.locator('.hero-portrait-art').evaluate(e=>e.style.transform)).toBe('');
  await page.evaluate(() => {
    window.heroWrites=0;
    new MutationObserver(records=>window.heroWrites+=records.length)
      .observe(document.querySelector('.hero-portrait-art'),{attributes:true,attributeFilter:['style']});
  });
  await page.waitForTimeout(250);
  expect(await page.evaluate(()=>window.heroWrites)).toBe(0);
  expect(errors).toEqual([]);
});

test('phone entrance preserves one screen, touch scrolling and native artwork navigation', async ({ browser }) => {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:8003/');
  await expect(page.locator('.hero')).toHaveAttribute('data-motion-ready','true');
  await settledEntrance(page);
  const photo=await page.locator('.hero-portrait').boundingBox();
  await page.touchscreen.tap(photo.x+photo.width/2,photo.y+photo.height/2);
  expect(await page.locator('.hero-portrait-art').evaluate(e=>e.style.transform)).toBe('');
  expect(await page.locator('.hero-orbit').evaluate(e=>e.style.transform)).toBe('');
  expect(await page.locator('.hero').evaluate(e=>e.offsetHeight)).toBe(780);
  await page.locator('.artwork-link').tap();
  await expect(page).toHaveURL(/#recent-projects$/);
  await expect(page.locator('.nav-link[aria-current="location"]')).toHaveAttribute('href','#portfolio');
  await context.close();
});

test('reduced motion cancels parallax immediately, and content remains visible without JavaScript', async ({ page, browser }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await loadHero(page);
  expect(await page.locator('.hero').evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
  expect(await page.locator('.hero-description').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
  const r=await page.locator('.hero').boundingBox();
  await page.mouse.move(r.width*.8,r.y+r.height*.7);
  expect(await page.locator('.hero-portrait-art').evaluate(e=>e.style.transform)).toBe('');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.mouse.move(r.width*.7,r.y+r.height*.7);
  await expect.poll(async ()=>(await translation(page,'.hero-portrait-art')).x).toBeGreaterThan(1);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>page.locator('.hero-portrait-art').evaluate(e=>e.style.transform)).toBe('');
  expect(await page.locator('.hero').evaluate(e=>e.getAnimations({subtree:true}).length)).toBe(0);
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const nj=await nojs.newPage();await nj.goto('http://127.0.0.1:8003/');
  await expect(nj.locator('.hero-description')).toBeVisible();
  await expect(nj.locator('.hero-photo')).toBeVisible();
  await expect(nj.locator('.artwork-link')).toBeVisible();
  await nojs.close();
});
