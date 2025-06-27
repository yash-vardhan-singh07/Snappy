// msgController.js
const msgModel = require("../model/msgModel");
const crypto = require("crypto");

const algorithm = process.env.MESSAGE_ALGORITHM;
const secretKey = process.env.MESSAGE_SECRET_KEY;

if (!algorithm || !secretKey) {
  throw new Error("MESSAGE_ALGORITHM or MESSAGE_SECRET_KEY is missing in .env");
}

// Encrypt a message
const encrypt = (msg) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(msg, "utf8"), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
};

// Decrypt a message
const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
};

// Add Message Controller
module.exports.addMessage = async (req, res) => {
  try {
    const { from, to, message } = req.body;

    if (!from || !to || !message) {
      return res.status(400).json({ msg: "Missing from, to, or message" });
    }

    const encryptedMsg = JSON.stringify(encrypt(message));
    const data = await msgModel.create({
      message: { text: encryptedMsg },
      users: [from, to],
      sender: from,
    });

    if (!data) {
      return res.status(500).json({ msg: "Failed to add message to the database." });
    }

    return res.status(200).json({ msg: "Message added successfully." });
  } catch (ex) {
    console.error("addMessage error:", ex);
    return res.status(500).json({ msg: "Server error", error: ex.message });
  }
};

// Get All Messages Controller
module.exports.getAllMessages = async (req, res) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ msg: "Missing from or to field" });
    }

    const messages = await msgModel.find({ users: { $all: [from, to] } }).sort({ updatedAt: 1 });

    const allMessages = messages.map((msg) => {
      const { iv, content } = JSON.parse(msg.message.text);
      return {
        fromSelf: msg.sender.toString() === from,
        message: decrypt({ iv, content }),
      };
    });

    return res.status(200).json(allMessages);
  } catch (ex) {
    console.error("getAllMessages error:", ex);
    return res.status(500).json({ msg: "Server error", error: ex.message });
  }
};
