import AccountAvatar from '@/components/accountScreen/account-avatar';
import CreateAccountModal from '@/components/accountScreen/create-account-modal';
import EditAccountModal from '@/components/accountScreen/edit-account-modal';
import { Account, useSession } from '@/hooks/session-menager';
import { cn } from '@/utils/cn';
import { getStorageItem, setStorageItem } from '@/utils/storageItemsHelper';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';


export default function AccountScreen() {
  const { account: activeAccount, handleSignIn, handleSignOut, refetchSessionId, sessionId, isLoading: isSessionLoading, authorized } = useSession();
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    let accounts_string = getStorageItem("accounts");
    if (!accounts_string) {
      setStorageItem("accounts", "[]");
    }
    else {
      let accounts_dict : Array<Account> = JSON.parse(accounts_string);
      setAccounts(accounts_dict)
    }
  }, [])

  const handleCreateAccount = (newAccount: Account) => {
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    setStorageItem("accounts", JSON.stringify(updatedAccounts));
    setShowCreateModal(false);
  };

  const onSignOut = () => {
    handleSignOut();
  };

  const handleEditAccount = (updatedAccount: Account) => {
    const updatedAccounts = accounts.map((acc) =>
      acc.email === updatedAccount.email ? updatedAccount : acc
    );
    setAccounts(updatedAccounts);
    setStorageItem("accounts", JSON.stringify(updatedAccounts));
    setShowEditModal(false);
    setEditingAccount(null);

    if (activeAccount?.email === updatedAccount.email) {
        handleSignIn(updatedAccount);
    }
  };

  const handleDeleteAccount = (email: string) => {
    const updatedAccounts = accounts.filter((acc) => acc.email !== email);
    setAccounts(updatedAccounts);
    setStorageItem("accounts", JSON.stringify(updatedAccounts));
    setShowEditModal(false);
    setEditingAccount(null);

    if (activeAccount?.email === email) {
        handleSignOut();
    }
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setShowEditModal(true);
  }

  return (
    <View className="flex flex-col justify-center items-center p-10 h-screen w-screen bg-background">
      {accounts.length > 0 ? 
        <>
          {activeAccount ? 
            <View className="w-full flex flex-col items-center gap-6">
              {/* Profile Header */}
              <View className='flex justify-center items-center relative border-red-400'>
                <AccountAvatar className='' account={activeAccount} />
                <View className={cn(isSessionLoading ? "bg-orange-400" : authorized ? "bg-green-400": "bg-red-400", 'w-5 h-5 !rounded-full absolute top-0 right-0')}></View>
              </View>
              
              {/* Account Info Card */}
              <View className="w-full bg-card rounded-2xl p-5 gap-4">
                <Text className="text-foreground-muted text-sm font-medium uppercase tracking-wider">
                  Account Details
                </Text>
                
                <View className="gap-3">
                  <View className="flex-row justify-between items-center py-2 border-b border-border">
                    <Text className="text-foreground-secondary">Nickname</Text>
                    <Text className="text-foreground font-medium">{activeAccount.nickname}</Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center py-2 border-b border-border">
                    <Text className="text-foreground-secondary">Email</Text>
                    <Text className="text-foreground font-medium">{activeAccount.email}</Text>
                  </View>
                </View>
              </View>
              <View>
                <Pressable className='bg-primary' onPress={() => refetchSessionId()}><Text>Fetch Session</Text></Pressable>
                <Text className='text-foreground-muted'>
                  {isSessionLoading ? "Fetching session..." : `Session ID: ${sessionId}, Authorized: ${authorized}`}
                </Text>
              </View>

              {/* Sign Out Button */}
              <Pressable 
                onPress={onSignOut}
                className="w-full bg-danger/10 py-3 rounded-xl items-center"
              >
                <Text className="text-danger font-semibold">Sign Out</Text>
              </Pressable>
            </View>
            :
            <View className='w-full flex flex-col gap-5'>
              <Text className='text-foreground text-xl text-center'>
                Choose account :
              </Text>
              <View className='flex flex-row flex-wrap justify-center items-center gap-4'>
                {accounts.map((account, index) => (
                  <AccountAvatar 
                    key={account.email + index} 
                    account={account} 
                    onPress={() => {
                      handleSignIn(account);
                    }}
                    onLongPress={() => openEditModal(account)}
                  />
                ))}
                <AccountAvatar account={null} onPress={() => setShowCreateModal(true)} />
              </View>
            </View>
          } 
        </> : 
        <View className='w-full flex flex-col gap-5'>
          <Text className='text-foreground text-xl text-center'>
            Choose account :
          </Text>
          <View className='flex justify-center items-center'>
            <AccountAvatar account={null} onPress={() => setShowCreateModal(true)} />
          </View>
        </View>
      }

      <CreateAccountModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAccount={handleCreateAccount}
      />

      <EditAccountModal
        visible={showEditModal}
        account={editingAccount}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
        }}
        onSaveAccount={handleEditAccount}
        onDeleteAccount={handleDeleteAccount}
      />
    </View>
  );
}