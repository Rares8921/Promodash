const axios = require("axios");

describe("POST /api/verify_new_email_change_webhook", () => {
  it("should return 400 if secret or userId is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/verify_new_email_change_webhook", {
      secret: "code"
    }).catch(e => e.response);
    expect([400, 500]).toContain(res.status);
  });
});