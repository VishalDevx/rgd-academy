import { authConfig } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/prisma";
import {getServerSession} from "next-auth/next"
import { redirect } from "next/navigation";
export default async function ResultsPage(){
    const session = await getServerSession(authConfig);
    if(!session?.user || session.user.role!=="STAFF"){
        redirect("/login")
    }

    const staff = await db.staff.findUnique({
        where : {userId : session.user.id}
    })

    if(!staff){
        return(
              <div className="p-6">
        <div className="border p-6 text-center text-muted-foreground rounded">
          No staff record found.
        </div>
      </div>
        )
    }
//class assigned

const classes = await db.class.findMany({
where : {teacherId:staff.id},
include:{
    students : {include : {user : true}}
},
    orderBy: { createdAt: "desc" },
})
}