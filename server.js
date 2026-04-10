import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === "feed" && change.value?.comment_id) {
          const commentId = change.value.comment_id;

          try {
            await fetch(`https://graph.facebook.com/v25.0/${commentId}/comments`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                message: "شكراً على تعليقك ❤️",
                access_token: PAGE_ACCESS_TOKEN
              })
            });
          } catch (error) {
            console.error("Error replying to comment:", error);
          }
        }
      }
    }
  }

  return res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
