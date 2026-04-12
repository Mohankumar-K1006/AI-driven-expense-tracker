const express = require("express");
const router = express.Router();
const ForumPost = require("../models/ForumPost");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get all posts (latest first), optionally filtered by community
router.get("/", auth, async (req, res) => {
    try {
        const filter = {};
        if (req.query.community && req.query.community !== "all") {
            filter.community = req.query.community;
        }

        const posts = await ForumPost.find(filter)
            .populate("user", "name role")
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get community list with post counts
router.get("/communities", auth, async (req, res) => {
    try {
        const counts = await ForumPost.aggregate([
            { $group: { _id: "$community", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const communities = [
            { id: "all", name: "All Discussions", count: 0 },
            { id: "general", name: "General", count: 0 },
            { id: "budgeting", name: "Budgeting", count: 0 },
            { id: "investing", name: "Investing", count: 0 },
            { id: "savings", name: "Savings", count: 0 },
            { id: "tips", name: "Tips & Tricks", count: 0 }
        ];

        let total = 0;
        counts.forEach(c => {
            total += c.count;
            const comm = communities.find(x => x.id === (c._id || "general"));
            if (comm) comm.count = c.count;
        });
        communities[0].count = total;

        res.json(communities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new post
router.post("/", auth, async (req, res) => {
    try {
        const { title, content, community, tags } = req.body;
        
        const newPost = new ForumPost({
            user: req.user.id,
            title,
            content,
            community: community || "general",
            tags: tags || []
        });

        await newPost.save();
        
        const populatedPost = await ForumPost.findById(newPost._id).populate("user", "name role");
        res.json(populatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle Like
router.put("/:id/like", auth, async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const idx = post.likes.indexOf(req.user.id);
        if (idx > -1) {
            post.likes.splice(idx, 1);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: idx === -1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Comment
router.post("/:id/comment", auth, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await ForumPost.findById(req.params.id);
        
        if (!post) return res.status(404).json({ message: "Post not found" });

        const user = await User.findById(req.user.id);

        const newComment = {
            user: req.user.id,
            name: user.name,
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
