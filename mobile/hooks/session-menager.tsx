import { getPhpSessionIdPhpSessIdPost } from "@/backend-client";
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
    club_id: number
    created_at: string
}

// Map of account key (email:password) -> session data
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

// Helper to create a unique key for an account (email + password combination)
const getAccountKey = (email: string, password: string): string => {
    return `${email}:${password}`;
};

// Helper to get stored sessions map
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

// Helper to save session for a specific account
const saveSessionForAccount = (email: string, password: string, session: Session) => {
    const sessions = getStoredSessions();
    sessions[getAccountKey(email, password)] = session;
    setStorageItem('accountSessions', JSON.stringify(sessions));
};

// Helper to get session for a specific account
const getSessionForAccount = (email: string, password: string): Session | null => {
    const sessions = getStoredSessions();
    return sessions[getAccountKey(email, password)] || null;
};

// Helper to remove session for a specific account
const removeSessionForAccount = (email: string, password: string) => {
    const sessions = getStoredSessions();
    delete sessions[getAccountKey(email, password)];
    setStorageItem('accountSessions', JSON.stringify(sessions));
};

// Helper to validate a session by checking if it's still active
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
        // If we get redirected away from dashboard, session is invalid
        return res.url === "https://nonstopfitness.upfit.cloud/reception/dashboard";
    } catch (error) {
        console.error("Session validation failed:", error);
        return false;
    }
};

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
                // Save the session for this specific account
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
        
        // Try to load existing session for this account first
        const storedSession = getSessionForAccount(account.email, account.password);
        if (storedSession) {
            // Validate the stored session before using it
            const isValid = await validateSession(storedSession.id);
            if (isValid) {
                setSessionId(storedSession);
                console.log("Loaded validated stored session for account:", account.email);
                setIsLoading(false);
            } else {
                console.log("Stored session expired, fetching new one for:", account.email);
                // Remove invalid session and fetch a new one
                removeSessionForAccount(account.email, account.password);
                await fetchSessionId(account);
            }
        } else {
            // No stored session, fetch a new one
            await fetchSessionId(account);
        }
    }

    const handleSignOut = () => {
        setAccount(null)
        setSessionId(null)
        removeStorageItem('account');
        // Note: We keep the session in storage so it can be reused if user signs back in
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
                    
                    // Try to load stored session for this account instead of fetching
                    const storedSession = getSessionForAccount(parsedAccount.email, parsedAccount.password);
                    if (storedSession) {
                        // Validate the stored session before using it
                        const isValid = await validateSession(storedSession.id);
                        if (isValid) {
                            setSessionId(storedSession);
                            console.log("Loaded validated stored session from memory for:", parsedAccount.email);
                            setIsLoading(false);
                        } else {
                            console.log("Stored session expired, fetching new one for:", parsedAccount.email);
                            // Remove invalid session and fetch a new one
                            removeSessionForAccount(parsedAccount.email, parsedAccount.password);
                            await fetchSessionId(parsedAccount);
                        }
                    } else {
                        // No stored session, fetch a new one
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


