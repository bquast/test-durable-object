export class MyCounter {
  constructor(state, env) {
    this.state = state;
    // 'blockConcurrencyWhile' ensures we initialize before handling requests
    this.state.blockConcurrencyWhile(async () => {
      let stored = await this.state.storage.get("value");
      this.value = stored || 0;
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    let currentValue = this.value;

    if (url.pathname === "/increment") {
      currentValue = ++this.value;
      await this.state.storage.put("value", this.value);
    } else if (url.pathname === "/decrement") {
      currentValue = --this.value;
      await this.state.storage.put("value", this.value);
    }

    return new Response(`Count is: ${currentValue}`);
  }
}

// 2. The Worker Entry Point
export default {
  async fetch(request, env) {
    // Every DO needs a unique ID. 
    // 'idFromName' creates a persistent ID based on a string (like a username or 'global')
    let id = env.COUNTER_OBJECT.idFromName("global-stats");
    
    // Get the "stub" for that specific object
    let obj = env.COUNTER_OBJECT.get(id);

    // Forward the request to the Durable Object
    return await obj.fetch(request);
  },
};