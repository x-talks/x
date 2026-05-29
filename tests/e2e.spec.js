// @ts-check
/**
 * E2E Tests — Master Blog
 *
 * Run: npx playwright test tests/e2e.spec.js --reporter=list
 *
 * Covers:
 *  1. Thumbnail has CSS blur filter applied
 *  2. Intro overlay is full-screen (no overflow, no zoom) on desktop, tablet, mobile
 *  3. Skip button appears after play, video fully stops (no audio, no DOM node)
 *  4. Page body has no horizontal overflow on any viewport
 *  5. Media images fit within viewport (no zoom)
 */

const { test, expect, devices } = require('@playwright/test');
const path = require('path');

const PAGE_URL = `file://${path.resolve(__dirname, '../index.html')}`;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function openPage(browser, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
  return { page, ctx };
}

// ─── Test Suite ─────────────────────────────────────────────────────────────

test.describe('Intro Thumbnail', () => {

  test('thumbnail has blur filter applied', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    const filter = await page.$eval('#intro-thumbnail', el =>
      window.getComputedStyle(el).filter
    );

    // Must contain blur() with a non-zero value
    expect(filter).toMatch(/blur\([1-9]/);
  });

  test('thumbnail is visible on page load', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    const thumb = page.locator('#intro-thumbnail');
    await expect(thumb).toBeVisible();
  });

});

test.describe('Intro overlay — full screen, no zoom', () => {

  const viewports = [
    { name: 'desktop',  width: 1280, height: 800  },
    { name: 'tablet',   width: 768,  height: 1024 },
    { name: 'mobile',   width: 390,  height: 844  }, // iPhone 14
    { name: 'small',    width: 320,  height: 568  }, // iPhone SE
  ];

  for (const vp of viewports) {
    test(`overlay covers full viewport on ${vp.name} (${vp.width}x${vp.height})`, async ({ browser }) => {
      const { page, ctx } = await openPage(browser, { width: vp.width, height: vp.height });

      const box = await page.$eval('#intro-container', el => {
        const r = el.getBoundingClientRect();
        return { top: r.top, left: r.left, width: r.width, height: r.height };
      });

      // Overlay must fill the entire viewport — tolerance of 2px for subpixel rounding
      expect(box.top).toBeLessThanOrEqual(2);
      expect(box.left).toBeLessThanOrEqual(2);
      expect(box.width).toBeGreaterThanOrEqual(vp.width - 2);
      expect(box.height).toBeGreaterThanOrEqual(vp.height - 2);

      await ctx.close();
    });

    test(`no horizontal body overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ browser }) => {
      const { page, ctx } = await openPage(browser, { width: vp.width, height: vp.height });

      // Hide intro so we can check main page layout
      await page.evaluate(() => {
        const c = document.getElementById('intro-container');
        if (c) c.style.display = 'none';
        document.body.classList.remove('intro-active');
      });

      const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);

      await ctx.close();
    });

    test(`images fit within viewport on ${vp.name} (${vp.width}x${vp.height})`, async ({ browser }) => {
      const { page, ctx } = await openPage(browser, { width: vp.width, height: vp.height });

      await page.evaluate(() => {
        const c = document.getElementById('intro-container');
        if (c) c.style.display = 'none';
        document.body.classList.remove('intro-active');
      });

      const overflowingImages = await page.evaluate((vpWidth) => {
        return Array.from(document.images)
          .filter(img => img.getBoundingClientRect().right > vpWidth + 2)
          .map(img => img.src);
      }, vp.width);

      expect(overflowingImages).toHaveLength(0);

      await ctx.close();
    });
  }

});

test.describe('Skip button — video fully stops', () => {

  test('skip button is hidden before play', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    const opacity = await page.$eval('#skip-intro', el =>
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBe(0);
  });

  test('skip button appears after clicking play', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    // Click play (video src will fail in file:// context but JS still runs)
    await page.click('#play-icon');

    const skipVisible = await page.$eval('#skip-intro', el =>
      el.classList.contains('visible')
    );
    expect(skipVisible).toBe(true);
  });

  test('clicking skip removes video element from DOM', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await page.click('#play-icon');
    await page.waitForTimeout(100);
    await page.click('#skip-intro');
    await page.waitForTimeout(700); // wait for hide animation (600ms)

    const videoExists = await page.$('video');
    expect(videoExists).toBeNull();
  });

  test('clicking skip hides intro container', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await page.click('#play-icon');
    await page.waitForTimeout(100);
    await page.click('#skip-intro');
    await page.waitForTimeout(700);

    const display = await page.$eval('#intro-container', el =>
      window.getComputedStyle(el).display
    );
    expect(display).toBe('none');
  });

  test('after skip, body no longer has intro-active class', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });

    await page.click('#play-icon');
    await page.waitForTimeout(100);
    await page.click('#skip-intro');
    await page.waitForTimeout(700);

    const hasClass = await page.$eval('body', el => el.classList.contains('intro-active'));
    expect(hasClass).toBe(false);
  });

});
