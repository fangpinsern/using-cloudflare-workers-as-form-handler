export default {
  async fetch(request, env) {
    const CONTENT_TYPE = "Content-Type";
    const Content_Type_APPLICATION_JSON = "application/json";

    const Request_Type_INTEREST = "interest";
    const Request_Type_CONTACT = "contact";

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": CONTENT_TYPE,
    };

    async function readRequestBody(request) {
      const contentType = request.headers.get(CONTENT_TYPE);
      if (contentType == null) {
        return {};
      }
      if (contentType.includes(Content_Type_APPLICATION_JSON)) {
        return await request.json();
      }
      return {};
    }

    async function sendMessage(message) {
      const response = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": Content_Type_APPLICATION_JSON },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: message.toString(),
          }),
        }
      );
      return response;
    }

    function handleOptions(request) {
      if (
        request.headers.get("Origin") !== null &&
        request.headers.get("Access-Control-Request-Method") !== null &&
        request.headers.get("Access-Control-Request-Headers") !== null
      ) {
        // Handle CORS pre-flight request.
        return new Response(null, {
          headers: corsHeaders,
        });
      } else {
        // Handle standard OPTIONS request.
        return new Response(null, {
          headers: {
            Allow: "GET, HEAD, POST, OPTIONS",
          },
        });
      }
    }

    if (request.method === "POST") {
      const reqBody = await readRequestBody(request);
      const reqType = reqBody.type;
      let retBody = "Type not defined in request body";
      if (reqType == Request_Type_INTEREST || reqType == Request_Type_CONTACT) {
        await sendMessage(JSON.stringify(reqBody, null, 2));
        retBody = `Message sent`;
      }
      return new Response(JSON.stringify({ message: retBody }), {
        headers: corsHeaders,
      });
    } else if (request.method === "GET") {
      return new Response("The request was a GET");
    } else if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
  },
};
