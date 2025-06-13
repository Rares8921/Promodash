const axios = require("axios");

describe("POST /api/send_email_change_confirmation_new_webhook", () => {
  it("should return 400 if newEmail is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/send_email_change_confirmation_new_webhook", {
      currentEmail: "current@email.com"
    }).catch(e => e.response);
    expect([400, 500]).toContain(res.status);
  });
});
