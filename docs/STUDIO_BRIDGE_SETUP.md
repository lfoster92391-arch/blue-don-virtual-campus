# Studio Bridge — install guide

How to give the Broadcast Control Studio real control of OBS on the Studio B PC.

This is an **advisor task**, done once per machine. Budget about twenty minutes
the first time. Students never need to touch any of it.

## Why there is an agent at all

The campus site runs on Vercel, out on the internet. The Studio B PC sits behind
the school's firewall and has no public address, so the site **cannot** dial
into OBS. Opening a port for it would be the wrong answer at a school.

So the direction is flipped. The console writes a command into the campus
database, and a small program on the Studio B PC — the **bridge** — asks the
campus every few seconds whether there is anything to do, runs it against OBS,
and reports back what OBS is doing.

```
Studio console  ──writes command──►  Campus (Vercel + Postgres)
                                            ▲          │
                                    posts   │          │  polls every 3s
                                  telemetry │          ▼
                                     Studio Bridge agent ──► OBS (localhost)
```

Two consequences worth knowing up front:

- Control is **not instant**. A scene take lands within about a poll — three
  seconds or less. That is fine for scene changes and transport, and it is why
  Phase 5 does not attempt a hardware-feel video switcher.
- If the bridge is not running, the console **says so** and disables every
  OBS control. It does not queue commands for later. A scene taken four minutes
  late is worse than a scene not taken.

## What you need

- The **Studio B PC**, with OBS 28 or newer (OBS WebSocket 5 is built in).
- **Node.js 20 or newer** on that PC — <https://nodejs.org>, the LTS installer.
- Access to the **Vercel project settings** for the campus site.
- This repository's `studio-bridge/` folder copied onto the Studio B PC. A USB
  stick is fine; so is `git clone`.

---

## Step 1 — Turn on OBS WebSocket

On the Studio B PC, in OBS:

1. **Tools → WebSocket Server Settings**
2. Tick **Enable WebSocket server**
3. Leave the port at **4455**
4. Tick **Enable Authentication** and click **Show Connect Info**
5. Copy the **Server Password**. You will need it in Step 3.
6. **Apply**, then **OK**

Leave **Enable System Tray Alerts** off if you do not want a popup every time
the bridge reconnects.

> The password stays on this machine. It is never sent to the campus and never
> reaches a browser.

### While you are here: Studio Mode

The console's **PVW** buttons and the **Take to air** button need OBS **Studio
Mode**. Turn it on with the *Studio Mode* button at the bottom right of the OBS
window. Without it, the console still works — it just shows the **LIVE** button
on each scene, which cuts straight to air, and hides preview.

---

## Step 2 — Put the shared token on the campus

The bridge proves who it is with one shared secret.

Generate one on any machine with Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

That prints a 43-character string. Then in **Vercel → the campus project →
Settings → Environment Variables**:

| Name | Value | Environments | Type |
| --- | --- | --- | --- |
| `STUDIO_BRIDGE_TOKEN` | the generated string | Production (and Preview if you test there) | **Sensitive** |

**Redeploy** after adding it — Vercel only picks up environment changes on a new
build.

Notes:

- Minimum 24 characters. A shorter value is treated as unset, and the bridge
  endpoints answer `503 Studio bridge is not configured`.
- The plaintext is never written to the database. The campus stores only a
  SHA-256 of it on the `studio_bridges` row, so you can tell that the token was
  rotated without the database ever holding the secret.
- Comparison is constant-time, over digests of both sides, so neither the value
  nor its length leaks through response timing.

### Rotating the token

Change it in **both** places — Vercel and the PC's `.env` — and restart the
bridge. There is no grace period; the old token stops working the moment Vercel
redeploys.

---

## Step 3 — Install the bridge on the Studio B PC

Open a terminal in the `studio-bridge` folder:

```bash
cd studio-bridge
npm install
```

Copy `.env.example` to `.env` and fill it in:

```ini
OBS_WEBSOCKET_URL=ws://127.0.0.1:4455
OBS_WEBSOCKET_PASSWORD=the-password-from-step-1
STUDIO_API_URL=https://campus.assetpilotedu.com
STUDIO_BRIDGE_TOKEN=the-token-from-step-2
STUDIO_BRIDGE_KEY=studio-b
```

- `STUDIO_BRIDGE_TOKEN` must match Vercel **exactly** — no quotes, no trailing
  space.
- `STUDIO_BRIDGE_KEY` names this machine. Leave it as `studio-b` unless you add
  a second OBS PC, in which case give that one its own key.
- Do not commit `.env`. It is git-ignored.

---

## Step 4 — Start it

```bash
npm start
```

Or double-click **`start-bridge.bat`**, which installs dependencies on first run
and then starts the agent.

A healthy start looks like:

```
[bridge] Blue Don Studio Bridge 1.0.0 — device "studio-b" → https://campus.assetpilotedu.com
[bridge] Connected to OBS at ws://127.0.0.1:4455
```

Leave the window open for the whole broadcast. Closing it takes the bridge
offline, and the console shows **DISCONNECTED** within about twenty seconds.

### Starting it automatically

If you would rather it come up with the PC, put a shortcut to
`start-bridge.bat` in the Startup folder: press <kbd>Win</kbd>+<kbd>R</kbd>, run
`shell:startup`, and drop the shortcut there. OBS does not need to be open
first — the bridge waits for it and connects when it appears.

---

## Step 5 — Confirm it from the console

Open `/broadcast/studio` as Broadcasting crew:

1. **System health** → *Studio bridge* reads **CONNECTED**, and *OBS WebSocket*
   reads **CONNECTED** with the OBS version underneath.
2. **Scenes** shows your real OBS scene names, not the placeholder list, with the
   current scene outlined in red.
3. Press **LIVE** on a different scene. OBS switches within about three seconds.
4. Stop the bridge. Within twenty seconds the panel reads **Bridge disconnected
   · last seen …** and every OBS button greys out.

If all four behave, you are done.

---

## Troubleshooting

| What you see | What it means |
| --- | --- |
| Console says *Bridge not set up* | `STUDIO_BRIDGE_TOKEN` is missing on Vercel, or shorter than 24 characters. Add it and redeploy. |
| Console says *No bridge has paired yet* | The token is set, but no agent has ever authenticated. Start the bridge and check its window for errors. |
| Bridge window logs `401 — Invalid bridge token` | The two tokens differ. Re-copy it into `.env`, watching for a trailing space. |
| Bridge window logs `503 — Studio bridge is not configured` | Vercel has no token, or the deploy predates it. Redeploy. |
| Console says *Bridge online · OBS not connected* | The agent is talking to the campus but not to OBS. Open OBS, re-check Step 1, and confirm the password. |
| Console says *Turn on Studio Mode in OBS* | Preview and Take need OBS Studio Mode. Turn it on, or use the per-scene **LIVE** buttons. |
| A command shows *expired before the bridge picked it up* | The agent was down or unreachable when it was pressed. Commands expire after 45 seconds rather than firing late. |
| `npm install` fails | Node is missing or too old. Install Node 20 LTS and try again. |

## Security notes

- The OBS password and the OBS stream key never leave the Studio B PC. The agent
  does not read them into telemetry, log them, or send them anywhere.
- The browser never receives `STUDIO_BRIDGE_TOKEN`. Commands are queued through a
  server action; only the server and the agent know the secret.
- The agent runs a **whitelist** of seven command kinds. Anything else is
  refused. The same seven are a Postgres enum, so the database itself cannot
  hold an arbitrary OBS request.
- Scene names are validated against the list OBS just reported, both on the
  server and again in the agent, before they are passed to OBS.
- Starting and stopping the actual OBS stream is limited to Producers, Floor
  Directors, Broadcasting officers, and advisors. Other crew can run the console
  and switch scenes.

## The two agent endpoints

Both need `Authorization: Bearer <STUDIO_BRIDGE_TOKEN>`. Neither is reachable
with a normal campus login, and neither returns campus data.

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/studio/bridge/commands?bridge=studio-b` | `GET` | Claims queued commands. Doubles as the heartbeat behind CONNECTED / DISCONNECTED. |
| `/api/studio/bridge/state` | `POST` | Posts OBS telemetry and the outcome of each command. |
