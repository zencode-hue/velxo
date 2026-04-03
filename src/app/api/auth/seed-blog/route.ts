import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";

const posts = [
  {
    slug: "best-streaming-services-2025",
    title: "Best Streaming Services in 2025: Complete Guide",
    excerpt: "Netflix, Disney+, HBO Max — which streaming service gives you the most value? We break down every major platform.",
    category: "Streaming", emoji: "📺", published: true,
    content: `Streaming services have exploded in 2025, with more options than ever. Here's our breakdown of the top platforms.

**Netflix** remains the king of original content. With shows like Stranger Things, The Crown, and a massive library of films, it's hard to beat. The Premium plan gives you 4K streaming on 4 screens simultaneously.

**Disney+** is essential if you love Marvel, Star Wars, Pixar, or National Geographic. The content library keeps growing and the price is competitive.

**HBO Max** has arguably the best quality-per-show ratio. Game of Thrones, The Last of Us, Succession — if you want prestige TV, this is it.

**Amazon Prime Video** is often overlooked but includes The Boys, Rings of Power, and a huge library of licensed content.

**Crunchyroll** is the go-to for anime fans. With the largest anime library online and simulcasts of new episodes, it's a must-have for the genre.

**Our recommendation:** Start with Netflix + one specialty service. You can always rotate subscriptions monthly to save money.`,
  },
  {
    slug: "chatgpt-vs-claude-2025",
    title: "ChatGPT Pro vs Claude Pro: Which AI is Worth It?",
    excerpt: "Both are powerful AI assistants, but they excel at different things. Here's an honest comparison to help you choose.",
    category: "AI Tools", emoji: "🤖", published: true,
    content: `Both ChatGPT Pro and Claude Pro are excellent AI assistants, but they have different strengths.

**ChatGPT Pro (GPT-4o)** excels at:
- Code generation and debugging
- Image generation with DALL-E
- Web browsing and real-time information
- Voice conversations
- Plugin ecosystem

**Claude Pro** excels at:
- Long document analysis (200k token context)
- Writing and editing
- Nuanced reasoning
- Following complex instructions precisely

**Which should you choose?**

If you're a developer or need image generation, go with ChatGPT Pro. If you work with long documents or need detailed writing assistance, Claude Pro is excellent.

Many power users subscribe to both — they're complementary tools rather than direct competitors. Both are available instantly on Velxo.`,
  },
  {
    slug: "vpn-guide-2025",
    title: "Why You Need a VPN in 2025 (And Which One to Get)",
    excerpt: "Privacy online is more important than ever. We compare ExpressVPN, NordVPN, and others to find the best value.",
    category: "Software", emoji: "🔒", published: true,
    content: `In 2025, online privacy is no longer optional. Here's why you need a VPN and which one to choose.

**Why use a VPN?**

A VPN encrypts your internet traffic, hides your IP address, and lets you access content from other regions. It's essential for:
- Public WiFi security
- Bypassing geo-restrictions
- Protecting your browsing from ISPs
- Accessing streaming content from other countries

**ExpressVPN** is the fastest option with servers in 105 countries. It's slightly more expensive but worth it for speed.

**NordVPN** offers the best value with 5,500+ servers and military-grade encryption. Their double VPN feature adds an extra layer of security.

**TunnelBear** is great for beginners with a simple interface and a free tier to try before buying.

**Our pick:** NordVPN for most users. ExpressVPN if speed is your priority. Both are available on Velxo with instant delivery.`,
  },
  {
    slug: "gaming-subscriptions-worth-it",
    title: "Are Gaming Subscriptions Worth It in 2025?",
    excerpt: "Xbox Game Pass, PS Plus, Ubisoft+ — we calculate the real value of each subscription based on what you actually play.",
    category: "Gaming", emoji: "🎮", published: true,
    content: `Gaming subscriptions have changed how we play. But are they actually worth the money?

**Xbox Game Pass Ultimate** is arguably the best value in gaming. For a monthly fee, you get access to 100+ games including day-one releases from Xbox Game Studios. If you play more than 2-3 games per month, it pays for itself.

**PlayStation Plus** has three tiers. The Essential tier gives you free monthly games. Extra adds a catalog of 400+ PS4/PS5 games. Premium adds classic games and game trials.

**Ubisoft+** makes sense if you play Ubisoft games regularly. Assassin's Creed, Far Cry, Rainbow Six — all included. Great value if you're a fan of the studio.

**Steam** doesn't have a subscription but their sales are legendary. Combine with a gaming account from Velxo for the best deals.

**Bottom line:** Xbox Game Pass is the best value for most gamers. PS Plus Extra is worth it for PlayStation exclusives. Ubisoft+ only if you love their games.`,
  },
  {
    slug: "how-to-save-on-digital-subscriptions",
    title: "10 Ways to Save Money on Digital Subscriptions",
    excerpt: "Stop overpaying for streaming and software. These tips will cut your monthly subscription costs significantly.",
    category: "Tips", emoji: "💰", published: true,
    content: `The average person spends over $200/month on digital subscriptions. Here's how to cut that down significantly.

**1. Buy from Velxo** — We offer subscriptions at competitive prices with instant delivery. No need to pay full retail.

**2. Rotate subscriptions** — Don't keep all streaming services active at once. Watch what you need, cancel, then switch.

**3. Share family plans** — Many services allow 4-6 profiles. Split the cost with family or friends.

**4. Annual vs monthly** — Annual plans are typically 20-40% cheaper than monthly billing.

**5. Use discount codes** — Check Velxo's discount section regularly for promo codes.

**6. Bundle services** — Some providers offer bundles (Disney+, Hulu, ESPN+) at a discount.

**7. Student discounts** — Many services offer 50% off for students with a valid email.

**8. Free trials** — Use free trials strategically for content you want to binge.

**9. Cancel unused subscriptions** — Audit your subscriptions monthly. Cancel anything you haven't used in 2 weeks.

**10. Use wallet balance** — Top up your Velxo wallet and use it for instant purchases without payment friction.`,
  },
  {
    slug: "adobe-creative-cloud-guide",
    title: "Adobe Creative Cloud: Is It Worth the Price in 2025?",
    excerpt: "Adobe is expensive. Here's an honest breakdown of whether Creative Cloud is worth it and what alternatives exist.",
    category: "Software", emoji: "🎨", published: true,
    content: `Adobe Creative Cloud is the industry standard for creative professionals, but is it worth the price?

**What you get with Adobe CC:**

The full Creative Cloud plan includes 20+ apps: Photoshop, Illustrator, Premiere Pro, After Effects, InDesign, Lightroom, and more. Plus 100GB cloud storage and Adobe Fonts.

**Who should get it:**

- Professional designers and photographers
- Video editors working with clients
- Anyone who needs multiple Adobe apps
- Students (get the student discount)

**Who might not need it:**

- Hobbyists who only use one app
- People who can use free alternatives (GIMP, DaVinci Resolve, Canva)
- Those on a tight budget

**The verdict:**

If you use 3+ Adobe apps professionally, Creative Cloud pays for itself quickly. The integration between apps is unmatched. For casual users, consider the single-app plan or alternatives.

Get Adobe Creative Cloud at a competitive price on Velxo with instant delivery.`,
  },
];

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db as any).blogPost.count();
    if (existing >= 6) {
      return NextResponse.json({ message: `Skipped — ${existing} posts already exist.` });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).blogPost.createMany({ data: posts, skipDuplicates: true });
    return NextResponse.json({ message: `Seeded ${posts.length} blog posts.` });
  } catch (err) {
    console.error("[seed-blog]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
