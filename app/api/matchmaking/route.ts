import { NextResponse } from "next/server";
import { joinMatchmaking } from "@/services/matchmaking.service";
import { friendlyErrorMessage } from "@/lib/utils";

export async function POST(req:Request){

    try{

        const body = await req.json();

        const result = await joinMatchmaking(body);

        return NextResponse.json(result);

    }

    catch(error){

        return NextResponse.json({

            success:false,

            message: friendlyErrorMessage(error)

        },{

            status:400

        });

    }

}