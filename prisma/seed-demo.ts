/**
 * Rich demo seed entrypoint.
 *
 * Runs the standard seed with the demo-content flags enabled so the campus is
 * fully populated for a walkthrough: community & business partners, the mentor
 * network, IT Club equipment inventory, the demo teacher's IT Club advisor
 * role, and the rich "Alex Martinez" student persona (clubs, academy, etc.).
 *
 * Usage: `npm run db:seed:demo`  (see docs/CLEAN_SLATE.md)
 *
 * The flags are set here (before importing the seed) so the same seed.ts logic
 * powers both clean-slate and demo modes without a separate code path.
 */
process.env.SEED_DEMO_CONTENT = "1";
process.env.SEED_DEMO_STUDENT_MEMBERSHIPS = "1";

await import("./seed");
