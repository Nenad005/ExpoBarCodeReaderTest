import { useSession } from "@/hooks/session-menager";
import { ReactNode } from "react";

export function Authorized({children} : {children?: ReactNode}){
    const {authorized} = useSession();

    return authorized ? <>
        {children}
    </> : 
    <></>
}

export function UnAuthorized({children} : {children?: ReactNode}){
    const {authorized} = useSession();

    return authorized ? <></> : <>
        {children}
    </>
}