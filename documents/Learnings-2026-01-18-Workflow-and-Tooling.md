*Reference for questions or deep dives.*

## The Workflow Experience
- **Evolution:** Github Copilot => Augment => Antigravity.
- **Context-Driven Dev:** Even though it's high level (NL), it still requires an **engineer in heart**. You don't need to read every line, but you need **systematic thinking**.
- **The Spec:** I spend HUGE time here. Adding comments, challenging requirements.
    - *Learning:* I love pending comments.
    - *Learning:* At first I tried to skip to code, but hands-on learning showed me that a better spec = better product.
- **Implementation Plan:** I check comments here too.
- **Stuck State Recovery:**
    1.  Tell it to stash current code.
    2.  Go to old design/code to check how it worked.
    3.  Check in old code to a different branch.

## Tooling & Models
- **Gemini 3 Flash:** Default driver.
- **Gemini 3 Pro (High):** Switch to this for detailed thought or technical blockers.
    - *Feature:* Chat window allows seamless move between models without losing context! :O
- **Claude:**
    - Used when Gemini gets stuck (e.g., a deployment issue where Gemini failed, Claude Opus solved it).
    - *limitation:* Cannot use browser agent in Antigravity.
    - *Strategy:* Switch accounts or use Claude during cool-down.
- **Environment:** It can update global environment (e.g., updated my node version).
- **Workaround:** If it can't see inside `.gitignore` (like `.env`), I start a terminal and print it to terminal so it can read it. :)

## Rate Limits (The "Real" Bottleneck)
- **The Struggle:** Rate limit is the biggest problem once you get a taste of velocity.
- **Timing:** Hits after a couple of hours, especially on Pro + Planning.
- **Tiers (Confusing):**
    - Free: 1,000/day (60/min)
    - Pro: 1,500/day (120/min) - $19.99 (or promo). Not sure if sharing quota with family. Renews in 2-3 hours.
    - Ultra: 2,000/day
- **Reality:** Rates don't always make sense.
- **Strategy:** Switch Google account and continue. Or switch to Claude model.

## Why AIRs? (Controlled Generative UI)
- **Why do we need humans?** Because tools get endlessly stuck.
- **Concept:** We include semi-static, tested logic (like "run this prompt" or "search this API").
- **Path Forward:** Create many AIRs (even for same purpose like Gems/MCPs).
- **Benchmark:** We can test them (e.g., "load this image") and choose the better working one dynamically.

## Philosophy & Motivation
- **Creators vs Motivation:** Writing code gets easier. Creators are entitled to achieve ideas before their **motivation dies**.
    - *Systems:* Still need to understand how systems work broadly. Especially when things grow and excitement fades.
    - *Attitude:* Engineering attitude is a **must-have**. Skills are just the catalyzer to move fast.
- **My Status:** I am just an intermediate user. Not expert or superuser yet. Learned hands-on. Maybe went slower than ideal, but understood the *need* for every feature I used.
- **Parallelism:** It kept failing at the beginning, but now I run multiple threads.

## Artifacts
- **Impermanence:** Artifact files are not permanent.
- **Access:** Can ask agent to show it in artifact view (normally hidden session location).
