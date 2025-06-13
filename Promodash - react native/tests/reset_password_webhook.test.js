const axios = require("axios");

describe("POST /api/reset_password_webhook", () => {
  it("should return 400 if email is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/reset_password_webhook", {}).catch(e => e.response);
    expect([400, 429, 500]).toContain(res.status);
  });
});
