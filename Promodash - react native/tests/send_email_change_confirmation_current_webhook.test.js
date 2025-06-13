const axios = require("axios");

describe("POST /api/send_email_change_confirmation_current_webhook", () => {
  it("should return 400 if currentEmail is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/send_email_change_confirmation_current_webhook", {
      newEmail: "new@email.com"
    }).catch(e => e.response);
    expect(res.status).toBe(400);
  });
});
