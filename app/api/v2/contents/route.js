import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import { parse, isValid, format } from 'date-fns';

export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (!_id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const data = await req.json();

        const subject = await Subject.findById(_id);

        if (!subject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        let updateData = {};

        if (subject.subType === 'tg') {
            if (data.tgSessions) {
                updateData.tgSessions = data.tgSessions.map(session => ({
                    date: formatDate(session.date),
                    pointsDiscussed: Array.isArray(session.pointsDiscussed) 
                        ? session.pointsDiscussed 
                        : session.pointsDiscussed.split(',').map(point => point.trim()),
                    _id: session._id
                }));
            }
        } else {
            if (data.content) {
                updateData.content = data.content.map(item => ({
                    ...item,
                    batchStatus: subject.subType === 'practical' && Array.isArray(item.batchStatus)
                        ? item.batchStatus.map(batch => ({
                            ...batch,
                            proposedDate: formatDate(batch.proposedDate),
                            completedDate: formatDate(batch.completedDate)
                        }))
                        : undefined
                }));
            }
        }

        const updatedSubject = await Subject.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { 
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        return NextResponse.json({
            message: "Subject updated successfully",
            subject: updatedSubject
        }, { status: 200 });

    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ 
            error: "Failed to update subject", 
            details: error.message 
        }, { status: 500 });
    }
}

function formatDate(dateString) {
    if (!dateString) return undefined;
    
    try {
        let parsedDate;
        if (typeof dateString === 'string') {
            // Try parsing different date formats
            const formats = ['yyyy-MM-dd', 'dd-MM-yyyy', 'MM/dd/yyyy'];
            for (let dateFormat of formats) {
                parsedDate = parse(dateString, dateFormat, new Date());
                if (isValid(parsedDate)) {
                    break;
                }
            }
        } else {
            parsedDate = new Date(dateString);
        }

        if (!isValid(parsedDate)) {
            console.warn(`Invalid date: ${dateString}`);
            return undefined;
        }

        return format(parsedDate, 'yyyy-MM-dd');
    } catch (error) {
        console.error("Error parsing date:", error);
        return undefined;
    }
}