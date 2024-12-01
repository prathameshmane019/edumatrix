import dbConnect from '@/utils/dbConnect'; // Import your DB connection utility
import Classes from '@/models/classSchema'; // Ensure the correct path for your schema
import { ObjectId } from 'mongoose';

export default async function handler(req, res) {
    await dbConnect();

    const { method } = req;

    switch (method) {
        // CREATE a new class
        case 'POST':
            try {
                const classData = req.body;

                // Validate incoming data
                if (!classData.id || !classData.teacher || !classData.institute) {
                    return res.status(400).json({ success: false, message: 'Missing required fields' });
                }

                const newClass = await Classes.create(classData);
                res.status(201).json({ success: true, data: newClass });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        // GET all classes or a single class by ID
        case 'GET':
            try {
                const { id } = req.query;

                if (id) {
                    const singleClass = await Classes.findById(id)
                        .populate('students', 'name email') // Adjust to match the Student schema fields
                        .populate('teacher', 'name department') // Adjust to match Faculty schema fields
                        .populate('subjects.sem1', 'name code') // Adjust to match Subject schema fields
                        .populate('subjects.sem2', 'name code') // Adjust to match Subject schema fields
                        .populate('batches.students', 'name') // Adjust to match Student schema fields
                        .populate('institute', 'name location'); // Adjust to match Institute schema fields

                    if (!singleClass) {
                        return res.status(404).json({ success: false, message: 'Class not found' });
                    }

                    return res.status(200).json({ success: true, data: singleClass });
                }

                const allClasses = await Classes.find({})
                    .populate('students', 'name email')
                    .populate('teacher', 'name department')
                    .populate('subjects.sem1', 'name code')
                    .populate('subjects.sem2', 'name code')
                    .populate('batches.students', 'name')
                    .populate('institute', 'name location');

                res.status(200).json({ success: true, data: allClasses });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        // UPDATE a class by ID
        case 'PUT':
            try {
                const { id } = req.query;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ success: false, message: 'Invalid ID format' });
                }

                const updatedClass = await Classes.findByIdAndUpdate(id, req.body, {
                    new: true,
                    runValidators: true,
                })
                    .populate('students', 'name email')
                    .populate('teacher', 'name department')
                    .populate('subjects.sem1', 'name code')
                    .populate('subjects.sem2', 'name code')
                    .populate('batches.students', 'name')
                    .populate('institute', 'name location');

                if (!updatedClass) {
                    return res.status(404).json({ success: false, message: 'Class not found' });
                }

                res.status(200).json({ success: true, data: updatedClass });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        // DELETE a class by ID
        case 'DELETE':
            try {
                const { id } = req.query;

                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ success: false, message: 'Invalid ID format' });
                }

                const deletedClass = await Classes.findByIdAndDelete(id);

                if (!deletedClass) {
                    return res.status(404).json({ success: false, message: 'Class not found' });
                }

                res.status(200).json({ success: true, message: 'Class deleted successfully' });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }
            break;

        // Method not allowed
        default:
            res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
            res.status(405).json({ success: false, message: `Method ${method} not allowed` });
    }
}
