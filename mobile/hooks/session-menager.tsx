import { getPhpSessionIdPhpSessIdPost } from "@/backend-client";
import { Children, createContext, ReactNode, useContext, useState, useEffect } from "react";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/utils/storageItemsHelper";


/** 
 * Kada korisnik udje na account stranicu tada samo 
 * Proveriti
 * 
 * 
 * **/
export type Account = {
  nickname: string;
  email: string;
  password: string; 
}

type Session = {
    id: string
    club: string | null
    created_at: string
}

type sessionContextType = {
    session: Session | null,
    account: Account | null,
    authorized: boolean,
    isLoading: boolean,
    handleSignIn: (account: Account) => Promise<void>,
    handleSignOut: () => void
    refetchSessionId: () => Promise<void>,
}

const sessionContext = createContext<sessionContextType>({} as sessionContextType)

export const useSession = () => useContext(sessionContext)

export const SessionProvider = ({children} : {children : ReactNode}) => {
    const [account, setAccount] = useState<Account | null>(null)
    const [session, setSessionId] = useState<Session | null>(null)
    const authorized = !!account && !!session
    const [isLoading, setIsLoading] = useState(true)

    const fetchSessionId = async (accountOverride?: Account | null) => {
        if (!session) setIsLoading(true);
        const currentAccount = accountOverride === undefined ? account : accountOverride;
        if (currentAccount == null){
            setSessionId(null)
            setIsLoading(false);
            return
        }
        try {
            const response = await getPhpSessionIdPhpSessIdPost({body: {username: currentAccount.email, password: currentAccount.password}})
            console.log(JSON.stringify(response))
            if (response.data?.PHPSESSID) {
                let now = new Date()
                setSessionId({
                    id: response.data.PHPSESSID,
                    club: response.data.clubName,
                    created_at: now.toISOString()
                });
                console.log("Session refreshed:", response.data.PHPSESSID);
            }
        }
        catch (error) {
            console.error("Failed to fetch session ID")
        } finally {
            setIsLoading(false);
        }
    }

    const handleSignIn = async (account : Account) => {
        setAccount(account);
        setStorageItem('account', JSON.stringify(account));
        await fetchSessionId(account);
    }

    const handleSignOut = () => {
        setAccount(null)
        setSessionId(null)
        removeStorageItem('account');
    }

    const refetchSessionId = async () => {
        await fetchSessionId();
    }

    useEffect(() => {
        const storedAccount = getStorageItem('account');
        if (storedAccount) {
            try {
                const parsedAccount = JSON.parse(storedAccount);
                setAccount(parsedAccount);
                fetchSessionId(parsedAccount);
            } catch (error) {
                console.error("Failed to parse stored account");
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    const value = {
        session, account, authorized, handleSignIn, handleSignOut, isLoading, refetchSessionId
    }

    return <sessionContext.Provider value={value}>
        {children}  
    </sessionContext.Provider>
}


