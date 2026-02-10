import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
    chains: [baseSepolia],
    connectors: [
        coinbaseWallet({
            appName: 'MagicStone',
            preference: 'smartWalletOnly', // Force Passkey experience
        }),
    ],
    transports: {
        [baseSepolia.id]: http(),
    },
});
