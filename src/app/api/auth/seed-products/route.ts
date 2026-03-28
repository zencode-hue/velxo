import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const products = [
  { title: "Netflix Premium", description: "Netflix Premium plan with Ultra HD streaming and 4 screens. Instant delivery.", price: 25.00, category: "STREAMING", imageUrl: null },
  { title: "Spotify Premium", description: "Spotify Premium subscription. Ad-free music, offline listening, unlimited skips.", price: 15.00, category: "STREAMING", imageUrl: null },
  { title: "Dazn Premium", description: "DAZN Premium subscription. Live sports, football, boxing and more.", price: 15.00, category: "STREAMING", imageUrl: null },
  { title: "Apple TV+", description: "Apple TV+ subscription. Award-winning Apple Originals, movies and series.", price: 20.00, category: "STREAMING", imageUrl: null },
  { title: "Apple Music Premium 1 Year", description: "Apple Music 1 year subscription. 100 million songs, ad-free.", price: 18.00, category: "STREAMING", imageUrl: null },
  { title: "Acorn Premium", description: "Acorn TV premium subscription. The best of British TV streaming.", price: 14.00, category: "STREAMING", imageUrl: null },
  { title: "YouTube Premium", description: "YouTube Premium subscription. Ad-free videos, background play, YouTube Music.", price: 14.99, category: "STREAMING", imageUrl: null },
  { title: "WWE Network Premium", description: "WWE Network Premium subscription. Live PPVs, original series, and full archive.", price: 35.00, category: "STREAMING", imageUrl: null },
  { title: "Amc+ Premium", description: "AMC+ premium subscription. Hit series, horror, and exclusive content.", price: 12.99, category: "STREAMING", imageUrl: null },
  { title: "Crunchyroll Premium", description: "Crunchyroll premium subscription. Unlimited anime, ad-free, new episodes.", price: 13.99, category: "STREAMING", imageUrl: null },
  { title: "Hbo Max Premium", description: "HBO Max premium subscription. HBO originals, blockbuster movies, and series.", price: 12.99, category: "STREAMING", imageUrl: null },
  { title: "Movistar Plus+", description: "Movistar Plus+ subscription. Sports, movies, series and exclusive content.", price: 15.00, category: "STREAMING", imageUrl: null },
  { title: "Gaia TV Premium", description: "Gaia TV premium subscription. Consciousness-expanding films and series.", price: 13.00, category: "STREAMING", imageUrl: null },
  { title: "Amazon Prime Video", description: "Amazon Prime Video subscription. Award-winning originals and blockbuster movies.", price: 14.00, category: "STREAMING", imageUrl: null },
  { title: "Paramount+ 1 Year", description: "Paramount+ 1 year subscription. Live sports, breaking news, and exclusive originals.", price: 15.99, category: "STREAMING", imageUrl: null },
  { title: "Viki Premium", description: "Viki premium subscription. Korean dramas, Asian content, ad-free.", price: 14.99, category: "STREAMING", imageUrl: null },
  { title: "Disney Premium", description: "Disney+ premium subscription. Disney, Marvel, Star Wars, Pixar and National Geographic.", price: 15.99, category: "STREAMING", imageUrl: null },
  { title: "Nba Premium", description: "NBA League Pass premium. Live and on-demand NBA games all season.", price: 12.00, category: "STREAMING", imageUrl: null },
  { title: "Fubo Pro", description: "FuboTV Pro subscription. Live sports, TV and on-demand streaming.", price: 16.00, category: "STREAMING", imageUrl: null },
  { title: "IPTV", description: "IPTV subscription. 10,000+ live channels worldwide, VOD included.", price: 30.00, category: "STREAMING", imageUrl: null },
  { title: "ChatGPT Pro", description: "ChatGPT Pro subscription. GPT-4o, unlimited messages, advanced tools.", price: 20.00, category: "AI_TOOLS", imageUrl: null },
  { title: "Sora AI", description: "Sora AI by OpenAI. Generate stunning videos from text prompts.", price: 18.00, category: "AI_TOOLS", imageUrl: null },
  { title: "Adobe Creative Cloud", description: "Adobe Creative Cloud subscription. Photoshop, Illustrator, Premiere and 20+ apps.", price: 23.00, category: "SOFTWARE", imageUrl: null },
  { title: "Wondershare", description: "Wondershare Creative Cloud subscription. Video editing, PDF tools and more.", price: 15.00, category: "SOFTWARE", imageUrl: null },
  { title: "Express VPN", description: "ExpressVPN subscription. Fast, secure VPN with servers in 105 countries.", price: 12.99, category: "SOFTWARE", imageUrl: null },
  { title: "Tunnel Bear Unlimited", description: "TunnelBear Unlimited VPN. Secure, private browsing with unlimited data.", price: 14.99, category: "SOFTWARE", imageUrl: null },
  { title: "Duolingo 1 Year", description: "Duolingo Plus 1 year subscription. Ad-free language learning, offline access.", price: 15.00, category: "SOFTWARE", imageUrl: null },
  { title: "Ubi Soft", description: "Ubisoft+ subscription. Access 100+ PC games including new releases.", price: 17.99, category: "GAMING", imageUrl: null },
  { title: "Steam Accounts", description: "Steam account with games. Instant delivery, ready to use.", price: 12.99, category: "GAMING", imageUrl: null },
  { title: "Roblox Robux Top-Up (Price Per 1k)", description: "Roblox Robux top-up. Price per 1000 Robux, instant delivery.", price: 5.50, category: "GAMING", imageUrl: null },
  { title: "Telepizza", description: "Telepizza gift card / voucher. Order your favourite pizza online.", price: 14.99, category: "SOFTWARE", imageUrl: null },
  { title: "Burger King", description: "Burger King gift card / voucher. Redeem at any Burger King location.", price: 17.99, category: "SOFTWARE", imageUrl: null },
];

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.product.count();
    if (existing >= 32) {
      return NextResponse.json({ message: `Skipped — ${existing} products already exist.` });
    }

    await db.product.createMany({ data: products as never[], skipDuplicates: true });
    return NextResponse.json({ message: `Seeded ${products.length} products successfully.` });
  } catch (err) {
    console.error("[seed-products]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
