'use client';

import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import { motion } from 'framer-motion';
import { Zap, Wallet, Link, Loader2, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MAGIC_STONE_ABI, CONTRACT_ADDRESS } from '../lib/abi';
import { SoulComposite } from '../utils/soulAggregator';

interface SoulInjectorProps {
    soulData?: SoulComposite;
}

export default function SoulInjector({ soulData }: SoulInjectorProps) {
    const { address, isConnected } = useAccount();
    const { connect, isPending: isConnectPending } = useConnect();
    const { disconnect } = useDisconnect();

    const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

    // Read: Check balance to see if user already has a soul
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: MAGIC_STONE_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        }
    });

    const hasSoul = balance ? Number(balance) > 0 : false;

    // Write: Mint logic
    const { writeContract, isPending: isWritePending, error: writeError, data: hash } = useWriteContract();

    // Wait for Transaction Receipt
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (hash) {
            setTxHash(hash);
        }
    }, [hash]);

    useEffect(() => {
        if (isConfirmed) {
            refetchBalance();
        }
    }, [isConfirmed, refetchBalance]);


    const handleConnect = () => {
        connect({
            connector: coinbaseWallet({
                appName: 'MagicStone',
                preference: 'smartWalletOnly',
            })
        });
    };

    const handleMint = () => {
        if (!address || !soulData) return;

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: MAGIC_STONE_ABI,
                functionName: 'safeMint',
                args: [
                    address,
                    soulData.archetype_name || 'Unknown',
                    soulData.synchronization?.level || 1
                ],
            });
        } catch (e) {
            console.error("Mint Error:", e);
        }
    };

    const isMinting = isWritePending || isConfirming;

    return (
        <div className="flex flex-col items-center gap-6 w-full text-zinc-200">
            {/* Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest border transition-colors ${isConnected
                ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
                : 'bg-zinc-900/50 border-zinc-700/50 text-zinc-500'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                {isConnected ? 'Link Established' : 'Neural Link Offline'}
                <span className="mx-1 opacity-30">|</span>
                Base Sepolia
            </div>

            {!isConnected ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 w-full"
                >
                    <div className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <Wallet className="w-8 h-8 text-zinc-400" />
                    </div>

                    <div className="text-center space-y-1 mb-2">
                        <h3 className="text-sm font-medium text-zinc-200">Connect Smart Wallet</h3>
                        <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">
                            Initialize secure connection to the Drifting World via Base Sepolia.
                        </p>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={isConnectPending}
                        className="group relative w-full max-w-[240px] px-6 py-3 bg-zinc-900 border border-zinc-700 hover:border-emerald-500/50 rounded-xl overflow-hidden transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative flex items-center justify-center gap-2">
                            {isConnectPending ? (
                                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                            ) : (
                                <Link className="w-4 h-4 text-emerald-400" />
                            )}
                            <span className="text-xs font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider">
                                {isConnectPending ? 'Connecting...' : 'Initialize Link'}
                            </span>
                        </div>
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 w-full"
                >
                    {/* Wallet Info */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Connected Identity</div>
                        <div className="font-mono text-xs text-emerald-400 bg-emerald-900/10 px-3 py-1.5 rounded border border-emerald-500/20">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                        <button
                            onClick={() => disconnect()}
                            className="text-[9px] text-zinc-600 hover:text-red-400 mt-1 transition-colors"
                        >
                            [Disconnect]
                        </button>
                    </div>

                    {/* Already Minted State */}
                    {hasSoul ? (
                        <div className="flex flex-col items-center gap-3 p-4 bg-purple-900/10 border border-purple-500/30 rounded-xl w-full max-w-[280px]">
                            <CheckCircle className="w-6 h-6 text-purple-400" />
                            <div className="text-center">
                                <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider mb-1">Soul Bound</h4>
                                <p className="text-[10px] text-purple-300/70">
                                    You have already minted an artifact for this soul.
                                </p>
                            </div>
                        </div>
                    ) : isConfirmed ? (
                        /* Success State (Just finished) */
                        <div className="flex flex-col items-center gap-3 p-4 bg-emerald-900/10 border border-emerald-500/30 rounded-xl w-full max-w-[280px] animate-in fade-in zoom-in">
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                            <div className="text-center">
                                <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider mb-1">Materialization Complete</h4>
                                <a
                                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                                >
                                    View on BaseScan <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    ) : (
                        /* Mint Action or Pending */
                        <div className="w-full flex flex-col items-center gap-2">
                            {writeError && (
                                <div className="text-[10px] text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-500/20 max-w-[260px] text-center mb-2">
                                    {writeError.message.split('\n')[0].slice(0, 100)}...
                                </div>
                            )}

                            <button
                                onClick={handleMint}
                                disabled={isMinting || !soulData}
                                className={`group relative w-full max-w-[240px] px-6 py-4 bg-gradient-to-b from-zinc-800 to-zinc-900 border rounded-xl overflow-hidden transition-all duration-300 shadow-xl ${isMinting ? 'border-purple-500/50 cursor-wait' : 'border-zinc-700 hover:border-purple-500/50'
                                    }`}
                            >
                                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent transition-opacity ${isMinting ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'
                                    }`} />

                                <div className="relative flex flex-col items-center gap-2">
                                    {isMinting ? (
                                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                    ) : (
                                        <Zap className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                                    )}
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-zinc-200 group-hover:text-white uppercase tracking-wider">
                                            {isWritePending ? 'Confirm in Wallet...' : isConfirming ? 'Materializing...' : 'Mint Artifact'}
                                        </span>
                                        <span className="text-[9px] text-zinc-500 group-hover:text-purple-400/70">
                                            {(soulData?.archetype_name || 'Soul') + ' • Lvl ' + (soulData?.synchronization?.level || 1)}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
