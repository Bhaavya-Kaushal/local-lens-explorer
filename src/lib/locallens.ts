// LOCAL LENS — prompts, Gemini client, and mock fallbacks.

export const SYSTEM_PROMPT = `You are LOCAL LENS, an expert hyper-local guide and cultural storyteller.
Your mission is to unveil off-the-beaten-path destinations, rich cultural folklore, and authentic local experiences that mainstream travel apps overlook.
Guidelines:
- Prioritize indie, artisan, historical, and lesser-known local spots over crowded tourist traps.
- Always include practical local advice (best time to visit, etiquette, budget hacks).
- Be engaging, immersive, and culturally respectful.
- When generating structured data, always adhere strictly to the requested JSON schema.`;

export type Activity = {
  timeSlot: string; placeName: string; category: string; description: string;
  insiderTip: string; approxCost: string; estimatedTimeSpent: string;
};
export type Trip = {
  tripTitle: string; summary: string; estimatedTotalBudget: string;
  days: { dayNumber: number; theme: string; activities: Activity[] }[];
  localEtiquetteTips: string[];
};
export type Gem = {
  name: string; neighborhood: string; tagline: string; whyVisit: string;
  secretTip: string; bestTimeToVisit: string; crowdLevel: string; budgetRating: string;
};
export type MoodSpot = { title: string; vibeDescription: string; activityRecommendation: string; bestAudioPairing: string };
export type Story = { legend: string; forgottenFact: string; lookClosely: string };

export const tripPrompt = (p: { city: string; days: string; budget: string; interests: string; style: string }) =>
  `Generate a personalized local travel itinerary based on the following preferences:
- Destination: ${p.city}
- Duration: ${p.days} days
- Budget Level: ${p.budget}
- Interests: ${p.interests}
- Travel Style: ${p.style}
Output STRICTLY valid JSON with no markdown wrapping or extra text, following this schema:
{"tripTitle":"Short catchy title","summary":"Brief 2-sentence vibe summary","estimatedTotalBudget":"e.g. $40 - $60 / day","days":[{"dayNumber":1,"theme":"e.g. Artisans & Old Town Shadows","activities":[{"timeSlot":"Morning / Afternoon / Evening","placeName":"Name of the spot","category":"Hidden Gem / Food / Culture / Scenic","description":"What makes this special and local","insiderTip":"A secret tip only locals know","approxCost":"Cost estimate","estimatedTimeSpent":"e.g. 1.5 hours"}]}],"localEtiquetteTips":["Tip 1","Tip 2"]}`;

export const gemsPrompt = (location: string) =>
  `List 5 authentic, lesser-known, or secret spots in ${location} that tourists rarely visit.
Return STRICTLY a JSON array with this schema:
[{"name":"Spot Name","neighborhood":"Area or neighborhood name","tagline":"One-line hook about this place","whyVisit":"Why it outperforms mainstream alternatives","secretTip":"Special timing, hidden corner, or secret item to order","bestTimeToVisit":"e.g. Tuesday at sunset","crowdLevel":"Quiet / Low / Moderate","budgetRating":"$ / $$ / $$$"}]`;

export const moodPrompt = (location: string, mood: string) =>
  `Suggest 3 local spots in ${location} that match the mood: "${mood}".
Return a JSON array with this schema:
[{"title":"Spot Name","vibeDescription":"How this place embodies this specific mood","activityRecommendation":"What the user should do there to soak in the vibe","bestAudioPairing":"A musical genre or soundscape to listen to while there"}]`;

export const storyPrompt = (place: string, city: string) =>
  `Tell an intriguing, historically grounded, yet bite-sized story or myth about:
Destination: ${place}
Location: ${city}
Keep it under 180 words. Return STRICTLY JSON: {"legend":"The myth or human-interest story behind it","forgottenFact":"A quirky historical trivia point","lookClosely":"A specific detail or carving/plaque visitors usually walk right past"}`;

const KEY = "locallens_gemini_key";
export const getKey = () => (typeof window === "undefined" ? "" : localStorage.getItem(KEY) ?? "");
export const setKey = (k: string) => (k ? localStorage.setItem(KEY, k) : localStorage.removeItem(KEY));

export async function callLocalLensAI<T>(prompt: string, apiKey: string): Promise<T> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.candidates[0].content.parts[0].text) as T;
}

/** Uses Gemini when a key is saved, otherwise returns mock data after a short delay. */
export async function generate<T>(prompt: string, mock: T): Promise<{ data: T; live: boolean }> {
  const key = getKey();
  if (key) {
    try { return { data: await callLocalLensAI<T>(prompt, key), live: true }; }
    catch (e) { console.warn("Falling back to mock data", e); }
  }
  await new Promise((r) => setTimeout(r, 900));
  return { data: mock, live: false };
}

// ---------- Mock data ----------
export const mockTrip = (city: string, days: number): Trip => ({
  tripTitle: `${city}, Off the Map`,
  summary: `Slow mornings in artisan lanes and evenings where locals actually eat. ${city} as its neighbours know it.`,
  estimatedTotalBudget: "$35 - $55 / day",
  days: Array.from({ length: Math.max(1, Math.min(days, 5)) }, (_, i) => ({
    dayNumber: i + 1,
    theme: ["Artisans & Old Town Shadows", "Markets, Murals & Monsoon Tea", "River Ghats & Forgotten Shrines", "Back-Alley Bites", "Hills at Golden Hour"][i] ?? "Wandering Day",
    activities: [
      { timeSlot: "Morning", placeName: "The Brass-Beaters' Lane", category: "Culture", description: "Third-generation metalsmiths hammer vessels by hand in open-front workshops.", insiderTip: "Arrive before 9am — the elders work then and love explaining patterns.", approxCost: "Free", estimatedTimeSpent: "1.5 hours" },
      { timeSlot: "Afternoon", placeName: "Grandma's Courtyard Kitchen", category: "Food", description: "A family home serving a single rotating thali at lunchtime only.", insiderTip: "Ask for the pickle of the week; it's not on the board.", approxCost: "$4", estimatedTimeSpent: "1 hour" },
      { timeSlot: "Evening", placeName: "Stepwell Steps at Dusk", category: "Hidden Gem", description: "A half-forgotten stepwell where kids fly kites as the light turns copper.", insiderTip: "Sit on the eastern steps — they catch the last sun.", approxCost: "$1", estimatedTimeSpent: "1 hour" },
    ],
  })),
  localEtiquetteTips: ["Remove shoes before entering homes and shrines.", "Bargain with a smile, never at fixed-price artisan co-ops.", "Ask before photographing people at work."],
});

export const mockGems: Gem[] = [
  { name: "The Inkwell Bookbinders", neighborhood: "Old Quarter", tagline: "Where paper is still sewn by candlelight.", whyVisit: "A living craft workshop instead of a souvenir shop.", secretTip: "Buy offcut notebooks from the back shelf for a fraction.", bestTimeToVisit: "Wednesday mornings", crowdLevel: "Quiet", budgetRating: "$" },
  { name: "Rooftop Chai Cooperative", neighborhood: "Spice Bazaar", tagline: "Tea with a view nobody posts about.", whyVisit: "Sunset over domes without the rooftop-bar markup.", secretTip: "Order the cardamom-salt chai.", bestTimeToVisit: "Tuesday at sunset", crowdLevel: "Low", budgetRating: "$" },
  { name: "Banyan Hollow Garden", neighborhood: "Cantonment", tagline: "A colonial garden reclaimed by roots.", whyVisit: "Shade, birdsong, and zero tour buses.", secretTip: "Find the 1890s sundial hidden behind the gazebo.", bestTimeToVisit: "Early morning", crowdLevel: "Quiet", budgetRating: "$" },
  { name: "Night Noodle Alley", neighborhood: "Railway Colony", tagline: "Woks fire up after the last train.", whyVisit: "Cheaper, tastier and more local than the food court.", secretTip: "Stall #4 makes an off-menu chilli oil.", bestTimeToVisit: "After 10pm", crowdLevel: "Moderate", budgetRating: "$" },
  { name: "The Weavers' Loft", neighborhood: "Riverside", tagline: "Handlooms clatter above a quiet canal.", whyVisit: "Buy directly from the weaver — fair and unique.", secretTip: "Ask to try the loom yourself.", bestTimeToVisit: "Saturday afternoon", crowdLevel: "Low", budgetRating: "$$" },
];

export const mockMood = (mood: string): MoodSpot[] => [
  { title: "Lantern Courtyard Café", vibeDescription: `A walled courtyard that wraps you in the "${mood}" feeling the moment you step in.`, activityRecommendation: "Order something slow and sketch the arches.", bestAudioPairing: "Lo-fi jazz" },
  { title: "The Old Observatory Steps", vibeDescription: "Weathered stone and wide skies; time seems to stretch here.", activityRecommendation: "Watch the city lights switch on one by one.", bestAudioPairing: "Ambient field recordings" },
  { title: "Back-Lane Record Room", vibeDescription: "Crate-digging among vintage vinyl in a converted garage.", activityRecommendation: "Ask the owner for their personal pick.", bestAudioPairing: "Vintage Bollywood funk" },
];

export const mockStory = (place: string): Story => ({
  legend: `Locals say ${place} was built overnight by a stonemason who promised his daughter a place where the moon could rest. When dawn broke, one stone was missing — he'd run out of night.`,
  forgottenFact: "In the 1920s, it briefly served as the town's post office; letters were sorted on the altar steps.",
  lookClosely: "On the north pillar, a tiny carved crescent marks the stone the mason never placed.",
});

export const lore = [
  { place: "The Moonless Gate", city: "Old City", teaser: "A gate built overnight — almost." },
  { place: "Weeping Banyan", city: "Cantonment", teaser: "A tree that sheds tears in May." },
  { place: "The Silent Clocktower", city: "Market Square", teaser: "Stopped at 4:17 for a century." },
  { place: "Sailor's Shrine", city: "Harbour", teaser: "Offerings of salt and rope." },
];

export const budgetExperiences = [
  { title: "Dawn walk + chai on a ghat", cost: 2, tag: "Scenic" },
  { title: "Street-food crawl, 5 stalls", cost: 8, tag: "Food" },
  { title: "Block-printing mini-workshop", cost: 14, tag: "Craft" },
  { title: "Heritage cycle tour with a local historian", cost: 22, tag: "Culture" },
  { title: "Home-cooked dinner with a family", cost: 28, tag: "Food" },
  { title: "Pottery class + take-home bowl", cost: 35, tag: "Craft" },
  { title: "Sunset boat ride with folk musicians", cost: 45, tag: "Scenic" },
  { title: "Private tasting at a spice estate", cost: 50, tag: "Food" },
];
