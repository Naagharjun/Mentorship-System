const express = require('express');
const User = require('../models/User');

const router = express.Router();

// GET /api/users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['mentor', 'mentee'] } });

        const formattedUsers = users.map(u => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
            skills: u.skills,
            bio: u.bio,
            specialization: u.specialization,
            availability: u.availability || ['Mon', 'Wed', 'Fri'], // Fallback if missing
            sessionSlots: u.sessionSlots || [],
            totalSessions: u.totalSessions || (u.role === 'mentor' ? 120 : 0),
            lastActive: u.lastActive,
            isBlocked: u.isBlocked
        }));

        res.status(200).json(formattedUsers);
    } catch (error) {
        console.error("Get All Users Err:", error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// GET /api/users/mentors
router.get('/mentors', async (req, res) => {
    try {
        const mentors = await User.find({ role: 'mentor' });

        const formattedMentors = mentors.map(m => ({
            id: m._id.toString(),
            name: m.name,
            email: m.email,
            role: m.role,
            avatar: m.avatar,
            skills: m.skills,
            bio: m.bio,
            specialization: m.specialization,
            availability: m.availability || ['Mon', 'Wed', 'Fri'], // Fallback if missing
            sessionSlots: m.sessionSlots || [],
            totalSessions: m.totalSessions || 120,
            lastActive: m.lastActive,
            isBlocked: m.isBlocked
        }));

        res.status(200).json(formattedMentors);
    } catch (error) {
        console.error("Get Mentors Err:", error);
        res.status(500).json({ message: 'Server error fetching mentors' });
    }
});

// POST /api/users/:id/heartbeat
router.post('/:id/heartbeat', async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndUpdate(id, { $set: { lastActive: new Date() } });
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error("Heartbeat Err:", error);
        res.status(500).json({ message: 'Heartbeat failed' });
    }
});

// PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // In a real app we'd verify the JWT user ID matches the param ID here.
        // For now, we trust the request.

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userResponse = {
            id: updatedUser._id.toString(),
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            skills: updatedUser.skills,
            bio: updatedUser.bio,
            specialization: updatedUser.specialization,
            availability: updatedUser.availability,
            sessionSlots: updatedUser.sessionSlots,
            totalSessions: updatedUser.totalSessions,
            isBlocked: updatedUser.isBlocked,
            education: updatedUser.education,
            experience: updatedUser.experience,
            interests: updatedUser.interests,
            lastActive: updatedUser.lastActive
        };

        res.status(200).json(userResponse);
    } catch (error) {
        console.error("Update User Err:", error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

module.exports = router;
