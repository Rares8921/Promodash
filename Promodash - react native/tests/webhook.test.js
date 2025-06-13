const axios = require("axios");

describe("POST /api/webhook", () => {
  it("should return 400 if click_hash is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/webhook", {
      advertiser_id: "test",
      order_id: "123",
      order_status: "approved",
      orderValue: 150
    }).catch(e => e.response);
    expect(res.status).toBe(400);
  });
});
