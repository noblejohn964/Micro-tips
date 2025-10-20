import { useState, useCallback } from 'react';
import { AccountId, Client, TransferTransaction, Hbar } from '@hashgraph/sdk';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  accountId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
}

export const useHederaWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    accountId: null,
    isConnected: false,
    isConnecting: false,
  });
  const { toast } = useToast();

  // Sync wallet with profile on mount
  const syncWalletWithProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('hedera_account_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.hedera_account_id) {
        setWallet({
          accountId: profile.hedera_account_id,
          isConnected: true,
          isConnecting: false,
        });
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Check if HashPack wallet is available
      if (!(window as any).hashpack) {
        toast({
          title: "Wallet Not Found",
          description: "Please install HashPack wallet extension or use manual connection",
          variant: "destructive",
        });
        setWallet(prev => ({ ...prev, isConnecting: false }));
        return;
      }

      // Connect to HashPack
      const hashpack = (window as any).hashpack;
      const appMetadata = {
        name: "TipHBAR",
        description: "Micro-tipping platform for creators",
        icon: "https://absolute.url/to/icon.png"
      };

      const response = await hashpack.connectToLocalWallet(appMetadata);
      
      if (response.success) {
        const accountId = response.accountIds[0];
        
        // Update profile with Hedera account ID
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ hedera_account_id: accountId })
            .eq('id', user.id);
        }

        setWallet({
          accountId,
          isConnected: true,
          isConnecting: false,
        });

        toast({
          title: "Wallet Connected",
          description: `Connected to ${accountId}`,
        });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  }, [toast]);

  const connectManualWallet = useCallback(async (accountId: string) => {
    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      // Validate Hedera account ID format (0.0.xxxxx)
      const accountIdPattern = /^0\.0\.\d+$/;
      if (!accountIdPattern.test(accountId)) {
        toast({
          title: "Invalid Account ID",
          description: "Please enter a valid Hedera account ID (e.g., 0.0.1234567)",
          variant: "destructive",
        });
        setWallet(prev => ({ ...prev, isConnecting: false }));
        return;
      }

      // Verify account exists on Hedera network
      const response = await fetch(
        `https://mainnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
      );
      
      if (!response.ok) {
        toast({
          title: "Account Not Found",
          description: "This Hedera account does not exist on the network",
          variant: "destructive",
        });
        setWallet(prev => ({ ...prev, isConnecting: false }));
        return;
      }

      // Update profile with Hedera account ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ hedera_account_id: accountId })
          .eq('id', user.id);
      }

      setWallet({
        accountId,
        isConnected: true,
        isConnecting: false,
      });

      toast({
        title: "Wallet Connected",
        description: `Connected to ${accountId}`,
      });
    } catch (error) {
      console.error('Manual wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to verify wallet on Hedera network",
        variant: "destructive",
      });
      setWallet(prev => ({ ...prev, isConnecting: false }));
    }
  }, [toast]);

  const sendTip = useCallback(async (
    toAccountId: string,
    amount: number,
    message?: string
  ) => {
    if (!wallet.isConnected || !wallet.accountId) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const hashpack = (window as any).hashpack;
      
      // Create transaction
      const transaction = await new TransferTransaction()
        .addHbarTransfer(wallet.accountId, new Hbar(-amount))
        .addHbarTransfer(toAccountId, new Hbar(amount))
        .setTransactionMemo(message || 'Tip via TipHBAR')
        .freezeWithSigner(hashpack.signer);

      // Sign and execute
      const response = await hashpack.sendTransaction(transaction);

      if (response.success) {
        // Record tip in database
        const { data: { user } } = await supabase.auth.getUser();
        const { data: recipient } = await supabase
          .from('profiles')
          .select('id')
          .eq('hedera_account_id', toAccountId)
          .single();

        if (user && recipient) {
          await supabase.from('tips').insert([{
            to_user_id: recipient.id,
            amount: amount,
            transaction_id: response.transactionId,
            status: 'completed',
            message: message || null,
          }]);
        }

        toast({
          title: "Tip Sent!",
          description: `Successfully sent ${amount} HBAR`,
        });

        return response.transactionId;
      }
    } catch (error) {
      console.error('Tip error:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to send tip",
        variant: "destructive",
      });
    }
  }, [wallet, toast]);

  return {
    wallet,
    connectWallet,
    connectManualWallet,
    sendTip,
    syncWalletWithProfile,
  };
};
