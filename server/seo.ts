const SITE_URL = process.env.SITE_URL || "https://thecodex.app";

interface RouteMeta {
  title: string;
  description: string;
  ogType: string;
  jsonLd: object;
  noscriptContent: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "The Codex | Blood on the Clocktower Character Reference",
    description:
      "The Codex is your complete Blood on the Clocktower companion app. Browse characters, abilities, scripts, and strategies for Trouble Brewing, Bad Moon Rising, and Sects & Violets.",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "The Codex",
      url: SITE_URL,
      description:
        "A Blood on the Clocktower character reference and game companion app covering all official scripts and experimental characters.",
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      about: {
        "@type": "Thing",
        name: "Blood on the Clocktower",
        description:
          "A social deduction tabletop game by The Pandemonium Institute.",
      },
    },
    noscriptContent: `
      <h1>The Codex — Blood on the Clocktower Reference</h1>
      <p>The Codex is your complete companion for Blood on the Clocktower, the hidden-role social deduction game. Browse characters, abilities, and strategies for every official script.</p>
      <ul>
        <li><a href="/introduction">How to Play Blood on the Clocktower</a> — A beginner's guide to the game.</li>
        <li><a href="/reference">Character Reference</a> — Browse all characters, abilities, and scripts.</li>
        <li><a href="/game">Player Tracker</a> — Track players and votes during a game.</li>
      </ul>
    `,
  },
  "/reference": {
    title: "Character Reference | The Codex – Blood on the Clocktower",
    description:
      "Browse every Blood on the Clocktower character by script and team. Includes abilities, night order, tips, bluffing strategies, jinx interactions, and Storyteller guidance for Trouble Brewing, Bad Moon Rising, Sects & Violets, and experimental characters.",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Blood on the Clocktower Character Reference",
      url: `${SITE_URL}/reference`,
      description:
        "A complete reference for every Blood on the Clocktower character, covering abilities, strategies, jinx interactions, and Storyteller tips across all official scripts.",
      about: {
        "@type": "Thing",
        name: "Blood on the Clocktower Characters",
      },
      isPartOf: {
        "@type": "WebSite",
        name: "The Codex",
        url: SITE_URL,
      },
    },
    noscriptContent: `
      <h1>Blood on the Clocktower Character Reference</h1>
      <p>Browse every character in Blood on the Clocktower. Filter by script — Trouble Brewing, Bad Moon Rising, Sects &amp; Violets — or by team (Townsfolk, Outsiders, Minions, Demons, Travelers, Fabled). Each entry includes the character's ability, night order position, tips and tricks, bluffing strategies, and jinx interactions.</p>
      <h2>Official Scripts</h2>
      <ul>
        <li><strong>Trouble Brewing</strong> — The introductory script. Recommended for new players.</li>
        <li><strong>Bad Moon Rising</strong> — A harder script with powerful demons and protective characters.</li>
        <li><strong>Sects &amp; Violets</strong> — A complex script filled with information and manipulation.</li>
      </ul>
      <h2>Character Teams</h2>
      <ul>
        <li><strong>Townsfolk</strong> — Good team. Use their abilities to find the demon.</li>
        <li><strong>Outsiders</strong> — Good team, but their abilities often hinder the good team.</li>
        <li><strong>Minions</strong> — Evil team. Support the demon and mislead the town.</li>
        <li><strong>Demons</strong> — Evil team. Kill at night and avoid being executed.</li>
      </ul>
    `,
  },
  "/introduction": {
    title: "How to Play Blood on the Clocktower | The Codex",
    description:
      "New to Blood on the Clocktower? This beginner's guide explains how the game works: the two teams, night and day phases, what makes it different from other hidden-role games, and tips to get started.",
    ogType: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "How to Play Blood on the Clocktower",
      headline: "How to Play Blood on the Clocktower",
      url: `${SITE_URL}/introduction`,
      description:
        "A beginner's guide to Blood on the Clocktower: the two teams, night and day phases, what makes it unique among social deduction games, and tips to get started.",
      about: {
        "@type": "Game",
        name: "Blood on the Clocktower",
      },
      isPartOf: {
        "@type": "WebSite",
        name: "The Codex",
        url: SITE_URL,
      },
    },
    noscriptContent: `
      <h1>How to Play Blood on the Clocktower</h1>
      <p>Blood on the Clocktower is a social deduction game for 5–20 players set in the cursed town of Ravenswood Bluff. One player is the Storyteller — a neutral referee — while the rest are secretly divided into two teams: <strong>Good</strong> and <strong>Evil</strong>.</p>
      <h2>The Two Teams</h2>
      <p>Good players (Townsfolk and Outsiders) try to identify and execute the Demon before it kills everyone. Evil players (Minions and the Demon) lie, mislead, and kill to prevent this.</p>
      <h2>How a Game Plays Out</h2>
      <p>The game alternates between <strong>Night</strong> and <strong>Day</strong> phases. At night, the Demon (and some Minions) secretly kill. During the day, players discuss, share information, and vote to execute a player they suspect is evil.</p>
      <h2>What Makes It Different</h2>
      <ul>
        <li>Information can be wrong — the Storyteller may give false information to keep the game balanced.</li>
        <li>Dead players stay in the game — they can still talk and cast one ghost vote.</li>
        <li>The Storyteller plays too — they make rulings and keep the game fair and fun.</li>
      </ul>
      <p><a href="/reference">Browse the Character Reference</a> to learn about every role in the game.</p>
    `,
  },
  "/game": {
    title: "Player Tracker | The Codex – Blood on the Clocktower",
    description:
      "Track players, claims, nominations, and votes during a Blood on the Clocktower game. A note-taking companion tool for both players and Storytellers.",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Blood on the Clocktower Player Tracker",
      url: `${SITE_URL}/game`,
      description:
        "An interactive companion tool for Blood on the Clocktower that tracks players, claims, nominations, vote records, and game state during live play.",
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      isPartOf: {
        "@type": "WebSite",
        name: "The Codex",
        url: SITE_URL,
      },
    },
    noscriptContent: `
      <h1>Blood on the Clocktower Player Tracker</h1>
      <p>The Player Tracker is an in-game companion tool for Blood on the Clocktower. It helps you record player names, track alive and dead status, log character claims, record nominations and vote counts, and follow the Chopping Block.</p>
      <h2>Features</h2>
      <ul>
        <li>Player setup wizard with name entry and optional script selection</li>
        <li>Per-player claims with team color-coded badges</li>
        <li>Nomination and vote recording (full or quick-log mode)</li>
        <li>Chopping Block tracking with official BOTC execution rules</li>
        <li>Circle seating chart view with drag-to-reorder</li>
        <li>Game log showing all events by day</li>
      </ul>
      <p><a href="/">Return to The Codex home</a></p>
    `,
  },
};

export function injectRouteMetadata(html: string, urlPath: string): string {
  const normalizedPath =
    urlPath.endsWith("/") && urlPath !== "/" ? urlPath.slice(0, -1) : urlPath;
  const routePath = normalizedPath === "" ? "/" : normalizedPath;
  const meta = ROUTE_META[routePath];
  if (!meta) return html;

  const canonicalUrl = `${SITE_URL}${routePath === "/" ? "" : routePath}`;
  const ogImage = `${SITE_URL}/og-image.png`;

  const metaTags = `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="${meta.ogType}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="The Codex" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`;

  const noscript = `<noscript><div style="padding:2rem;max-width:800px;margin:0 auto;font-family:sans-serif;line-height:1.6">${meta.noscriptContent}</div></noscript>`;

  let result = html;

  result = result.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  result = result.replace(/<meta\s+name="description"[^>]*\/?>/, `<meta name="description" content="${meta.description}" />`);

  if (result.includes('<title>')) {
    result = result.replace(
      `<title>${meta.title}</title>`,
      `<title>${meta.title}</title>
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="${meta.ogType}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="The Codex" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`
    );
  } else {
    result = result.replace("</head>", `${metaTags}\n  </head>`);
  }

  result = result.replace('<div id="root"></div>', `<div id="root"></div>${noscript}`);

  return result;
}
