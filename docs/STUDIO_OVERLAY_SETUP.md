# Studio overlay — OBS setup

How to get the Broadcast Control Studio's graphics — lower thirds, the score
bug, lineup and final cards — onto the stream.

This takes about five minutes and is done **once per OBS scene collection**. No
install, no token, no terminal: the overlay is a web page, and OBS knows how to
render web pages.

## What you are adding

A **Browser Source** pointed at a page on the campus site. The page has a
transparent background, so OBS composites it straight over the camera. It asks
the campus about once a second what should be on screen, and the console in
Studio B is what answers.

```
Studio console  ──Take live──►  Campus  ◄──polls every 1 s──  OBS Browser Source
```

Nothing here goes through the Studio Bridge. Graphics keep working even if the
bridge agent is closed — you just lose scene control from the console.

---

## Step 1 — Copy the overlay URL

1. Open **`/broadcast/studio`** as Broadcasting crew.
2. In the **Graphics** panel, press **Copy overlay URL**.

It looks like this:

```
https://campus.assetpilotedu.com/broadcast/overlay/8sQ2f1nR-K3wZpLm7yTbXcVd
```

> **Treat that URL like a key.** Anyone who has it can watch what the graphics
> engine is doing. It carries no login, no stream key, and nothing that is not
> already public on `/sports` — but it is still not something to post in a group
> chat. If it gets out, press **Rotate** in the Graphics panel and redo Step 2;
> the old URL dies immediately.

---

## Step 2 — Add the Browser Source in OBS

On the Studio B PC:

1. Pick the scene the graphics should appear on — usually your main program
   scene.
2. Under **Sources**, click **+** → **Browser**.
3. Name it **Campus Graphics** and click **OK**.
4. Fill in:
   - **URL** — paste the overlay URL from Step 1
   - **Width** — `1920`
   - **Height** — `1080`
   - **Custom CSS** — leave OBS's default alone. The page is already
     transparent; you do not need to add anything.
   - **Shutdown source when not visible** — **off**
   - **Refresh browser when scene becomes active** — **off**
5. Click **OK**.

The source will look empty. That is correct — nothing is on air yet.

### Put it on every scene

Graphics should survive a scene change. Rather than adding the source again on
each scene, right-click **Campus Graphics** → **Copy**, then on each other scene
right-click in the Sources list → **Paste (Reference)**. Every scene then shows
the same overlay, and there is still only one browser running.

Make sure it sits **above** the camera in the Sources list on each scene, or the
camera will cover it.

---

## Step 3 — Check it

1. Back in the console's **Graphics** panel, confirm it now says the overlay is
   attached. (Give it up to half a minute.)
2. Pick **Lower third**, type a name and a role, and press **Preview**. It shows
   in the console's **PVW** monitor. **OBS should not change** — that is what
   preview means.
3. Press **Take live**. It animates in over your camera within about a second.
4. Press **Remove**. It animates out.

If all four behave, you are done.

---

## Using it during a show

| Key | What happens |
| --- | --- |
| **Preview** | Cues the graphic on the console only |
| **Take live** | Puts it on air, replacing anything in the same part of the frame |
| **Update on air** | Fixes the copy without blanking the graphic |
| **Remove** | Pulls that one graphic |
| **Clear all** | Pulls everything, instantly. The panic key |

- **One graphic per region.** A lower third, a corner score bug, and a
  full-screen card each own their own part of the frame; taking a player ID
  replaces the lower third rather than landing on top of it.
- **The score is not typed twice.** Pick the game in **Game control** and the
  score bug reads that row live, so the number on air and the number on `/sports`
  cannot disagree. The clock and period come from the console clock.
- **Sponsor is one billboard.** Rotation, scheduling, and impression counts are
  not built.

---

## Troubleshooting

| What you see | Why | Fix |
| --- | --- | --- |
| OBS shows a **login page** | The URL lost its session key, or you pasted the studio URL instead of the overlay URL | Re-copy from the Graphics panel |
| OBS shows **404** or a blank error | The key was rotated after you pasted it | Press **Copy overlay URL** again and update the source |
| Console says **no overlay attached** | OBS is not loading the page — the source is hidden, shut down, or the PC is offline | Un-hide the source; turn off *Shutdown source when not visible*; right-click → **Refresh** |
| Graphics appear **behind the camera** | Source order | Drag **Campus Graphics** above the camera in Sources |
| A **white box** covers the frame | Custom CSS on the source is painting a background | Reset **Custom CSS** to the OBS default |
| Graphics **lag a second** | Expected — the overlay polls about once a second | Nothing to fix |
| Text is **cut off** | The Browser Source is not 1920 × 1080 | Set width and height, and reset any transform on the source |

Full architecture and what is deliberately not built:
[BROADCAST_STUDIO.md](./BROADCAST_STUDIO.md).
