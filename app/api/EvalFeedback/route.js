import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/connectDb";
import Feedback from "@/models/feedback";

export async function GET(req) {
    try {
        const {searchParams}= new URL(req.url);

        const department = searchParams.get("department");
        const institute = searchParams.get('institute')
        const academicYear = searchParams.get('academicYear')
        const query = {};
        if(department){
            query.department = department;
        }
        if(institute){
            query.institute = institute;
        }
        // if(academicYear){
        //     query.academicYear = academicYear;
        // }
        
        query.isActive = false;
        console.log("Query",query);
        await connectMongoDB();
        let feedbacks
         feedbacks = await Feedback.find(query).populate("institute class","name").populate("class","name");
        console.log("Feedback fetched Successfully");
        console.log(feedbacks);
        return NextResponse.json(feedbacks,{status:200});
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to create feedback" },{status:500});
    }
}
