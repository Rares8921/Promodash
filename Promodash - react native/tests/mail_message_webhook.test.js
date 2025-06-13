const axios = require("axios");

describe("POST /api/mail_message_webhook", () => {
  it("should return 400 if email is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/mail_message_webhook", {
      subject: "test"
    }).catch(e => e.response);
    expect([400, 429]).toContain(res.status);
  });
});
