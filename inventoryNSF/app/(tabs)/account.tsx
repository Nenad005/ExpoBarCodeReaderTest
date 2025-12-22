import AccountAvatar from '@/components/accountScreen/account-avatar';
import CreateAccountModal from '@/components/accountScreen/create-account-modal';
import EditAccountModal from '@/components/accountScreen/edit-account-modal';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';


export type Account = {
  id: string;
  nickname: string;
  email: string;
  password: string; 
}

export default function AccountScreen() {
  const [accounts, setAccounts] = useState<Array<Account>>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    let accounts_string = SecureStore.getItem("accounts");
    if (!accounts_string) {
      SecureStore.setItem("accounts", "[]");
      SecureStore.setItem("active_account_id", "");
    }
    else {
      let accounts_dict : Array<Account> = JSON.parse(accounts_string);
      setAccounts(accounts_dict)
      let active_account_id = SecureStore.getItem("active_account_id")
      if (active_account_id && active_account_id.length > 1){
        let activeAccount = accounts_dict.find(account => account.id = active_account_id)
        if (activeAccount != undefined) setActiveAccount(activeAccount)
      }
    }
  }, [])

  const handleCreateAccount = (newAccount: Account) => {
    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    SecureStore.setItem("accounts", JSON.stringify(updatedAccounts));
    setShowCreateModal(false);
  };

  const handleSignOut = () => {
    setActiveAccount(null);
    SecureStore.setItem("active_account_id", "");
  };

  const handleEditAccount = (updatedAccount: Account) => {
    const updatedAccounts = accounts.map((acc) =>
      acc.id === updatedAccount.id ? updatedAccount : acc
    );
    setAccounts(updatedAccounts);
    SecureStore.setItem("accounts", JSON.stringify(updatedAccounts));
    setShowEditModal(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = (accountId: string) => {
    const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
    setAccounts(updatedAccounts);
    SecureStore.setItem("accounts", JSON.stringify(updatedAccounts));
    setShowEditModal(false);
    setEditingAccount(null);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setShowEditModal(true);
  }

  // console.log(accounts)

  return (
    <View className="flex flex-col justify-center items-center p-10 h-screen w-screen bg-background">
      {accounts.length > 0 ? 
        <>
          {activeAccount ? 
            <View className="w-full flex flex-col items-center gap-6">
              {/* Profile Header */}
              <AccountAvatar account={activeAccount} />
              
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
                  
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-foreground-secondary">Account ID</Text>
                    <Text className="text-foreground-muted text-xs">{activeAccount.id}</Text>
                  </View>
                </View>
              </View>

              {/* Sign Out Button */}
              <Pressable 
                onPress={handleSignOut}
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
                    key={account.id + index} 
                    account={account} 
                    onPress={() => {
                      setActiveAccount(account);
                      SecureStore.setItem("active_account_id", account.id);
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