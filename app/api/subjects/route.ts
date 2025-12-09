import { authOption } from "@/app/lib/auth"
import { SubjectSchema, SubjectType } from "@/app/lib/schemas/subject.schema";
import { db } from "@/lib/prisma";
import getServerSession from "next-auth"
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest){
    try {
        const session = await getServerSession(authOption);
    if (!session?.user || session.user.role !== "ADMIN") {
         return new NextResponse("Unauthorized", { status: 401 });
       }
   const json = await req.json().catch(()=>null);
   
   if(!json){
    return new NextResponse("Invalide Json", {status:400});

   }
  const parsed = SubjectSchema.safeParse(json)
  if(!parsed.success){
    return  NextResponse.json( { errors: parsed.error.flatten().fieldErrors },
        { status: 400 })
  }
const body:SubjectType = parsed.data;

const created = await db.subject.create({
    data :{
        name : body.name,
        code : body.code,
        classId:body.classId ?? null,
        teacherId:body.teacherId ?? null,
        
    }
}) 
return NextResponse.json({ success: true, data: created }, { status: 201 });
    } catch (error) {
       console.error("POST /api/subjects failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });  
    }
}