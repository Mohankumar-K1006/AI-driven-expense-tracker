const express = require("express");
const router = express.Router();
const ForumPost = require("../models/ForumPost");
const User = require("../models/User");
const auth = require("../middleware/auth");

// 🗣️ Get all posts (latest first)
router.get("/", auth, async (req, res) => {
    try {
        const posts = await ForumPost.find()
            .populate("user", "name role") // get author details
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗣️ Create a new post
router.post("/", auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const newPost = new ForumPost({
            user: req.user.id,
            title,
            content
        });

        await newPost.save();
        
        // Return populated post
        const populatedPost = await ForumPost.findById(newPost._id).populate("user", "name role");
        res.json(populatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ❤️ Toggle Like
router.put("/:id/like", auth, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Check if user already liked it
        const idx = post.likes.indexOf(req.user.id);
        if (idx > -1) {
            post.likes.splice(idx, 1); // unlike
        } else {
            post.likes.push(req.user.id); // like
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: idx === -1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 💬 Add Comment
router.post("/:id/comment", auth, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await ForumPost.findById(req.params.id);
        
        if (!post) return res.status(404).json({ message: "Post not found" });

        const user = await User.findById(req.user.id);

        const newComment = {
            user: req.user.id,
            name: user.name, // save name for quick render
            text
        };

        post.comments.push(newComment);
        await post.save();

        res.json(post.comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
