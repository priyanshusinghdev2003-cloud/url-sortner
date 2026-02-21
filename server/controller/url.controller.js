import { nanoid } from "nanoid";
import Url from "../model/url.model.js";
import User from "../model/user.model.js";

export const createShortUrl = async (req, res) => {
  try {
    const { longUrl, userId } = req.body;

    if (!longUrl) {
      return res
        .status(400)
        .json({ message: "URL is required", success: false });
    }

    const existing = await Url.findOne({ longUrl });
    if (existing) {
      return res.json({
        shortUrl: `${process.env.BASE_URL}/${existing.shortCode}`,
        success: true,
        message: "URL already exists",
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    let shortCode;

    while (true) {
      shortCode = nanoid(7);

      try {
        await Url.create({
          userId: user._id,
          shortCode,
          longUrl,
        });
        break;
      } catch (err) {
        if (err.code === 11000) continue;
        throw err;
      }
    }

    return res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      success: true,
      message: "URL created successfully",
    });
  } catch (error) {
    console.error("Create URL Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const redirectToUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    // 🔥 Optional: expiry check
    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).send("Link expired");
    }

    // 🔥 Increment clicks (atomic)
    await Url.updateOne({ shortCode: code }, { $inc: { clicks: 1 } });

    return res.redirect(url.longUrl);
  } catch (error) {
    console.error("Redirect Error:", error);
    return res.status(500).send("Server error");
  }
};

export const getUserUrls = async (req, res) => {
  try {
    const { userId } = req.params;

    const urls = await Url.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      urls,
      success: true,
      message: "URLs fetched successfully",
    });
  } catch (error) {
    console.error("Get User URLs Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const url = await Url.findByIdAndDelete(id);

    if (!url) {
      return res.status(404).json({ message: "URL not found", success: false });
    }

    return res.status(200).json({
      success: true,
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("Delete URL Error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
