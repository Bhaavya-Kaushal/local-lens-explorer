import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import heroImg from "@/assets/hero-alley.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Settings, Sparkles, MapPin, Compass, BookOpen, Wallet, Gem as GemIcon, Lightbulb } from "lucide-react";
import {
  generate, getKey, setKey, tripPrompt, gemsPrompt, moodPrompt, storyPrompt,
  mockTrip, mockGems, mockMood, mockStory, lore, budgetExperiences,
  type Trip, type Gem, type MoodSpot, type Story,
} from "@/lib/locallens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LOCAL LENS — Discover Beyond the Ordinary" },
      { name: "description", content: "AI-powered hyper-local guide to hidden gems, local folklore, mood-based spots and budget experiences." },
      { property: "og:title", content: "LOCAL LENS — Discover Beyond the Ordinary" },
      { property: "og:description", content: "Hidden gems, local lore and AI trip plans that mainstream travel apps overlook." },
    ],
  }),
  component: Index,
});

const MOODS = ["🌿 Quiet Escape", "🎨 Bohemian & Artsy", "☕ Cozy & Vintage", "⚡ Nocturnal & Electric"];
const TABS = [
  { id: "planner", label: "Trip Planner", icon: Compass },
  { id: "gems", label: "Hidden Gems", icon: GemIcon },
  { id: "lore", label: "Local Lore", icon: BookOpen },
  { id: "budget", label: "Budget Explorer", icon: Wallet },
] as const;
type Tab = (typeof TABS)[number]["id"];

const selectCls = "h-10 rounded-md border border-input bg-background/70 px-3 text-sm";

function Index() {
  const [tab, setTab] = useState<Tab>("planner");
  const [location, setLocation] = useState("Jaipur");
  const [mood, setMood] = useState<string | null>(null);
  const [moodSpots, setMoodSpots] = useState<MoodSpot[] | null>(null);
  const [moodLoading, setMoodLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  useEffect(() => setHasKey(!!getKey()), [settingsOpen]);

  const pickMood = async (m: string) => {
    setMood(m); setMoodLoading(true); setMoodSpots(null);
    const clean = m.replace(/^\S+\s/, "");
    const { data } = await generate(moodPrompt(location, clean), mockMood(clean));
    setMoodSpots(data); setMoodLoading(false);
  };

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden">
        <img src={heroImg} alt="Lantern-lit old town alley at sunset" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 text-hero-foreground">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display text-xl font-bold tracking-wide">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><MapPin className="h-5 w-5" /></span>
              LOCAL LENS
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" /> {hasKey ? "Live AI on" : "Add Gemini key"}
            </Button>
          </nav>
          <h1 className="mt-20 max-w-2xl text-5xl font-semibold leading-tight md:text-7xl">Discover Beyond the Ordinary</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">Hidden corners, local legends and artisan streets that mainstream travel apps overlook.</p>
          <div className="glass mt-8 flex max-w-2xl gap-2 rounded-2xl p-2 text-foreground">
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where are you exploring?" className="border-0 bg-transparent shadow-none" />
            <Button onClick={() => setTab("gems")}><Sparkles className="h-4 w-4" /> Explore</Button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button key={m} onClick={() => pickMood(m)}
                className={`rounded-full border px-4 py-2 text-sm backdrop-blur transition ${mood === m ? "border-primary bg-primary text-primary-foreground" : "border-hero-foreground/40 bg-hero-foreground/10 hover:bg-hero-foreground/20"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {(moodLoading || moodSpots) && (
          <section className="mb-12">
            <h2 className="text-3xl font-semibold">{mood} in {location}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {moodLoading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-2xl" />) :
                moodSpots!.map((s, i) => (
                  <div key={i} className="glass fade-up rounded-2xl p-5" style={{ animationDelay: `${i * 80}ms` }}>
                    <h3 className="text-xl font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.vibeDescription}</p>
                    <p className="mt-3 text-sm"><b>Do:</b> {s.activityRecommendation}</p>
                    <p className="mt-2 text-xs text-secondary">🎧 {s.bestAudioPairing}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button key={id} variant={tab === id ? "default" : "outline"} onClick={() => setTab(id)} className="rounded-full">
              <Icon className="h-4 w-4" /> {label}
            </Button>
          ))}
        </div>

        {tab === "planner" && <Planner location={location} />}
        {tab === "gems" && <Gems location={location} />}
        {tab === "lore" && <Lore />}
        {tab === "budget" && <Budget />}
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">LOCAL LENS · Travel slowly, look closely.</footer>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function Planner({ location }: { location: string }) {
  const [f, setF] = useState({ city: location, days: "2", budget: "Moderate", interests: "street food, heritage", style: "Solo" });
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => setF((p) => ({ ...p, city: location })), [location]);

  const run = async () => {
    setLoading(true); setTrip(null);
    const { data } = await generate(tripPrompt(f), mockTrip(f.city, Number(f.days)));
    setTrip(data); setLoading(false);
  };

  return (
    <section>
      <div className="glass grid gap-3 rounded-2xl p-5 md:grid-cols-6">
        <Input className="md:col-span-2" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Destination" />
        <select className={selectCls} value={f.days} onChange={(e) => setF({ ...f, days: e.target.value })}>
          {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
        </select>
        <select className={selectCls} value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })}>
          {["Budget", "Moderate", "Luxury"].map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className={selectCls} value={f.style} onChange={(e) => setF({ ...f, style: e.target.value })}>
          {["Solo", "Backpacker", "Couple", "Family"].map((b) => <option key={b}>{b}</option>)}
        </select>
        <Button onClick={run} disabled={loading}><Sparkles className="h-4 w-4" /> {loading ? "Planning…" : "Plan trip"}</Button>
        <Input className="md:col-span-6" value={f.interests} onChange={(e) => setF({ ...f, interests: e.target.value })} placeholder="Interests (street food, heritage, nature, art)" />
      </div>

      {loading && <div className="mt-6 space-y-4"><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>}
      {trip && (
        <div className="fade-up mt-8">
          <h2 className="text-4xl font-semibold">{trip.tripTitle}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{trip.summary}</p>
          <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{trip.estimatedTotalBudget}</span>
          <div className="mt-6 space-y-6">
            {trip.days.map((d) => (
              <div key={d.dayNumber} className="glass rounded-2xl p-6">
                <h3 className="text-2xl font-semibold"><span className="text-primary">Day {d.dayNumber}</span> · {d.theme}</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {d.activities.map((a, i) => (
                    <div key={i} className="rounded-xl border bg-background/60 p-4">
                      <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground"><span>{a.timeSlot}</span><span className="text-secondary">{a.category}</span></div>
                      <h4 className="mt-2 font-display text-lg font-semibold">{a.placeName}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                      <p className="mt-3 flex gap-1 text-sm"><Lightbulb className="h-4 w-4 shrink-0 text-primary" /> {a.insiderTip}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{a.approxCost} · {a.estimatedTimeSpent}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-secondary p-6 text-secondary-foreground">
            <h3 className="text-xl font-semibold">Local etiquette</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{trip.localEtiquetteTips.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  );
}

function Gems({ location }: { location: string }) {
  const [gems, setGems] = useState<Gem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true); setGems(null);
    const { data } = await generate(gemsPrompt(location), mockGems);
    setGems(data); setLoading(false);
  };
  useEffect(() => { run(); }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Hidden Gems Radar · {location}</h2>
        <Button variant="outline" onClick={run} disabled={loading}>Discover again</Button>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />) :
          gems?.map((g, i) => (
            <article key={i} className="glass fade-up flex flex-col rounded-2xl p-5" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-center justify-between text-xs">
                <span className="rounded-full bg-accent px-2 py-1 text-accent-foreground">{g.crowdLevel}</span>
                <span className="font-semibold text-primary">{g.budgetRating}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold">{g.name}</h3>
              <p className="text-xs text-muted-foreground">{g.neighborhood}</p>
              <p className="mt-2 italic">{g.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{g.whyVisit}</p>
              <div className="mt-auto pt-4">
                <div className="rounded-lg border border-dashed border-primary/50 p-3 text-sm"><b className="text-primary">Local secret:</b> {g.secretTip}</div>
                <p className="mt-2 text-xs text-muted-foreground">Best: {g.bestTimeToVisit}</p>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}

function Lore() {
  const [open, setOpen] = useState<(typeof lore)[number] | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const show = async (l: (typeof lore)[number]) => {
    setOpen(l); setStory(null);
    const { data } = await generate(storyPrompt(l.place, l.city), mockStory(l.place));
    setStory(data);
  };
  return (
    <section>
      <h2 className="text-3xl font-semibold">Local Lore & Stories</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {lore.map((l) => (
          <button key={l.place} onClick={() => show(l)} className="glass group rounded-2xl p-6 text-left transition hover:-translate-y-1">
            <BookOpen className="h-6 w-6 text-primary" />
            <h3 className="mt-4 text-xl font-semibold">{l.place}</h3>
            <p className="text-xs text-muted-foreground">{l.city}</p>
            <p className="mt-3 text-sm">{l.teaser}</p>
            <span className="mt-4 inline-block text-sm text-secondary group-hover:underline">Read the story →</span>
          </button>
        ))}
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">{open?.place}</DialogTitle><DialogDescription>{open?.city}</DialogDescription></DialogHeader>
          {!story ? <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : (
            <div className="fade-up space-y-4 text-sm">
              <div><h4 className="font-semibold text-primary">The Legend</h4><p>{story.legend}</p></div>
              <div><h4 className="font-semibold text-primary">The Forgotten Fact</h4><p>{story.forgottenFact}</p></div>
              <div><h4 className="font-semibold text-primary">Look Closely For</h4><p>{story.lookClosely}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Budget() {
  const [max, setMax] = useState(30);
  const items = useMemo(() => budgetExperiences.filter((b) => b.cost <= max), [max]);
  return (
    <section>
      <h2 className="text-3xl font-semibold">Budget Explorer</h2>
      <div className="glass mt-6 rounded-2xl p-6">
        <div className="flex gap-2">
          {[15, 30, 50].map((v) => <Button key={v} variant={max === v ? "default" : "outline"} onClick={() => setMax(v)} className="rounded-full">Under ${v}</Button>)}
        </div>
        <input type="range" min={5} max={50} value={max} onChange={(e) => setMax(Number(e.target.value))} className="mt-5 w-full accent-primary" />
        <p className="text-sm text-muted-foreground">Showing experiences up to <b className="text-foreground">${max}</b></p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((b) => (
          <div key={b.title} className="fade-up rounded-2xl border bg-card p-5">
            <span className="text-xs uppercase tracking-wider text-secondary">{b.tag}</span>
            <h3 className="mt-2 text-lg font-semibold">{b.title}</h3>
            <p className="mt-3 font-display text-2xl text-primary">${b.cost}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [val, setVal] = useState("");
  useEffect(() => { if (open) setVal(getKey()); }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Live AI settings</DialogTitle>
          <DialogDescription>Paste a Gemini API key for live recommendations. It's saved only in this browser. Without a key, sample data is shown.</DialogDescription>
        </DialogHeader>
        <Input type="password" value={val} onChange={(e) => setVal(e.target.value)} placeholder="AIza…" />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setKey(""); onOpenChange(false); }}>Clear</Button>
          <Button onClick={() => { setKey(val.trim()); onOpenChange(false); }}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
