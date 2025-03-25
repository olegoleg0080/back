import express from 'express';
import Post from '../models/Post.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Создание поста
router.post('/', auth, async (req, res) => {
    const post = new Post({ ...req.body, author: req.userId });
    await post.save();
    res.status(201).json(post);
});

// Редактирование поста
router.put('/:id', auth, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post || post.author.toString() !== req.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    Object.assign(post, req.body);
    await post.save();
    res.json(post);
});

// Удаление поста
router.delete('/:id', auth, async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post || post.author.toString() !== req.userId) {
        return res.status(403).json({ error: 'Нет доступа' });
    }
    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Пост удален' });
});

// Получение всех постов с инфой об авторах и признаком авторства
router.get('/', auth, async (req, res) => {
    const posts = await Post.find().populate('author', 'username');
    const postsWithOwnership = posts.map(post => ({
        ...post.toJSON(),
        isAuthor: post.author._id.toString() === req.userId
    }));
    res.json(postsWithOwnership);
});

export default router;