import { getPhpSessionIdPhpSessIdPost } from "@/backend-client";
import { Children, createContext, ReactNode, useContext, useState } from "react";


/** 
 * Kada korisnik udje na account stranicu tada samo 
 * Proveriti
 * 
 * 
 * **/
export type Account = {
  id: string;
  nickname: string;
  email: string;
  password: string; 
}

type sessionContextType = {
    sessionID : string | null,
    account: Account | null,
    handleSignIn : (account: Account) => Promise<void>,
    handleSignOut: () => void
}

const sessionContext = createContext<sessionContextType>({} as sessionContextType)

export const useSession = useContext(sessionContext)

export const SessionProvider = ({children} : {children : ReactNode}) => {
    const [account, setAccount] = useState<Account | null>(null)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchSessionId = async () => {
        if (account == null){
            setSessionId(null)
            return
        }
        try {
            const response = await getPhpSessionIdPhpSessIdPost({body: {username: account.email, password: account.password}})
            if (response.data?.PHPSESSID) {
                setSessionId(response.data.PHPSESSID);
                console.log("Session refreshed:", response.data.PHPSESSID);
            }
        }
        catch (error) {
            console.error("Failed to fetch session ID")
        }
    }
}


