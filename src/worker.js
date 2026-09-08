export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      url.pathname === "/api/event" &&
      request.method === "POST"
    ) {
      try {
        const event = await request.json();

        if (
          event.event !== "copy_referral_code" &&
          event.event !== "referral_click"
        ) {
          return new Response("Invalid event", {
            status: 400
          });
        }

        const country =
          request.cf?.country || "unknown";

        const region =
          request.cf?.region || "unknown";

        /*
          blob1 = event type
          blob2 = page path
          blob3 = button label
          blob4 = country
          blob5 = region
          blob6 = session ID

          double1 = count
          double2 = viewport width
          double3 = time on page
        */

        env.ANALYTICS.writeDataPoint({
          blobs: [
            String(event.event || "unknown"),
            String(event.path || "unknown"),
            String(event.label || "unknown"),
            String(country),
            String(region),
            String(event.sessionId || "unknown")
          ],

          doubles: [
            1,
            Number(event.viewportWidth) || 0,
            Number(event.timeOnPage) || 0
          ],

          indexes: [
            "oxio-referral-site"
          ]
        });

        console.log({
          event: event.event,
          page: event.path,
          button: event.label,
          country,
          region,
          sessionId: event.sessionId,
          viewportWidth: event.viewportWidth,
          timeOnPage: event.timeOnPage
        });

        return new Response(null, {
          status: 204
        });
      } catch (error) {
        console.error("Analytics error", error);

        return new Response("Invalid request", {
          status: 400
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};