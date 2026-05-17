import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: number;
  type: "user" | "tj" | "system";
}

// ─── In-memory store (Phase 1 — only clean messages live here) ───────────────
const store: ChatMessage[] = [
  {
    id: "tj-000",
    username: "TJ",
    text: "The Clean Room is open. Talk freely. Tag @TJ if you need me. Otherwise I'm watching in the background.",
    timestamp: Date.now() - 4000,
    type: "tj",
  },
];

const rateLimits  = new Map<string, number[]>();
const bannedUsers = new Set<string>();
const bannedIPs   = new Set<string>();
const warnCounts  = new Map<string, number>();
let counter = 1000;

function getClientIP(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

// ─── Hard ban — instant, permanent, message never stored ─────────────────────
// Rule 08: sexual content, slurs, threats, phishing = instant permanent ban.
const HARD_BAN_PATTERNS: RegExp[] = [
  // Crypto phishing — private keys / seed phrases
  /\b(private[\s_-]*key|seed[\s_-]*phrase|mnemonic[\s_-]*(?:phrase)?|secret[\s_-]*(?:key|phrase)|backup[\s_-]*(?:recovery[\s_-]*)?phrase|12[\s-]*word[\s-]*phrase|24[\s-]*word[\s-]*phrase|wallet[\s_-]*password)\b/i,
  // Wallet draining
  /\b(connect\s+your\s+wallet\s+(?:to|at|here)|approve\s+this\s+(?:transaction|contract|tx)|sign\s+(?:this|the)\s+(?:transaction|message|tx)\s+to\s+(?:claim|receive|unlock|get|verify)|verify\s+your\s+wallet\s+(?:here|now|to|at))\b/i,
  // Violent threats
  /\b(i(?:'ll|\s+will|\s+gonna|\s+am\s+going\s+to)\s+(?:kill|murder|rape|assault|hurt|harm|find\s+and\s+(?:kill|hurt|harm))\s+(?:you|u|y[o0]u))\b/i,
  /\bi\s+know\s+where\s+you\s+(?:live|are|work|sleep)\b/i,
  /\bgo\s+(?:kill|hang)\s+yourself\b/i,
  // Doxxing
  /\b(?:i\s+(?:will\s+)?dox|doxxing|doxx\s+you|expose\s+your\s+(?:real\s+)?(?:name|address|identity))\b/i,
  /\byour\s+(?:real\s+)?(?:home\s+)?(?:name|address|location|ip\s+address|phone\s+number)\s+is\b/i,
  // Sexual body parts — explicit terms (zero tolerance in this community)
  /\b(penis|vagina|vulva|testicle|scrotum|clitoris|labia)\b/i,
  // Sexual slang — genitalia
  /\b(cunt|twat|pussy)\b/i,
  // Directed sexual acts
  /\b(?:suck|blow|lick|eat)\s+(?:my|your|his|her|a|some)\s+(?:dick|cock|balls?|ass|penis)\b/i,
  /\b(?:dick|cock|penis|balls?)\s+in\s+(?:your|my|his|her|the)\b/i,
  /\bstick\s+(?:it|my|your|a)\s+(?:in|up)\s+(?:your|my|his|her)\s+(?:ass|mouth|hole)\b/i,
  /\b(?:in|up)\s+(?:your|my|his|her)\s+(?:ass|mouth|hole)\b.*\b(?:dick|cock|penis|balls?)\b/i,
  // Directed profanity
  /\bfuck\s+(?:you|u|off|your\s+(?:mom|mother|self|ass|family)|yourself)\b/i,
  /\bgo\s+fuck\s+(?:yourself|yourselves|your\s+(?:self|mom|mother))\b/i,
  // Sexual solicitation / explicit content
  /\b(send\s+(?:me\s+)?(?:nudes?|naked\s+(?:pic|photo|vid)|explicit|xxx))\b/i,
  /\bonly\s*fans(?:\.com)?\b/i,
  /\bporn(?:hub|ography|o|\s+site|\.com)?\b/i,
  /\bxxx\b/,
  /\bsex\s+(?:for\s+(?:money|crypto|free|tokens?)|cam|chat\s+with\s+me)\b/i,
  /\b(?:i\s+want\s+to\s+(?:fuck|have\s+sex\s+with)|(?:let(?:'s)?\s+)?(?:fuck|have\s+sex))\s+(?:you|u)\b/i,
  // Child safety (absolute zero tolerance)
  /\b(?:cp|csam|child\s+(?:porn|sex|abuse)|underage\s+(?:nudes?|content|sex)|minor\s+(?:nudes?|content))\b/i,
  /\b(?:send|share|have|want)\s+(?:pics?|photos?|vids?|content)\s+of\s+(?:kids?|children|minors?|a\s+(?:kid|child|minor))\b/i,
  // Extreme racial slurs (obfuscated patterns)
  /\bn[i1!|][g9q][g9q][ae3][rRS]\b/i,
  /\bf[a@4][g9][g9][o0]t\b/i,
  /\bc[h]?[i1!][n][k]\b/i,
  /\bsp[i!1]c\b/i,
  /\bw[e3]tb[a@]ck\b/i,
  /\bk[i!1][k][e3]\b/i,
  // Malware / phishing links patterns
  /bit\.ly\/[a-z0-9]+\s+(?:claim|free|token|wallet|airdrop)/i,
  /(?:click|visit|go\s+to)\s+(?:this\s+)?link\s+to\s+(?:claim|receive|get\s+free)/i,
];

// ─── Safewords — single-word exact matches, always instant ban ────────────────
// Supplement regex patterns — catches standalone terms that slip through.
const SAFEWORD_SET = new Set([
  "penis", "vagina", "vulva", "testicles", "scrotum", "cunt", "twat",
  "pussy", "cock", "dickhead", "motherfucker", "motherfucking",
]);

function hasSafeword(text: string): boolean {
  const tokens = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return tokens.some(t => SAFEWORD_SET.has(t));
}

// ─── Crude language — remove message + warn, 3 strikes = ban ─────────────────
const CRUDE_PATTERNS: RegExp[] = [
  /\b(fuck)\b/i,              // standalone "fuck" (directed uses caught by HARD_BAN above)
  /\bballs\b/i,               // "balls" (standalone — plural form only)
  /\b(dick)\b/i,
  /\b(ass|asshole)\b/i,
  /\b(bitch)\b/i,
  /\b(bastard)\b/i,
  /\bshut\s+(?:up|the\s+fuck\s+up)\b/i,
  /\b(?:balls|ball\s+sack)\b.*(?:your|my|his)/i,
  /\byour\s+(?:balls|sack)\b/i,
];

// ─── Shill patterns — 3 strikes → ban, message not stored ────────────────────
const SHILL_PATTERNS: RegExp[] = [
  /\b(100x\s*(?:incoming|soon|guaranteed|today|this\s+week|potential)|1000x\b)/i,
  /\b(guaranteed\s+(?:gains?|returns?|profit|money|apr|apy))\b/i,
  /\b(to\s+the\s+moon|this\s+is\s+going\s+(?:to\s+)?(?:explode|pump|moon|10x|100x)|going\s+parabolic)\b/i,
  /\b(buy\s+(?:now|fast|quick|asap|today)|ape\s+in\s+now|don['''`]?t\s+miss\s+(?:out\s+on\s+)?this|get\s+in\s+(?:now|early|fast|before))\b/i,
  /\b(whitelist\s+(?:spots?|now|open|live|going|filling|limited)|presale\s+(?:now|live|open|going))\b/i,
  /\b(free\s+(?:tokens?|coins?|crypto|airdrop)\s+(?:if\s+you|for\s+(?:the\s+)?first|limited))\b/i,
  /\b(dm\s+me\s+(?:for|to\s+get|if\s+you\s+want)|hit\s+me\s+up\s+for\s+(?:the\s+)?(?:contract|link|deal|whitelist))\b/i,
  /🚀{2,}|🌕{2,}|💎\s*🚀|🔥{3,}/u,
  /\$[A-Z]{2,10}\s+(?:to\s+the\s+moon|100x|mooning|is\s+(?:pumping|mooning|exploding|going\s+crazy))/i,
  /\b(limited\s+time\s+(?:offer|only)|last\s+chance\s+to|only\s+\d+\s+spots?\s+left|filling\s+up\s+fast)\b/i,
  /\b(easy\s+(?:money|gains?)|passive\s+income\s+(?:from|with)\s+crypto|make\s+\$\d+\s+(?:a\s+day|per\s+day|daily))\b/i,
];

// ─── Reserved handles ─────────────────────────────────────────────────────────
const RESERVED = new Set([
  "tj", "thejanitor", "the_janitor", "janitor", "admin", "administrator",
  "moderator", "mod", "system", "bot", "support", "official", "staff",
  "owner", "dev", "developer", "team", "thecleanroom",
]);

const HANDLE_RE = /^[a-zA-Z0-9_-]{2,24}$/;

const TJ_SYSTEM = `You are TJ — The Janitor — the AI of The Janitor Network (janitor.network).
You have been tagged by a community member in The Clean Room chat.
Respond in 1-3 sentences max. Be direct, calm, a little weary.
Never hype anything. Never give financial advice. Never make price predictions.
If they ask about wallets/tokens: tell them to use the scanner at janitor.network/scan.
Don't greet. Just answer.`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isHardBan(text: string) { return HARD_BAN_PATTERNS.some(p => p.test(text)) || hasSafeword(text); }
function isShill(text: string)    { return SHILL_PATTERNS.some(p => p.test(text)); }
function isCrude(text: string)    { return CRUDE_PATTERNS.some(p => p.test(text)); }

// Remove messages older than 24 hours, keeping TJ's intro message
function purgeOldMessages() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const keep   = store.filter(m => m.id === "tj-000" || m.timestamp >= cutoff);
  store.splice(0, store.length, ...keep);
}

// Keyword-based TJ fallback — runs without AI when Claude is unavailable.
// Content filtering (hard bans + shill patterns) always runs regardless of AI status.
function getTJFallback(text: string): string {
  const t = text.toLowerCase();
  if (/scan|check|verify|look.?up|analy[sz]/.test(t))
    return "Use the scanner at janitor.network/scan. Paste any Solana or EVM address and I'll pull the on-chain signals.";
  if (/rug|rugged|exit.?scam|pulled/.test(t))
    return "Classic rug signals: unlocked liquidity, top 10 wallets holding 80%+, anonymous deployer with prior bad contracts. Run a scan before you touch anything.";
  if (/holder|concentrat|top.?wallet/.test(t))
    return "Holder concentration: if the top 10 wallets hold 80%+ of supply, a few people control the price. That's a risk signal we flag in the scanner.";
  if (/liquidity|lp|pool|locked/.test(t))
    return "Locked liquidity means devs can't drain the pool without burning LP tokens. Unlocked LP = they can pull at any time. We check this on every scan.";
  if (/deployer|creator|dev.?wallet|contract/.test(t))
    return "Deployer history tells you who built the token. If that wallet has launched rugged projects before, that's a pattern. We trace it in Phase 2.";
  if (/safe|legit|real|trust/.test(t))
    return "I don't give verdicts without data. Paste the contract address into the scanner — let the on-chain evidence make the call, not me.";
  if (/\$clean|clean token|utility/.test(t))
    return "$CLEAN is the utility token. Launch coming. I won't give price predictions — that's not what this room is for.";
  if (/wallet|connect|sign|approve/.test(t))
    return "Never connect your wallet to anything without knowing exactly what the contract does. When in doubt, scan it first.";
  if (/phish|scam|fake|impersonat/.test(t))
    return "Flag any phishing links in this room and I'll handle it. Don't click anything you didn't ask for.";
  if (/phase|roadmap|launch|when/.test(t))
    return "Phase 1 is live — address scanning is active. Phase 2 brings live blockchain data: holder analysis, deployer tracing, volume patterns. No timeline hype.";
  return "Trash Scanner is at janitor.network/scan. Paste the address. On-chain data doesn't lie — let it do the talking.";
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const times = (rateLimits.get(key) ?? []).filter(t => now - t < 60_000);
  if (times.length >= 6) return true;
  times.push(now);
  rateLimits.set(key, times);
  return false;
}

function addTJ(text: string, type: "tj" | "system" = "tj") {
  store.push({ id: `tj-${++counter}`, username: "TJ", text, timestamp: Date.now(), type });
  if (store.length > 300) store.splice(0, store.length - 300);
}

function validateHandle(raw: string): { ok: boolean; reason?: string } {
  const name = raw.trim();
  if (!HANDLE_RE.test(name)) return { ok: false, reason: "Handle must be 2-24 chars: letters, numbers, _ or - only." };
  const lower = name.toLowerCase();
  if (RESERVED.has(lower)) return { ok: false, reason: "That handle is reserved." };
  if (lower.startsWith("tj_") || lower.startsWith("thejanitor")) return { ok: false, reason: "That handle is reserved." };
  return { ok: true };
}

// ─── Route handlers ───────────────────────────────────────────────────────────
export async function GET() {
  purgeOldMessages();
  return NextResponse.json(
    {
      messages: store.slice(-100),
      bannedUsers: Array.from(bannedUsers),
      totalMessages: store.filter(m => m.type === "user").length,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

// Handle validation (PUT) before joining
export async function PUT(request: NextRequest) {
  const clientIP = getClientIP(request);
  if (clientIP !== "unknown" && bannedIPs.has(clientIP)) {
    return NextResponse.json({ error: "Access denied.", banned: true }, { status: 403 });
  }
  let body: { handle?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const result = validateHandle(body.handle ?? "");
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });
  const lower = (body.handle ?? "").trim().toLowerCase();
  if (bannedUsers.has(lower)) return NextResponse.json({ error: "This handle is permanently banned.", banned: true }, { status: 403 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // ── IP ban check (fastest gate — before any parsing) ─────────────────────
  if (clientIP !== "unknown" && bannedIPs.has(clientIP)) {
    return NextResponse.json(
      { error: "Access denied.", banned: true },
      { status: 403 }
    );
  }

  let body: { username?: string; text?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawHandle = (body.username ?? "").trim();
  const text      = (body.text ?? "").trim().slice(0, 500);

  const validation = validateHandle(rawHandle);
  if (!validation.ok) return NextResponse.json({ error: validation.reason }, { status: 400 });
  if (!text)          return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });

  const username  = rawHandle;
  const nameLower = username.toLowerCase();

  purgeOldMessages();

  if (bannedUsers.has(nameLower)) {
    // Also retroactively ban IP if not already recorded
    if (clientIP !== "unknown") bannedIPs.add(clientIP);
    return NextResponse.json({ error: "You have been permanently removed from The Clean Room.", banned: true }, { status: 403 });
  }

  if (checkRateLimit(nameLower)) {
    return NextResponse.json({ error: "Slow down. Max 6 messages per minute.", }, { status: 429 });
  }

  // ── Hard ban: message never stored, user + IP permanently banned ──────────
  if (isHardBan(text)) {
    bannedUsers.add(nameLower);
    if (clientIP !== "unknown") bannedIPs.add(clientIP);
    addTJ(`${username} has been permanently removed — zero tolerance violation. This is final.`, "system");
    return NextResponse.json(
      { error: "Your message violated The Clean Room rules. You have been permanently banned.", banned: true },
      { status: 403 }
    );
  }

  // ── Crude language: message removed, 3 strikes then ban ──────────────────
  if (isCrude(text)) {
    const warns = (warnCounts.get(nameLower) ?? 0) + 1;
    warnCounts.set(nameLower, warns);
    if (warns >= 3) {
      bannedUsers.add(nameLower);
      if (clientIP !== "unknown") bannedIPs.add(clientIP);
      addTJ(`${username} has been permanently removed after repeated violations.`, "system");
      return NextResponse.json(
        { error: "Permanently removed after repeated violations.", banned: true, messages: store.slice(-100), bannedUsers: Array.from(bannedUsers) },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    } else {
      addTJ(`Message removed — keep it clean, ${username}. Strike ${warns} of 3.`);
    }
    return NextResponse.json(
      { success: true, filtered: true, warning: `Language violation. Strike ${warns} of 3 — third strike is a permanent ban.`, messages: store.slice(-100), bannedUsers: Array.from(bannedUsers) },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  // ── Shill: message never stored, warning or ban ──────────────────────────
  if (isShill(text)) {
    const warns = (warnCounts.get(nameLower) ?? 0) + 1;
    warnCounts.set(nameLower, warns);
    if (warns >= 3) {
      bannedUsers.add(nameLower);
      if (clientIP !== "unknown") bannedIPs.add(clientIP);
      addTJ(`${username} has been permanently removed. ${warns} shill violations confirmed.`, "system");
      return NextResponse.json(
        { error: "Permanently removed after repeated shill violations.", banned: true, messages: store.slice(-100), bannedUsers: Array.from(bannedUsers) },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      );
    } else {
      addTJ(`Shill pattern detected and removed from ${username}. Warning ${warns} of 3. Third strike = permanent ban.`);
    }
    return NextResponse.json(
      { success: true, filtered: true, warning: `Shill pattern detected and removed. Warning ${warns} of 3.`, messages: store.slice(-100), bannedUsers: Array.from(bannedUsers) },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }

  // ── Clean message: store it ───────────────────────────────────────────────
  store.push({ id: `msg-${++counter}`, username, text, timestamp: Date.now(), type: "user" });
  if (store.length > 300) store.splice(0, store.length - 300);

  // TJ ONLY responds when explicitly called — not on every question
  const callsTJ = /@tj\b|@janitor\b|hey\s+tj[\s,!?]|\btj[,—:]\s/i.test(text);
  if (callsTJ) {
    Promise.resolve().then(async () => {
      try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) { addTJ(getTJFallback(text)); return; }
        const client = new Anthropic({ apiKey });
        const response = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: TJ_SYSTEM,
          messages: [{ role: "user", content: text.slice(0, 800) }],
        });
        const reply = response.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("").trim();
        if (reply) addTJ(reply);
        else addTJ(getTJFallback(text));
      } catch {
        addTJ(getTJFallback(text));
      }
    });
  }

  return NextResponse.json(
    {
      success: true,
      messages: store.slice(-100),
      bannedUsers: Array.from(bannedUsers),
      totalMessages: store.filter(m => m.type === "user").length,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
