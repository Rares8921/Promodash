const axios = require("axios");

describe("POST /api/verify_email_webhook", () => {
  it("should return 400 if userId or secret is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/verify_email_webhook", {
      userId: "user"
    }).catch(e => e.response);
    expect(res.status).toBe(400);
  });
});
