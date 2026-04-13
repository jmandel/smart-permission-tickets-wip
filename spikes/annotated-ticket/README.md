# Annotated Ticket Spike

This spike experiments with a standalone annotated ticket renderer outside the IG.

Inputs:

- `ticket.json`: the source ticket payload
- `ticket-annotations.json`: ordered annotation groups using JSON Pointers
- `render.js`: a small renderer that preserves a recognizable JSON shape while attaching tutorial notes to selected sections
- `server.ts`: a tiny Bun static server for local review

The point of the spike is to test the visual model first, before deciding how to embed something similar into the IG.

## Run locally

```bash
cd /home/jmandel/work/spt-plan33-spec/spikes/annotated-ticket
bun --watch server.ts
```

Then open <http://localhost:8011>.

Notes:

- Static asset edits (`index.html`, `styles.css`, `render.js`, `ticket.json`, `ticket-annotations.json`) are served straight from disk, so a normal browser refresh picks them up immediately.
- `bun --watch` matters mainly for keeping the server process current if `server.ts` itself changes.
