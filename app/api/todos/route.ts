
import db from "@/lib/db";
import { connect } from "http2";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const NewTodo = z.object({
    title:z.string(),
    description:z.string(),
    priority:z.enum(["low", "medium", "high"]),
    duedate:z.date().optional(),
})
export async function POST(req:NextRequest){
    try{
        const session = await getServerSession();
        console.log(session);
        if(!session?.user?.email){
            return NextResponse.json({
                message:"unauthorized"
            })
        }
        else{
            const data = NewTodo.parse(await req.json());
            await db.task.create({
                data:{
                    title:data.title,
                    description:data.description,
                    priority:data.priority,
                    dueDate:data.duedate,
                    createdBy:{connect:{email:session?.user?.email}},
                    organization: { connect: { id: "1" } }
                }
            })
        }
    }catch(e){
        return NextResponse.json({
            message:"unauthorized"
        })
    }

}

export async function GET(req:NextResponse) {
    try{
        const session = await getServerSession();
        if(!session?.user?.email){
            return NextResponse.json({
                message:"unauthorized"
            })
        }
        else{
            const todos = await db.task.findMany({
                where: {
                    createdBy: {
                        email: session.user.email
                    }
                },
                include: {
                    createdBy: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    assignedTo: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    organization: {
                        select: {
                            name: true
                        }
                    },
                    comments: {
                        include: {
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return NextResponse.json(todos);
        }
    }
    catch(e){
        return NextResponse.json({
            message:"not avalibe"
        })
    }
}