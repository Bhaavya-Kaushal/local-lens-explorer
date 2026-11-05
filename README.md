# Local Lens Explorer

art 1: AI Integration Prompts (For your JS backend / API calls)

1. Master System Prompt

Put this in your API configuration or system instruction to set the AI's persona.

text

You are LOCAL LENS, an expert hyper-local guide and cultural storyteller. 

Your mission is to unveil off-the-beaten-path destinations, rich cultural folklore, and authentic local experiences that mainstream travel apps overlook. 

Guidelines:

- Prioritize indie, artisan, historical, and lesser-known local spots over crowded tourist traps.

- Always include practical local advice (best time to visit, etiquette, budget hacks).

- Be engaging, immersive, and culturally respectful.

- When generating structured data, always adhere strictly to the requested JSON schema.

2. Feature 1: AI Trip Planner Prompt (Returns JSON for UI rendering)

Use case: User submits location, days, budget, and interests in your UI.

text

Generate a personalized local travel itinerary based on the following preferences:

- Destination: {{city_or_region}}

- Duration: {{duration_e.g_2_days}}

- Budget Level: {{budget_level_e.g_budget_moderate_luxury}}

- Interests: {{interests_e.g_street_food_heritage_nature_art}}

- Travel Style: {{travel_style_e.g_solo_backpacker_family_couple}}

Output STRICTLY valid JSON with no markdown wrapping or extra text, following this schema:

{

  "tripTitle": "Short catchy title",

  "summary": "Brief 2-sentence vibe summary",

  "estimatedTotalBudget": "e.g. $40 - $60 / day",

  "days": [

    {

      "dayNumber": 1,

      "theme": "e.g. Artisans & Old Town Shadows",

      "activities": [

        {

          "timeSlot": "Morning / Afternoon / Evening",

          "placeName": "Name of the spot",

          "category": "Hidden Gem / Food / Culture / Scenic",

          "description": "What makes this special and local",

          "insiderTip": "A secret tip only locals know",

          "approxCost": "Cost estimate",

          "estimatedTimeSpent": "e.g. 1.5 hours"

        }

      ]

    }

  ],

  "localEtiquetteTips": [

    "Tip 1",

    "Tip 2"

  ]

}

3. Feature 2: Hidden Gems Discovery Prompt

Use case: User clicks "Discover Hidden Gems" near their location.

text

List 5 authentic, lesser-known, or secret spots in {{location}} that tourists rarely visit.

Return STRICTLY a JSON array with this schema:

[

  {

    "name": "Spot Name",

    "neighborhood": "Area or neighborhood name",

    "tagline": "One-line hook about this place",

    "whyVisit": "Why it outperforms mainstream alternatives",

    "secretTip": "Special timing, hidden corner, or secret item to order",

    "bestTimeToVisit": "e.g. Tuesday at sunset",

    "crowdLevel": "Quiet / Low / Moderate",

    "budgetRating": "$ / $$ / $$$"

  }

]

4. Feature 3: Mood-Based Explorer Prompt

Use case: User chooses moods like "Cozy & Reflective", "Electrifying & Vibrant", "Arty & Bohemian", or "Green & Tranquil".

text

Suggest 3 local spots in {{location}} that match the mood: "{{mood}}".

Return a JSON array with this schema:

[

  {

    "title": "Spot Name",

    "vibeDescription": "How this place embodies this specific mood",

    "activityRecommendation": "What the user should do there to soak in the vibe",

    "bestAudioPairing": "A musical genre or soundscape to listen to while there"

  }

]

5. Feature 4: Local Stories & Folklore Prompt

Use case: When a user views a specific attraction or landmark.

text

Tell an intriguing, historically grounded, yet bite-sized story or myth about:

Destination: {{place_or_landmark}}

Location: {{city}}

Keep it under 180 words. Divide it into:

1. "The Legend" (The myth or human-interest story behind it)

2. "The Forgotten Fact" (A quirky historical trivia point)

3. "Look Closely For" (A specific detail or carving/plaque visitors usually walk right past)

Part 2: Web App Generation Prompt (HTML/CSS/JS)

If you want an AI to build the complete frontend for LOCAL LENS, copy-paste this prompt:

text

Create a modern, responsive single-page web application for "LOCAL LENS" using semantic HTML5, modern CSS3 (glassmorphism/clean aesthetic, CSS variables, mobile-first), and vanilla JavaScript.

Key Requirements:

1. Navigation & Hero Section:

   - Modern brand logo, tagline "Discover Beyond the Ordinary", and an interactive search/filter bar (Location, Budget, Mood, Interests).

   - Quick mood selector pills (e.g., 🌿 Quiet Escape, 🎨 Bohemian & Artsy, ☕ Cozy & Vintage, ⚡ Nocturnal & Electric).

2. Core Features (Tabbed or Sectional UI):

   - AI Trip Planner: Form with inputs (Destination, Duration, Budget, Interests) generating a dynamic day-by-day itinerary card view.

   - Hidden Gems Radar: Grid cards showcasing offbeat places with "Local Secrets" tags and crowd levels.

   - Local Lore & Stories: Interactive flip-cards or expandable modals telling historical/cultural anecdotes about spots.

   - Budget Explorer: Filter slider showing what you can experience under $15, $30, or $50 locally.

3. Design & UI/UX:

   - Modern warm-earthy or neon-editorial travel palette (e.g., terracotta/emerald accents, dark or light mode support).

   - Loading skeletons and animated transitions when generating recommendations.

   - Mock API data fallback so the app is 100% functional out-of-the-box even before adding an active Gemini API key.

   - Settings modal to enter a custom Gemini API key for live AI generation.

Provide the solution in clean, well-commented code files: index.html, styles.css, and app.js.

Part 3: Quick Fetch Boilerplate for Vanilla JS

Add this snippet to your app.js to call the Gemini API:

javascript

async function callLocalLensAI(prompt, apiKey) {

const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const response = await fetch(endpoint, {

method: "POST",

headers: { "Content-Type": "application/json" },

body: JSON.stringify({

contents: [{ parts: [{ text: prompt }] }],

generationConfig: {

responseMimeType: "application/json" // forces valid JSON return

}

})

});

const data = await response.json();

return JSON.parse(data.candidates[0].content.parts[0].text);

}

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c55c092f-71ed-592c-ad3a-0bdf0362538f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
