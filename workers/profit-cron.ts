interface Env { DB: D1Database }

export default {
  async scheduled(_event: ScheduledEvent, env: Env) {
    // User-initiated claim endpoint now owns profit credits; cron must not auto-credit.
  },
}
