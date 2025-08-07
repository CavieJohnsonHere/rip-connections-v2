import { serve } from "bun";
import index from "./index.html";
import game from "./game.json";

function daysSinceEpoch() {
  const msPerDay = 24 * 60 * 60 * 1000; // milliseconds in a day
  const now = new Date();
  const epoch = new Date("1970-01-01T00:00:00Z");

  const elapsedMs = now.getTime() - epoch.getTime();
  return Math.floor(elapsedMs / msPerDay);
}

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/wikiicon": () =>
      new Response(Bun.file("./src/wikiicon.png"), {
        headers: { "Content-Type": "image/png" },
      }),

    "/api/items": async (req) => {
      const todaysGame = {
        cats: game.cats[String(daysSinceEpoch()) as keyof typeof game.cats],
        items: game.items[String(daysSinceEpoch()) as keyof typeof game.items],
      };

      if (!todaysGame) return new Response("Not Found", { status: 404 });

      return Response.json(todaysGame);
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
