const express = require('express');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');

const router = express.Router();

// GET /api/requests (Fetch all requests for Admin)
router.get('/', async (req, res) => {
    try {
        const requests = await ConnectionRequest.find({}).sort({ createdAt: -1 });

        const formattedRequests = requests.map(req => ({
            id: req._id.toString(),
            menteeId: req.menteeId.toString(),
            mentorId: req.mentorId.toString(),
            menteeName: req.menteeName,
            mentorName: req.mentorName,
            selectedSlot: req.selectedSlot,
            status: req.status,
            timestamp: new Date(req.createdAt).getTime()
        }));

        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error("Get All Requests Err:", error);
        res.status(500).json({ message: 'Server error fetching all requests' });
    }
});

// POST /api/requests
router.post('/', async (req, res) => {
    try {
        const { menteeId, mentorId, menteeName, mentorName, selectedSlot } = req.body;

        const newRequest = new ConnectionRequest({
            menteeId,
            mentorId,
            menteeName,
            mentorName,
            selectedSlot,
            status: 'pending'
        });

        await newRequest.save();

        // Optional: decrement the session slot capacity
        if (selectedSlot) {
            const [dateStr, timeStr] = selectedSlot.split(' at ');
            if (dateStr && timeStr) {
                await User.updateOne(
                    { _id: mentorId, "sessionSlots.date": dateStr, "sessionSlots.time": timeStr },
                    { $inc: { "sessionSlots.$.available": -1 } }
                );
            }
        }

        const responseMapping = {
            id: newRequest._id.toString(),
            menteeId: newRequest.menteeId.toString(),
            mentorId: newRequest.mentorId.toString(),
            menteeName: newRequest.menteeName,
            mentorName: newRequest.mentorName,
            selectedSlot: newRequest.selectedSlot,
            status: newRequest.status,
            timestamp: new Date(newRequest.createdAt).getTime()
        };

        res.status(201).json(responseMapping);
    } catch (error) {
        console.error("Create Request Err:", error);
        res.status(500).json({ message: 'Server error creating request' });
    }
});

// GET /api/requests/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query; // pass role as query param

        let query = {};
        if (role === 'mentor') {
            query.mentorId = userId;
        } else if (role === 'mentee') {
            query.menteeId = userId;
        } else {
            return res.status(400).json({ message: 'Valid role query parameter required' });
        }

        const requests = await ConnectionRequest.find(query).sort({ createdAt: -1 });

        const formattedRequests = requests.map(req => ({
            id: req._id.toString(),
            menteeId: req.menteeId.toString(),
            mentorId: req.mentorId.toString(),
            menteeName: req.menteeName,
            mentorName: req.mentorName,
            selectedSlot: req.selectedSlot,
            status: req.status,
            timestamp: new Date(req.createdAt).getTime()
        }));

        res.status(200).json(formattedRequests);
    } catch (error) {
        console.error("Get Requests Err:", error);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
});

// PATCH /api/requests/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['accepted', 'rejected', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedRequest = await ConnectionRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const responseMapping = {
            id: updatedRequest._id.toString(),
            menteeId: updatedRequest.menteeId.toString(),
            mentorId: updatedRequest.mentorId.toString(),
            menteeName: updatedRequest.menteeName,
            mentorName: updatedRequest.mentorName,
            selectedSlot: updatedRequest.selectedSlot,
            status: updatedRequest.status,
            timestamp: new Date(updatedRequest.createdAt).getTime()
        };

        res.status(200).json(responseMapping);
    } catch (error) {
        console.error("Update Request Err:", error);
        res.status(500).json({ message: 'Server error updating request' });
    }
});

// DELETE /api/requests/:id  (mentee cancels a pending request)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ConnectionRequest.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({ message: 'Request cancelled successfully' });
    } catch (error) {
        console.error('Delete Request Err:', error);
        res.status(500).json({ message: 'Server error cancelling request' });
    }
});

module.exports = router;
