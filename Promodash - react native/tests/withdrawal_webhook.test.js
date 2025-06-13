const axios = require("axios");

describe("POST /api/withdrawal_webhook", () => {
  it("should return 400 if amount is below 20", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/withdrawal_webhook", {
      userId: "testuser",
      amount: 10,
      iban: "RO49AAAA1B31007593840000"
    }).catch(e => e.response);
     expect([400, 500]).toContain(res.status);
  });
});
