/**
 * Bare-metal health page: no React layout, no fonts, no service worker, no client JS.
 * Use to distinguish Chromium host/network crashes from app JS crashes.
 */
export function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OK</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; background: #fff; }
  </style>
</head>
<body>
  <h1>OK</h1>
  <p>Campus host is reachable. This page has no app JavaScript.</p>
  <p><a href="/login">Try login</a></p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
