
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Subject from "@/models/subject";
import { formatDateForStorage, parseFlexibleDate } from "@/app/utils/dateFormater";

export async function PUT(req) {
    try {
        await connectMongoDB();
        const { searchParams } = new URL(req.url);
        const _id = searchParams.get("_id");

        if (!_id) {
            return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
        }

        const data = await req.json();

        console.log(data);
        
        let updateData = {};
        
        if (data.content) {
            updateData.content = data.content.map((item) => {
                // Handle different subject types
                switch (data.subType) {
                    case 'practical':
                        return {
                            ...item,
                            batchStatus: item.batchStatus?.map(batch => ({
                                ...batch,
                                proposedDate: batch.proposedDate ? formatDateForStorage(parseFlexibleDate(batch.proposedDate)) : null,
                                completedDate: batch.completedDate ? formatDateForStorage(parseFlexibleDate(batch.completedDate)) : null
                            }))
                        };
                    case 'theory':
                        return {
                            ...item,
                            proposedDate: item.proposedDate ? formatDateForStorage(parseFlexibleDate(item.proposedDate)) : null,
                            completedDate: item.completedDate ? formatDateForStorage(parseFlexibleDate(item.completedDate)) : null
                        };
                    default:
                        return item;
                }
            });
        }
        
        if (data.tgSessions) {
            updateData.tgSessions = data.tgSessions.map((session) => ({
                ...session,
                date: session.date ? formatDateForStorage(parseFlexibleDate(session.date)) : null,
                pointsDiscussed: Array.isArray(session.pointsDiscussed) 
                    ? session.pointsDiscussed 
                    : [session.pointsDiscussed]
            }));
        }

        const existingSubject = await Subject.findByIdAndUpdate(_id, updateData, { new: true });

        if (!existingSubject) {
            return NextResponse.json({ error: "Subject not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: "Subject updated successfully", 
            subject: existingSubject 
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating subject:", error);
        return NextResponse.json({ 
            error: "Failed to update subject", 
            details: error.message 
        }, { status: 500 });
    }
}