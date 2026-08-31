# File uploads

Lisa — every place on campus where someone can attach a video, photo, or PDF,
who is allowed to do it, and what the size rules actually are.

## The two upload paths

There is one hard constraint behind all of this: **Vercel rejects any function
request body over 4.5 MB before our code runs**. A form that tries to push a
bigger file through a Server Action fails with no usable error message, because
the request never arrives.

So campus has two upload paths:

| Path | Used by | Ceiling | Why |
|------|---------|---------|-----|
| **Signed URL → Supabase** | Campus video | **50 MB** | Browser PUTs the file straight to storage, skipping our server entirely |
| **Server Action (multipart)** | Every photo and PDF | **4 MB** | Matches `experimental.serverActions.bodySizeLimit` in `next.config.ts` |

`src/config/uploads.ts` is the single source of truth for the Server Action
path — `IMAGE_UPLOAD_MAX_BYTES`, the accepted MIME list, and the file-picker
`accept` strings. Every image surface imports from there rather than declaring
its own number, so no form can promise a limit the platform will not honor.

## Photos are shrunk in the browser

A phone photo is routinely 6–12 MB, which is well over the 4 MB ceiling. Rather
than telling students their photo is too big, the browser resizes it before the
form submits.

`src/lib/uploads/prepare-upload.ts` decodes the picked file, scales the longest
edge down (2400 px max), and re-encodes it, stepping down through a
quality/dimension ladder until it fits. PNG and WebP re-encode to **WebP** so
transparency survives — a club logo flattened onto a white square is a bug.
Everything else becomes JPEG.

The user sees "Resized from 9.1 MB to 1.4 MB so it can be uploaded."

What cannot be shrunk gets a plain error instead of a dead submit button:

- **PDF over 4 MB** — "compress the PDF, or photograph the receipt instead of scanning it"
- **Animated GIF or SVG over 4 MB** — re-encoding would destroy it, so it is refused
- **HEIC that the browser cannot decode** — Safari converts it to JPEG; other
  browsers pass it through untouched (the server accepts HEIC), and only refuse
  it if it is also oversized

`useUploadGuard` (`src/lib/uploads/use-upload-guard.ts`) is the hook every form
uses. It owns the preview URL, swaps the prepared file back into the file input
via `DataTransfer`, and exposes `note` / `error` for `UploadGuardNotice`.

## Where uploads live

| Surface | Route | Takes | Who can upload |
|---------|-------|-------|----------------|
| **Campus video** | `/media`, `/organizations/broadcasting?tab=media` | Video, 50 MB | Admin, advisor, Broadcasting officers, Broadcast Academy members |
| **Sports highlight video** | `/madonna/sports`, `/madonna/sports/reel` | Video, 50 MB | Same as campus video |
| **Sports desk images** | `/organizations/broadcasting?tab=sports-desk` | Opponent + team logos, player photos | Admin, advisor, Broadcasting officers, Academy |
| **Highlight thumbnail** | `/sports`, `/madonna/sports` | Photo | Any signed-in student (publishes as `PENDING` for desk review) |
| **Cricut shop listing** | `/cricut/shop` | Product photo | Cricut officers, admins/advisors, active club members |
| **Cricut design idea** | `/cricut/designs` | Reference photo | Any signed-in student |
| **Club invoice receipt** | `/organizations/{slug}?tab=invoices` | Photo **or PDF** | Any ACTIVE member of that club |
| **Corner listing** | `/corner` | Item photo | Students, staff, faculty, alumni (not parents or sponsors) |
| **Club documents** | `/organizations/{slug}?tab=documents` | **Link only, no file** | Officers with `org:documents:edit` |

Invoice clubs are IT Club, Broadcasting, and Cricut Club (`INVOICE_CLUB_SLUGS`).
Note that `/corner` soft-redirects to `/cricut/shop` while focused-clubs mode is
on, so the Corner listing form is not reachable in the current IA.

## Pasting a link instead of uploading

Several surfaces take a URL as an alternative to a file, which is the escape
hatch for anything over the limits — a long game recording, a Drive folder, a
YouTube upload:

| Surface | Field | Note |
|---------|-------|------|
| Campus video | Hosted video URL | Copy mentions YouTube and Google Drive ("Anyone with the link") |
| Sports highlight | Video URL | YouTube, Drive, or a campus media link |
| Sports desk images | Logo / photo URL | Any `https://` image |
| Club documents | File URL | Google Doc, PDF, anything linkable |

Drive links are stored as plain URLs — there is no Drive API integration, and
nothing validates that the sharing permission is actually public.

## Storage

Everything lands in **Supabase Storage** (no Vercel Blob, no S3), in the
`campus-media` bucket by default, under a per-surface prefix:

| Prefix | Content |
|--------|---------|
| `videos/` | Campus video |
| `sports-schools/` | Opponent logos, player photos, highlight thumbnails |
| `cricut-shop/`, `cricut-designs/` | Cricut photos |
| `club-invoices/` | Receipt scans |
| `corner-store/` | Corner listings |

`SUPABASE_SERVICE_ROLE_KEY` is required for **every** upload path. Without it,
each form degrades to its URL-paste field (or hides the picker) and says storage
is not configured — it never silently drops the file.
