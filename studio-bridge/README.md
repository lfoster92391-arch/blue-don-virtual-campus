# Blue Don Studio Bridge

The OBS agent for the Broadcast Control Studio. It runs on the Studio B PC, not
on the campus site.

Full install instructions, including the OBS WebSocket setup and how to generate
the shared token: **[../docs/STUDIO_BRIDGE_SETUP.md](../docs/STUDIO_BRIDGE_SETUP.md)**.

## Quick start

```bash
cd studio-bridge
npm install
copy .env.example .env      # then fill in .env
npm start
```

Or double-click `start-bridge.bat`.

## What it does

Every few seconds it:

1. Connects to OBS over OBS WebSocket (local, `ws://127.0.0.1:4455`).
2. Polls the campus for queued commands — this poll is also the heartbeat that
   makes the console read **CONNECTED**.
3. Runs any whitelisted command against OBS.
4. Posts OBS telemetry (scene list, program / preview, streaming, recording,
   encoder counters) and the outcome of each command back to the campus.

## What it will not do

- It only runs the seven command kinds in `COMMAND_HANDLERS` in `index.js`.
  Anything else is refused, so no arbitrary OBS request can arrive over the
  network.
- Scene names are checked against the list OBS just reported before being used.
- `OBS_WEBSOCKET_PASSWORD` and the OBS stream key never leave this machine. They
  are not read into telemetry, not logged, and not sent to the campus.

## This is a separate package

It is not part of the Next.js app and is not installed by the site's build. It
has its own `package.json` and its own `node_modules`, and it needs Node 20 or
newer.
