import { useState, useEffect } from 'react';
import { forumApi } from '../api/api';
import { MessageSquare, Heart, Send, Plus } from 'lucide-react';
import './Forum.css';

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [activeCommunity, setActiveCommunity] = useState('all');
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', community: 'general', tags: '' });
    const [commentTexts, setCommentTexts] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [posting, setPosting] = useState(false);

    useEffect(() => { loadCommunities(); }, []);
    useEffect(() => { loadPosts(); }, [activeCommunity]);

    async function loadPosts() {
        try {
            const res = await forumApi.getPosts(activeCommunity === 'all' ? '' : activeCommunity);
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch { setPosts([]); }
    }

    async function loadCommunities() {
        try {
            const res = await forumApi.getCommunities();
            const data = await res.json();
            setCommunities(Array.isArray(data) ? data : []);
        } catch { setCommunities([]); }
    }

    async function handleCreatePost(e) {
        e.preventDefault();
        setPosting(true);
        try {
            const tags = newPost.tags.split(',').map(t => t.trim()).filter(Boolean);
            const res = await forumApi.createPost({ ...newPost, tags });
            if (res.ok) {
                setNewPost({ title: '', content: '', community: 'general', tags: '' });
                setShowNewPost(false);
                loadPosts(); loadCommunities();
            }
        } catch { alert('Failed to create post.'); }
        finally { setPosting(false); }
    }

    async function handleLike(postId) {
        try {
            await forumApi.toggleLike(postId);
            loadPosts();
        } catch {}
    }

    async function handleComment(postId) {
        const text = commentTexts[postId];
        if (!text?.trim()) return;
        try {
            await forumApi.addComment(postId, { text });
            setCommentTexts({ ...commentTexts, [postId]: '' });
            loadPosts();
        } catch {}
    }

    function getInitials(name) {
        return (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    return (
        <>
            <h1 className="section-title">Community Forum</h1>
            <div className="forum-layout">
                <div className="card communities-card">
                    <h3>Communities</h3>
                    <div className="community-list">
                        {communities.map(c => (
                            <button key={c.id}
                                className={`community-btn ${activeCommunity === c.id ? 'active' : ''}`}
                                onClick={() => setActiveCommunity(c.id)}>
                                <span>{c.name}</span>
                                <span className="count">{c.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="forum-main">
                    {/* New Post Form */}
                    <div className="card new-post-card">
                        <h3>
                            <MessageSquare size={18} />
                            {showNewPost ? 'Create Post' : 'Share with the community'}
                        </h3>
                        {!showNewPost ? (
                            <button className="btn btn-primary" onClick={() => setShowNewPost(true)}>
                                <Plus size={16} /> New Post
                            </button>
                        ) : (
                            <form className="new-post-form" onSubmit={handleCreatePost}>
                                <input type="text" placeholder="Post title" required
                                    value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} />
                                <textarea rows="3" placeholder="What's on your mind?" required
                                    value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} />
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <select value={newPost.community} onChange={e => setNewPost({ ...newPost, community: e.target.value })}>
                                        <option value="general">General</option>
                                        <option value="budgeting">Budgeting</option>
                                        <option value="investing">Investing</option>
                                        <option value="savings">Savings</option>
                                        <option value="tips">Tips & Tricks</option>
                                    </select>
                                    <input type="text" placeholder="Tags (comma separated)" style={{ flex: 1 }}
                                        value={newPost.tags} onChange={e => setNewPost({ ...newPost, tags: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="submit" className="btn btn-primary" disabled={posting}>
                                        {posting ? 'Posting…' : 'Post'}
                                    </button>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowNewPost(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Posts */}
                    {posts.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                            <p className="text-muted">No posts yet. Be the first to share!</p>
                        </div>
                    ) : posts.map(post => (
                        <div className="post-card" key={post._id}>
                            <div className="post-header">
                                <div className="post-avatar">{getInitials(post.user?.name)}</div>
                                <div>
                                    <div className="post-author">{post.user?.name || 'Anonymous'}</div>
                                    <div className="post-date">{timeAgo(post.createdAt)}</div>
                                </div>
                            </div>
                            <div className="post-title">{post.title}</div>
                            <div className="post-content">{post.content}</div>
                            {post.tags?.length > 0 && (
                                <div className="post-tags">
                                    {post.tags.map((tag, i) => <span className="post-tag" key={i}>{tag}</span>)}
                                </div>
                            )}
                            <div className="post-actions">
                                <button className="post-action-btn" onClick={() => handleLike(post._id)}>
                                    <Heart size={16} /> {post.likes?.length || 0}
                                </button>
                                <button className="post-action-btn"
                                    onClick={() => setExpandedComments({ ...expandedComments, [post._id]: !expandedComments[post._id] })}>
                                    <MessageSquare size={16} /> {post.comments?.length || 0}
                                </button>
                            </div>

                            {expandedComments[post._id] && (
                                <div className="comments-section">
                                    {post.comments?.map((c, i) => (
                                        <div className="comment-item" key={i}>
                                            <div className="comment-avatar">{getInitials(c.name)}</div>
                                            <div className="comment-body">
                                                <span className="c-name">{c.name}</span>
                                                <div className="c-text">{c.text}</div>
                                                <div className="c-date">{timeAgo(c.createdAt)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="comment-form">
                                        <input type="text" placeholder="Write a comment…"
                                            value={commentTexts[post._id] || ''}
                                            onChange={e => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                            onKeyDown={e => e.key === 'Enter' && handleComment(post._id)} />
                                        <button className="btn btn-primary" onClick={() => handleComment(post._id)}>
                                            <Send size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
