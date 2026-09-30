/**
 * Records the real Kate Zoom app (npm run dev at the repo root must be running) as one clip per scene.
 * Output: public/rec/<scene>.webm + public/rec/marks.json (seconds into each clip where the useful part starts).
 *
 * Only the recording is touched, never the app: an init script hides payday wording ("payday", "End of the month")
 * and the "Link 1×" hint, and draws a tap ripple wherever we click.
 *
 *   npx tsx scripts/record.ts            # all scenes
 *   npx tsx scripts/record.ts energie    # one scene
 */
import { chromium, type Browser, type Page } from "playwright";
import { mkdirSync, readFileSync, renameSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const APP = "http://localhost:5180";
const API = "http://localhost:4000/api/me";
const OUT = path.resolve(import.meta.dirname, "../public/rec");
const VIEW = { width: 390, height: 844 };
const SCALE = 2;

const THOMAS = "demo-thomas";
const LIEN = "demo-lien";

async function api(token: string, p: string, body?: unknown) {
  const res = await fetch(`${API}${p}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${p} → ${res.status}`);
  return res.json();
}

async function fresh(token: string, date: string, push = false) {
  await api(token, "/consent", { enabled: true });
  await api(token, "/reset", {});
  await api(token, "/demo-date", { date });
  if (!push) {
    // Mark the pending push as delivered so it doesn't slide over the scene (1 push per 7 days).
    const n = await api(token, "/notification");
    if (n.notification) await api(token, "/notification/delivered", { insightId: n.notification.id });
  }
}

class Scene {
  t0 = Date.now();
  marks: Record<string, number> = {};
  constructor(public page: Page) {}
  mark(name: string) {
    this.marks[name] = (Date.now() - this.t0) / 1000;
  }
  wait(ms: number) {
    return this.page.waitForTimeout(ms);
  }
  async tap(text: string | RegExp, opts: { exact?: boolean; pause?: number } = {}) {
    const loc = this.page.getByText(text, { exact: opts.exact ?? false }).first();
    await loc.scrollIntoViewIfNeeded();
    await loc.click();
    await this.wait(opts.pause ?? 900);
  }
  async tapSel(selector: string, pause = 900) {
    await this.page.locator(selector).first().click();
    await this.wait(pause);
  }
  /** Smoothly scroll the app's scroll container. */
  async scroll(dy: number, ms = 1200) {
    await this.page.evaluate(({ dy }) => {
      const els = [...document.querySelectorAll<HTMLElement>(".overflow-y-auto")].filter((e) => e.offsetParent);
      els[els.length - 1]?.scrollBy({ top: dy, behavior: "smooth" });
    }, { dy });
    await this.wait(ms);
  }
  async scrollTop() {
    await this.page.evaluate(() => document.querySelectorAll<HTMLElement>(".overflow-y-auto").forEach((e) => e.scrollTo({ top: 0 })));
  }
}

async function record(browser: Browser, name: string, persona: string, run: (s: Scene) => Promise<void>) {
  const ctx = await browser.newContext({
    viewport: VIEW,
    deviceScaleFactor: SCALE,
    isMobile: true,
    hasTouch: false,
    recordVideo: { dir: OUT, size: { width: VIEW.width * SCALE, height: VIEW.height * SCALE } },
  });
  await ctx.addInitScript(`localStorage.setItem("kate-zoom-persona", ${JSON.stringify(persona)});`);
  await ctx.addInitScript({ path: path.join(import.meta.dirname, "inject.js") });
  const page = await ctx.newPage();
  const s = new Scene(page);
  await page.goto(APP);
  await page.getByText("For you").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  s.mark("ready");
  await run(s);
  s.mark("end");
  const video = page.video()!;
  await ctx.close();
  const file = path.join(OUT, `${name}.webm`);
  renameSync(await video.path(), file);
  console.log(`✓ ${name}`, s.marks);
  return s.marks;
}

const SCENES: Record<string, { persona: string; date: string; run: (s: Scene) => Promise<void> }> = {
  // Home → push arrives → Kate Zoom overview → scroll through all tips.
  meet: {
    persona: THOMAS,
    date: "2026-09-15",
    run: async (s) => {
      await s.wait(3200); // push slides in
      s.mark("push");
      await s.wait(1500);
      await s.tap("All messages", { pause: 1400 });
      s.mark("overview");
      await s.scroll(320, 1500);
      await s.scroll(320, 1500);
      await s.wait(500);
    },
  },
  energie: {
    persona: THOMAS,
    date: "2026-09-15",
    run: async (s) => {
      await s.tap("All messages", { pause: 700 });
      s.mark("overview");
      await s.tap("Engie → Bolt Energie", { pause: 1500 });
      s.mark("detail");
      await s.wait(1200);
      await s.scroll(260, 1600);
      s.mark("chart");
      await s.wait(900);
      await s.tap(/^Switch to Bolt/, { pause: 1600 });
      s.mark("consent");
      await s.tap(/^Mobile$/, { pause: 1100 });
      await s.tap(/^Go to /, { pause: 1600 });
      s.mark("provider");
      await s.scroll(500, 1400);
      await s.tapSel('input[type="checkbox"]', 600);
      await s.tap("Send request", { pause: 1700 });
      s.mark("sent");
      await s.tap("Back to KBC", { pause: 1500 });
      s.mark("done");
    },
  },
  // Contract-window moment only exists on 30 sep; the recorder hides the payday wording.
  verzekering: {
    persona: THOMAS,
    date: "2026-09-30",
    run: async (s) => {
      await s.tap("All messages", { pause: 700 });
      s.mark("overview");
      await s.tap("AG Insurance (auto) → KBC Autoverzekering", { pause: 1500 });
      s.mark("detail");
      await s.wait(1500);
      await s.scroll(260, 1600);
      await s.tap("Why am I seeing this?", { pause: 1200 });
      await s.scroll(300, 1800);
    },
  },
  boodschappen: {
    persona: THOMAS,
    date: "2026-09-15",
    run: async (s) => {
      await s.tap("All messages", { pause: 700 });
      s.mark("overview");
      await s.tap("Delhaize → Colruyt", { pause: 1500 });
      s.mark("detail");
      await s.wait(1500);
      await s.scroll(260, 1800);
    },
  },
  sony: {
    persona: THOMAS,
    date: "2026-09-30",
    run: async (s) => {
      await s.tap("All messages", { pause: 700 });
      s.mark("overview");
      await s.tap("Sony WH-1000XM5", { pause: 1500 });
      s.mark("detail");
      await s.wait(1800);
    },
  },
  streaming: {
    persona: THOMAS,
    date: "2026-09-15",
    run: async (s) => {
      await s.tap("All messages", { pause: 700 });
      s.mark("overview");
      await s.tap("3 streaming services", { pause: 1500 });
      s.mark("detail");
      await s.wait(1000);
      // Disney+ is preselected by Kate; the viewer adds Streamz.
      await s.tap("Streamz", { exact: true, pause: 1200 });
      s.mark("picked");
      await s.tap(/^Pause 2/, { pause: 1600 });
      s.mark("done");
    },
  },
  // Needs the energy switch accepted first (Al bespaard grows); run after "energie".
  beleggen: {
    persona: THOMAS,
    date: "",
    run: async (s) => {
      await s.tap("All messages", { pause: 900 });
      s.mark("overview");
      await s.tap("Already saved", { pause: 1300 });
      await s.tap(/^Bolero/, { pause: 300 });
      await s.page.evaluate("window.__hidePlatform = true");
      await s.scrollTop();
      await s.wait(600);
      s.mark("invest");
      await s.wait(1500);
      await s.scroll(330, 1500);
      await s.tap(/World ETF/, { pause: 900 });
      await s.tap("20 years", { exact: true, pause: 1800 });
      s.mark("projection");
      await s.scroll(400, 1300);
      await s.tap(/^Start investment plan|^Start .*plan/, { pause: 1800 });
      s.mark("started");
    },
  },
  // Lien: nothing to push, "You're on a good deal"; then one tap in Settings switches Kate Zoom off.
  vertrouwen: {
    persona: LIEN,
    date: "2026-09-15",
    run: async (s) => {
      await s.wait(1500);
      await s.tap("All messages", { pause: 1300 });
      s.mark("overview");
      await s.scroll(300, 1700);
      await s.tapSel('[aria-label="Back"]', 900);
      await s.tapSel('[aria-label="Settings"]', 1300);
      s.mark("settings");
      await s.tapSel('[role="switch"]', 2000);
      s.mark("off");
    },
  },
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const names = only.length ? only : Object.keys(SCENES);
  const marksFile = path.join(OUT, "marks.json");
  const marks: Record<string, Record<string, number>> = existsSync(marksFile) ? JSON.parse(readFileSync(marksFile, "utf8")) : {};
  // Without this flag the screencast is captured at CSS pixels, not @2x.
  const browser = await chromium.launch({ args: [`--force-device-scale-factor=${SCALE}`] });
  try {
    for (const name of names) {
      const sc = SCENES[name];
      if (!sc) throw new Error(`unknown scene ${name}`);
      if (sc.date) await fresh(sc.persona, sc.date, name === "meet");
      // Invest scene: make sure the energy switch counts as saved.
      if (name === "beleggen") {
        await fresh(THOMAS, "2026-09-15");
        await api(THOMAS, "/insights/engie-o-bolt/feedback", { action: "accept" });
      }
      marks[name] = await record(browser, name, sc.persona, sc.run);
      writeFileSync(marksFile, JSON.stringify(marks, null, 2));
    }
  } finally {
    await browser.close();
    // Leave the demo in its normal state.
    await api(LIEN, "/consent", { enabled: true }).catch(() => undefined);
    await fresh(THOMAS, "2026-09-30").catch(() => undefined);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
