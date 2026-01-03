import { getPhpSessionIdPhpSessIdPost, upsertWarehouseWarehousesUpdatePost } from "@/backend-client";
import { Children, createContext, ReactNode, useContext, useState, useEffect } from "react";
import { getStorageItem, setStorageItem, removeStorageItem } from "@/utils/storageItemsHelper";

export type Account = {
  nickname: string;
  email: string;
  password: string; 
}

type Session = {
    id: string
    club_name: string | null
    club_id: string
    created_at: string
}

type Warehouse = {
    id: string,
    name: string,
}

type AccountSessionsMap = Record<string, Session>;

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

const getAccountKey = (email: string, password: string): string => {
    return `${email}:${password}`;
};

const getStoredSessions = (): AccountSessionsMap => {
    const stored = getStorageItem('accountSessions');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return {};
        }
    }
    return {};
};

const saveSessionForAccount = (email: string, password: string, session: Session) => {
    const sessions = getStoredSessions();
    sessions[getAccountKey(email, password)] = session;
    setStorageItem('accountSessions', JSON.stringify(sessions));
};

const getSessionForAccount = (email: string, password: string): Session | null => {
    const sessions = getStoredSessions();
    return sessions[getAccountKey(email, password)] || null;
};

const removeSessionForAccount = (email: string, password: string) => {
    const sessions = getStoredSessions();
    delete sessions[getAccountKey(email, password)];
    setStorageItem('accountSessions', JSON.stringify(sessions));
};

const validateSession = async (sessionId: string): Promise<boolean> => {
    try {
        const cookieHeader = `PHPSESSID=${sessionId.trim()}`;
        const res = await fetch("https://nonstopfitness.upfit.cloud/reception/dashboard", {
            method: 'GET',
            credentials: 'omit',
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Cookie": cookieHeader,
            }
        });
        return res.url === "https://nonstopfitness.upfit.cloud/reception/dashboard";
    } catch (error) {
        console.error("Session validation failed:", error);
        return false;
    }
};

async function upsert_club(club: Warehouse){
    let res = await upsertWarehouseWarehousesUpdatePost({body: club})
}

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
            if (response.data?.PHPSESSID) {
                let now = new Date()
                const newSession: Session = {
                    id: response.data.PHPSESSID,
                    club_name: response.data.clubName,
                    club_id: response.data.clubId,
                    created_at: now.toISOString()
                };
                setSessionId(newSession);
                await upsert_club({id: response.data.clubId, name: response.data.clubName});
                saveSessionForAccount(currentAccount.email, currentAccount.password, newSession);
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
        setIsLoading(true);
        
        const storedSession = getSessionForAccount(account.email, account.password);
        if (storedSession) {
            const isValid = await validateSession(storedSession.id);
            if (isValid) {
                setSessionId(storedSession);
                console.log("Loaded validated stored session for account:", account.email);
                setIsLoading(false);
            } else {
                console.log("Stored session expired, fetching new one for:", account.email);
                removeSessionForAccount(account.email, account.password);
                await fetchSessionId(account);
            }
        } else {
            await fetchSessionId(account);
        }
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
        const initializeSession = async () => {
            const storedAccount = getStorageItem('account');
            if (storedAccount) {
                try {
                    const parsedAccount = JSON.parse(storedAccount);
                    setAccount(parsedAccount);
                    
                    const storedSession = getSessionForAccount(parsedAccount.email, parsedAccount.password);
                    if (storedSession) {
                        const isValid = await validateSession(storedSession.id);
                        if (isValid) {
                            setSessionId(storedSession);
                            console.log("Loaded validated stored session from memory for:", parsedAccount.email);
                            setIsLoading(false);
                        } else {
                            console.log("Stored session expired, fetching new one for:", parsedAccount.email);
                            removeSessionForAccount(parsedAccount.email, parsedAccount.password);
                            await fetchSessionId(parsedAccount);
                        }
                    } else {
                        await fetchSessionId(parsedAccount);
                    }
                } catch (error) {
                    console.error("Failed to parse stored account");
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        
        initializeSession();
    }, []);

    const value = {
        session, account, authorized, handleSignIn, handleSignOut, isLoading, refetchSessionId
    }

    return <sessionContext.Provider value={value}>
        {children}  
    </sessionContext.Provider>
}


