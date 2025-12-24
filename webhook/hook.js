import express from "express";
import crypto from "crypto";
import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 45678;

const SECRET = process.env.WEBHOOK_SECRET;
const DEPLOY_SCRIPT = process.env.DEPLOY_SCRIPT;

if (!SECRET) {
    throw new Error("WEBHOOK_SECRET is not defined");
}

app.use(express.json());

function verifySignature(req) {
    const sig = req.headers["x-hub-signature-256"];
    if (!sig) return false;

    const hmac = crypto.createHmac("sha256", SECRET);
    const digest =
        "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(sig),
        Buffer.from(digest)
    );
}

app.post("/deploy", (req, res) => {
    if (!verifySignature(req)) {
        return res.status(401).send("Invalid signature");
    }

    if (req.body.ref !== "refs/heads/master") {
        return res.send("Ignored branch");
    }

    exec(`bash ${DEPLOY_SCRIPT}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return;
        }
        console.log(stdout);
    });

    res.send("Deploy triggered");
});

app.listen(PORT, () => {
    console.log(`Webhook listening on ${PORT}`);
});
