import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Feedback from "@/models/feedback";

export async function GET(req) {
    try {
        const {searchParams}= new URL(req.url);

        const department = searchParams.get("department");
        const institute = searchParams.get('institute')
        const query = {};
        if(department){
            query.department = department;
        }
        if(institute){
            query.institute = institute;
        }
        query.isActive = false;
        await connectMongoDB();
        let feedbacks
         feedbacks = await Feedback.find(query);
         console.log(feedbacks);
        console.log("Feedback fetched Successfully");
        console.log(feedbacks);
        return NextResponse.json(feedbacks,{status:200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to create feedback" },{status:500});
    }
}
