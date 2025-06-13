const axios = require("axios");

describe("POST /api/send_verification_email_webhook", () => {
  it("should return 400 if email is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/send_verification_email_webhook", {}).catch(e => e.response);
    expect(res.status).toBe(400);
  });
});
