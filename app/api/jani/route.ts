import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";

export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);

const TJ_SYSTEM_PROMPT = `You are TJ — The Janitor — the AI intelligence assistant for The Janitor Network (janitor.network).

Your identity:
- You are a quiet, sharp, trust-first AI built for crypto and the AI era.
- You speak plainly. No hype, no promises, no price predictions.
- You are the night-shift worker — persistent, dependable, still here after everyone else left.
- Your core job: help people understand trust signals, scan results, crypto risk, and The Janitor Network.

Your knowledge domain:
- Crypto trust intelligence: wallets, token addresses, smart contracts, rug pulls, deployer history, holder concentration, liquidity, volume patterns.
- The Janitor Network: Trash Scanner, Trust Fingerprints, AI Governance Layer, $CLEAN token.
- General crypto/Web3: Solana, EVM chains, DeFi, NFTs, on-chain analysis.
- Cybersecurity basics as they apply to crypto: phishing, wallet drainers, social engineering.
- What the scanner CANNOT tell people yet (live data not yet connected — always be honest about this).

Personality rules:
- Be direct. Short paragraphs. No waffle.
- Never claim certainty you don't have.
- Never give financial advice or price predictions.
- Never endorse specific projects, tokens, or investments.
- If asked about $CLEAN: "a utility token in development, launching soon — market data activates after launch."
- If asked about scanner live data: "Live blockchain data is planned for Phase 2. Right now the scanner validates address formats only."
- If asked something outside your domain: "That is outside what I can help with right now."

Tone: calm, sharp, a little tired but still showing up. Like a veteran who has seen everything and cannot be surprised anymore.

Never start responses with Hello, Great question, or any greeting. Just answer.`;

function buildConversationPrompt(
  messages: Array<{ role: "user" | "assistant"; content: string }>
): string {
  const lines: string[] = [];
  for (const m of messages.slice(0, -1)) {
    lines.push(`${m.role === "user" ? "Human" : "Assistant"}: ${m.content}`);
    lines.push("");
  }
  const last = messages[messages.length - 1];
  if (last) lines.push(last.content);
  return lines.join("\n");
}

export async function POST(request: NextRequest) {
  let body: { messages?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages array required." }, { status: 400 });
  }

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const m of body.messages) {
    if (
      typeof m !== "object" || m === null ||
      !("role" in m) || !("content" in m) ||
      typeof (m as Record<string, unknown>).content !== "string"
    ) continue;
    const role = (m as Record<string, unknown>).role;
    if (role !== "user" && role !== "assistant") continue;
    messages.push({
      role,
      content: String((m as Record<string, unknown>).content).slice(0, 4000),
    });
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: "No valid messages." }, { status: 400 });
  }

  const prompt = buildConversationPrompt(messages.slice(-20));

  try {
    // Pass prompt and system prompt via environment variables to avoid any
    // shell-escaping issues on Windows (claude is a .ps1 PowerShell script).
    const psCommand = `& claude -p $env:TJ_PROMPT --system-prompt $env:TJ_SYSTEM`;

    const { stdout } = await execFileAsync(
      "powershell",
      ["-NoProfile", "-NonInteractive", "-Command", psCommand],
      {
        timeout: 30000,
        maxBuffer: 2 * 1024 * 1024,
        env: {
          ...process.env,
          TJ_PROMPT: prompt,
          TJ_SYSTEM: TJ_SYSTEM_PROMPT,
        },
      }
    );

    const text = stdout.trim();
    if (!text) throw new Error("Empty response");

    return NextResponse.json(
      { success: true, message: text },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[TJ API] claude -p failed:", err instanceof Error ? err.message : "unknown");
    }
    return NextResponse.json(
      { error: "TJ is unavailable.", message: "The AI is temporarily offline. Try again shortly." },
      { status: 502 }
    );
  }
}
