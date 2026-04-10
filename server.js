import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = "PUT_YOUR_PAGE_ACCESS_TOKEN_HERE";

// 🔹 التحقق
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 🔹 استقبال الأحداث
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry) {
      for (const change of entry.changes) {

        if (change.field === "feed" && change.value.comment_id) {
          const commentId = change.value.comment_id;
          const message = change.value.message;

          console.log("New comment:", message);

          // 🔥 الرد
          await fetch(`https://graph.facebook.com/v19.0/${commentId}/comments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: "شكرا على تعليقك 🙏 مرحبا بك!",
              access_token: PAGE_ACCESS_TOKEN,
            }),
          });
        }
      }
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
