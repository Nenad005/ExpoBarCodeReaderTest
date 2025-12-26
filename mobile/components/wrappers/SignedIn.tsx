import { useSession } from "@/hooks/session-menager";
import { ReactNode } from "react";

export function SignedIn({children} : {children?: ReactNode}){
    const {account} = useSession();

    return account ? <>
        {children}
    </> : 
    <></>
}

export function SignedOut({children} : {children?: ReactNode}){
    const {account} = useSession();

    return account ? <></> : <>
        {children}
    </>
}