export class MyCounter {
  constructor(state, env) {
    this.storage = state.storage;
    // Create the table if it doesn't exist
    this.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS counter (
        id INTEGER PRIMARY KEY CHECK (id = 1), 
        val INTEGER
      )
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/increment") {
      // Atomic increment in SQL
      this.storage.sql.exec(`
        INSERT INTO counter (id, val) VALUES (1, 1)
        ON CONFLICT(id) DO UPDATE SET val = val + 1
      `);
    }

    // Get the current value
    const result = [...this.storage.sql.exec("SELECT val FROM counter WHERE id = 1")];
    const count = result.length > 0 ? result[0].val : 0;

    return new Response(`Count is: ${count}`);
  }
}

export default {
  async fetch(request, env) {
    const id = env.COUNTER_OBJECT.idFromName("global-test");
    const obj = env.COUNTER_OBJECT.get(id);
    return obj.fetch(request);
  }
};