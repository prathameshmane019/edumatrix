import { NextResponse } from 'next/server';
import Grievance from '@/models/grievance';
import { connectMongoDB } from '@/libs/connectDb';
import { uploadImage } from '@/lib/uploadImage';


export async function POST(req) {
  console.log('Request Received');
  try {
    await connectMongoDB();

    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const issue = formData.get("issue");
    const suggestion = formData.get("suggestion");
   
    const files = formData.getAll("file");

    if (!name || !email || !issue ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    

    let uploadedImages = [];
    if (files.length > 0) {
      try {
        for (let file of files) {
          if (file && file.name) {
            const uploadResult = await uploadImage(file, 'grievance');
            if (!uploadResult || !uploadResult.secure_url) {
              throw new Error('Invalid upload result');
            }
            uploadedImages.push({
              image_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          }
        }
      } catch (error) {
        console.error('Image upload failed:', error);
        return NextResponse.json(
          { error: "Image upload failed", message: error.message },
          { status: 500 }
        );
      }
    }

    const grievanceData = {
      name,
      email,
      issue,
      suggestion,
      
      images: uploadedImages,
    };

    const newGrievance = new Grievance(grievanceData);
    await newGrievance.save();

    return NextResponse.json(
      { message: "Grievance submitted successfully", grievance: newGrievance },
      { status: 201 }
    );
  } catch (error) {
    console.error('Server Error:', error.message);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message || "Unexpected error occurred" },
      { status: 500 }
    );
  }
}
