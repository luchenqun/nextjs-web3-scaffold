import React, { useEffect, useState, createContext, useMemo, useContext } from "react";
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from "ethers";
import BEP20USDTAbi from './abi/BEP20USDT'

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [installed, setInstalled] = useState(true);
  const [address, setAddress] = useState(undefined);
  const [chainId, setChainId] = useState(0);
  const [provider, setProvider] = useState(null);

  const BEP20USDTContract = useMemo(() => provider && new ethers.Contract(process.env.NEXT_PUBLIC_BEP20USDT_ADDRESS, BEP20USDTAbi, provider).connect(provider.getSigner()), [provider]);
  const signer = useMemo(() => provider && provider.getSigner(), [provider]);
  const connectMetamask = async () => {
    const param =
    {
      "chainId": "0x65",
      "chainName": "NELOMeta",
      "rpcUrls": ["https://rpc.nelo.world"],
      "nativeCurrency": {
        "name": "NELO Chain",
        "symbol": "NELO",
        "decimals": 18
      },
      "blockExplorerUrls": ["https://analysis.nelo.world/"]
    }

    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("chainId", chainId, typeof chainId)
      if (chainId != parseInt(param.chainId)) {
        let success = true
        try {
          const reply = await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: param.chainId }] });
          console.log("wallet_switchEthereumChain reply", reply)
        } catch (switchError) {
          console.log("wallet_switchEthereumChain error", switchError)
          if (switchError.code === 4902) {
            try {
              await ethereum.request({ method: 'wallet_addEthereumChain', params: [param] });
            } catch (addError) {
              console.log("wallet_addEthereumChain error", addError)
              success = false
            }
          }
        }
        if (success) {
          await ethereum.request({ method: 'eth_requestAccounts' })
        } else {
          return Promise.reject(null)
        }
      }

      setChainId(chainId)
      let accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length == 0) {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      }
      handleAccountsChanged(accounts)
      const provider = new ethers.providers.Web3Provider(ethereum)
      setProvider(provider)

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged);
      ethereum.on('disconnect', handleDisconnect)

      console.log('Installed MetaMask!', chainId);
    } else {
      console.log('Please install MetaMask!');
      setInstalled(false)
    }
    return Promise.resolve(ethereum)
  }

  const tryConnectMetamask = async () => {
    const ethereum = await detectEthereumProvider();
    if (ethereum) {
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      if (chainId == 0x65) {
        setChainId(chainId)
        const accounts = await ethereum.request({ method: 'eth_accounts' })
        handleAccountsChanged(accounts)
        const provider = new ethers.providers.Web3Provider(ethereum)
        setProvider(provider)

        ethereum.on('chainChanged', handleChainChanged)
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('disconnect', handleDisconnect)
      }
      console.log('Installed MetaMask!', chainId);
    } else {
      console.log('Please install MetaMask!');
      setInstalled(false)
    }
    return ethereum
  }

  const handleChainChanged = async () => {
    console.log("metamask chainChanged")
  }

  const handleAccountsChanged = async (accounts) => {
    console.log("metamask accountsChanged", accounts)
    setAddress(accounts[0])
  }

  const handleDisconnect = async () => {
    console.log("metamask disconnect")
  }

  useEffect(() => {
    // 主动去连接一下
    tryConnectMetamask()
    return () => {
      // ethereum.removeListener('chainChanged', handleChainChanged)
      // ethereum.removeListener('accountsChanged', handleAccountsChanged);
      // ethereum.removeListener('disconnect', handleDisconnect)
    };
  }, [])


  useEffect(() => {
    const tid = setInterval(() => {
      setAddress(parseInt(Math.random() * 100000));
    }, 600000);

    return () => {
      clearInterval(tid);
    };
  }, []);

  return <WalletContext.Provider value={{
    installed,
    address,
    chainId,
    provider,
    signer,
    BEP20USDTContract,
    connectMetamask
  }}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("Missing wallet context");
  }

  return context;
};
