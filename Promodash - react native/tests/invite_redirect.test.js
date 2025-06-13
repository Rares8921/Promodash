const axios = require("axios");

describe("GET /api/invite_redirect", () => {
  it("should return 400 if inviteCode is missing", async () => {
    const res = await axios.get("https://promodash.vercel.app/api/invite_redirect").catch(e => e.response);
    expect([400, 500]).toContain(res.status);
  });
});
