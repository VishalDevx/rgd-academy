import { Grade } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";


interface EditClassFormPros{
   classes:{ name:string,
    grade :Grade,
    section :string | null,
    gradeCode : string | null,
    teacherId : string | null,
    academicSession:string,
   }
    onSubmit?: () => void;
}
export function EditClasses({classes:onSubmit}:EditClassFormPros){
    const router = useRouter()

    const [loading,setLoading] = useState(false);
    const [serverError,setServerError] = useState("");

}