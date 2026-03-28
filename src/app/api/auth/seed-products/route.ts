import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Using placehold.co for reliable placeholder images with product names
const img = (text: string, bg = "7c3aed", fg = "ffffff") =>
  `https://placehold.co/400x300/${bg}/${fg}?text=${encodeURIComponent(text)}&font=montserrat`;

const products = [
  // STREAMING
  { title: "Netflix Premium", description: "Netflix Premium plan with Ultra HD streaming and 4 screens. Instant delivery.", price: 25.00, category: "STREAMING", imageUrl: img("Netflix", "E50914") },
  { title: "Spotify Premium", description: "Spotify Premium subscription. Ad-free music, offline listening, unlimited skips.", price: 15.00, category: "STREAMING", imageUrl: img("Spotify", "1DB954") },
  { title: "Disney+ Premium", description: "Disney+ premium subscription. Disney, Marvel, Star Wars, Pixar and National Geographic.", price: 15.99, category: "STREAMING", imageUrl: img("Disney+", "113CCF") },
  { title: "YouTube Premium", description: "YouTube Premium subscription. Ad-free videos, background play, YouTube Music.", price: 14.99, category: "STREAMING", imageUrl: img("YouTube", "FF0000") },
  { title: "Apple TV+", description: "Apple TV+ subscription. Award-winning Apple Originals, movies and series.", price: 20.00, category: "STREAMING", imageUrl: img("Apple TV+", "1C1C1E") },
  { title: "Apple Music 1 Year", description: "Apple Music 1 year subscription. 100 million songs, ad-free.", price: 18.00, category: "STREAMING", imageUrl: img("Apple Music", "FC3C44") },
  { title: "Amazon Prime Video", description: "Amazon Prime Video subscription. Award-winning originals and blockbuster movies.", price: 14.00, category: "STREAMING", imageUrl: img("Prime Video", "00A8E1") },
  { title: "HBO Max Premium", description: "HBO Max premium subscription. HBO originals, blockbuster movies, and series.", price: 12.99, category: "STREAMING", imageUrl: img("HBO Max", "5822B4") },
  { title: "Crunchyroll Premium", description: "Crunchyroll premium subscription. Unlimited anime, ad-free, new episodes.", price: 13.99, category: "STREAMING", imageUrl: img("Crunchyroll", "F47521") },
  { title: "Paramount+ 1 Year", description: "Paramount+ 1 year subscription. Live sports, breaking news, and exclusive originals.", price: 15.99, category: "STREAMING", imageUrl: img("Paramount+", "0064FF") },
  { title: "DAZN Premium", description: "DAZN Premium subscription. Live sports, football, boxing and more.", price: 15.00, category: "STREAMING", imageUrl: img("DAZN", "F8FF00", "000000") },
  { title: "WWE Network Premium", description: "WWE Network Premium subscription. Live PPVs, original series, and full archive.", price: 35.00, category: "STREAMING", imageUrl: img("WWE Network", "FF0000") },
  { title: "NBA League Pass", description: "NBA League Pass premium. Live and on-demand NBA games all season.", price: 12.00, category: "STREAMING", imageUrl: img("NBA", "C9082A") },
  { title: "FuboTV Pro", description: "FuboTV Pro subscription. Live sports, TV and on-demand streaming.", price: 16.00, category: "STREAMING", imageUrl: img("FuboTV", "E8173C") },
  { title: "IPTV Premium", description: "IPTV subscription. 10,000+ live channels worldwide, VOD included.", price: 30.00, category: "STREAMING", imageUrl: img("IPTV", "2D2D2D") },
  // AI TOOLS
  { title: "ChatGPT Pro", description: "ChatGPT Pro subscription. GPT-4o, unlimited messages, advanced tools.", price: 20.00, category: "AI_TOOLS", imageUrl: img("ChatGPT", "10A37F") },
  { title: "Sora AI", description: "Sora AI by OpenAI. Generate stunning videos from text prompts.", price: 18.00, category: "AI_TOOLS", imageUrl: img("Sora AI", "412991") },
  { title: "Midjourney", description: "Midjourney subscription. Generate stunning AI art and images.", price: 22.00, category: "AI_TOOLS", imageUrl: img("Midjourney", "000000") },
  { title: "Claude Pro", description: "Claude Pro by Anthropic. Advanced AI assistant for complex tasks.", price: 20.00, category: "AI_TOOLS", imageUrl: img("Claude", "D97757") },
  // SOFTWARE
  { title: "Adobe Creative Cloud", description: "Adobe Creative Cloud subscription. Photoshop, Illustrator, Premiere and 20+ apps.", price: 23.00, category: "SOFTWARE", imageUrl: img("Adobe CC", "FF0000") },
  { title: "ExpressVPN", description: "ExpressVPN subscription. Fast, secure VPN with servers in 105 countries.", price: 12.99, category: "SOFTWARE", imageUrl: img("ExpressVPN", "DA3940") },
  { title: "NordVPN", description: "NordVPN subscription. Military-grade encryption, 5500+ servers worldwide.", price: 11.99, category: "SOFTWARE", imageUrl: img("NordVPN", "4687FF") },
  { title: "Duolingo Plus 1 Year", description: "Duolingo Plus 1 year subscription. Ad-free language learning, offline access.", price: 15.00, category: "SOFTWARE", imageUrl: img("Duolingo", "58CC02") },
  { title: "Wondershare", description: "Wondershare Creative Cloud subscription. Video editing, PDF tools and more.", price: 15.00, category: "SOFTWARE", imageUrl: img("Wondershare", "1E90FF") },
  // GAMING
  { title: "Ubisoft+", description: "Ubisoft+ subscription. Access 100+ PC games including new releases.", price: 17.99, category: "GAMING", imageUrl: img("Ubisoft+", "0070FF") },
  { title: "Steam Account", description: "Steam account with games. Instant delivery, ready to use.", price: 12.99, category: "GAMING", imageUrl: img("Steam", "1B2838") },
  { title: "Roblox Robux 1000", description: "Roblox Robux top-up. 1000 Robux, instant delivery.", price: 5.50, category: "GAMING", imageUrl: img("Roblox", "E8192C") },
  { title: "Xbox Game Pass", description: "Xbox Game Pass Ultimate. 100+ games, online multiplayer, EA Play.", price: 14.99, category: "GAMING", imageUrl: img("Xbox", "107C10") },
  { title: "PlayStation Plus", description: "PlayStation Plus subscription. Free games, online play, exclusive discounts.", price: 13.99, category: "GAMING", imageUrl: img("PS Plus", "003087") },
];

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.product.count();
    if (existing >= 29) {
      return NextResponse.json({ message: `Skipped — ${existing} products already exist.` });
    }

    await db.product.createMany({ data: products as never[], skipDuplicates: true });
    return NextResponse.json({ message: `Seeded ${products.length} products successfully.` });
  } catch (err) {
    console.error("[seed-products]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
