export default {
  async fetch(request) {
    const url = new URL(request.url);

    // API Endpoint
    if (url.pathname === "/api/check") {
      const target = url.searchParams.get("url");

      if (!target) {
        return json({
          success: false,
          message: "Please provide a URL."
        }, 400);
      }

      try {
        const redirects = [];
        let current = target;

        for (let i = 0; i < 10; i++) {
          const response = await fetch(current, {
            method: "GET",
            redirect: "manual"
          });

          const status = response.status;

          redirects.push({
            url: current,
            status: status
          });

          if (status >= 300 && status < 400) {
            const location = response.headers.get("Location");

            if (!location) break;

            current = new URL(location, current).href;
          } else {
            break;
          }
        }

        return json({
          success: true,
          original_url: target,
          final_url: current,
         	redirect_count: redirects.length - 1,
          chain: redirects
        });

      } catch (e) {
        return json({
          success: false,
          message: e.message
        }, 500);
      }
    }

    return new Response(
      "Redirect Checker API is running.",
      {
        headers: {
          "Content-Type": "text/plain"
        }
      }
    );
  }
};

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data, null, 2),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
  );
}
