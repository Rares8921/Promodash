const axios = require("axios");

describe("POST /api/2fa", () => {
  it("should return 400 if email is missing", async () => {
    const res = await axios.post("https://promodash.vercel.app/api/2fa", {
      code: "123456"
    }).catch(e => e.response);
    expect(res.status).toBe(400);
  });
});
