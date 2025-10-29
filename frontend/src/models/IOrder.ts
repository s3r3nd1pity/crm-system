import {IGroup} from "@/models/IGroup";
import {IComment} from "@/models/IComment";

export interface IOrder {
    id: number
    name: string | null
    surname: string | null
    email: string | null
    phone: string | null
    age: number | null
    course: string | null
    course_format: string | null
    course_type: string | null
    status: string | null
    sum: number | null
    alreadyPaid: number | null
    created_at: string
    utm: string | null
    msg: string | null
    manager: string | null
    group: IGroup | null
    comments: IComment[]
}

