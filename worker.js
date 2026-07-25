export default {
  async fetch(request) {
    const url = new URL(request.url);

    // API endpoint
    if (url.pathname === "/api/check") {
      const target = url.searchParams.get("url");

      if (!target) {
        return json({
          success: false,
          error: "Missing URL parameter."
        }, 400);
      }

      try {
        let current = target;
        const chain = [];

        for (let i = 0; i < 10; i++) {
          const response = await fetch(current, {
            method: "GET",
            redirect: "manual"
          });

          const status = response.status;

          chain.push({
            url: current,
            status
          });

          if (status >= 300 && status < 400) {
            const location = response.headers.get("location");

            if (!location) break;

            current = new URL(location, current).href;
          } else {
            break;
          }
        }

        return json({
          success: true,
          original: target,
          final: current,
          redirects: chain.length - 1,
          chain
        });

      } catch (err) {
        return json({
          success: false,
          error: err.message
        }, 500);
      }
    }

    // Serve static files
    return new Response(
      "Worker is running. Open index.html or use /api/check?url=https://example.com"
    );
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
