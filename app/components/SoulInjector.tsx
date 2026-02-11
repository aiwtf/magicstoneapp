'use client';

import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, ExternalLink, Fingerprint, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MAGIC_STONE_ABI, CONTRACT_ADDRESS } from '../lib/abi';
import { SoulComposite } from '../utils/soulAggregator';

interface SoulInjectorProps {
    soulData?: SoulComposite;
}

export default function SoulInjector({ soulData }: SoulInjectorProps) {
    const { address, isConnected, chainId } = useAccount();
    const { connect, isPending: isConnectPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain, isPending: isSwitching } = useSwitchChain();

    const isWrongNetwork = isConnected && chainId !== baseSepolia.id;

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

    const handleSwitchNetwork = () => {
        switchChain({ chainId: baseSepolia.id });
    };

    const handleMint = () => {
        if (!address || !soulData) return;

        // Force network switch if needed
        if (isWrongNetwork) {
            handleSwitchNetwork();
            return;
        }

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
    const isProcessing = isConnectPending || isMinting || isSwitching;
    const archetypeName = soulData?.archetype_name || 'Unknown';
    const level = soulData?.synchronization?.level || 1;

    // Determine which action to fire
    const handleAction = () => {
        if (isProcessing) return;
        if (!isConnected) {
            handleConnect();
        } else if (isWrongNetwork) {
            handleSwitchNetwork();
        } else if (!hasSoul && !isConfirmed) {
            handleMint();
        }
    };

    // Determine action label
    const getActionLabel = () => {
        if (!isConnected) {
            return isConnectPending
                ? 'Scanning Biometrics...'
                : 'Tap to Initialize Identity';
        }
        if (isWrongNetwork) return isSwitching ? 'Switching Plane...' : 'Switch to Ether Plane';
        if (hasSoul) return 'Soul Verified';
        if (isConfirmed) return 'Materialization Complete';
        if (isWritePending) return 'Awaiting Biometric Seal...';
        if (isConfirming) return 'Materializing...';
        return 'Confirm Materialization';
    };

    const getActionLabelCN = () => {
        if (!isConnected) {
            return isConnectPending
                ? '生物識別掃描中...'
                : '點擊啟動靈魂識別';
        }
        if (isWrongNetwork) return isSwitching ? '靈界切換中...' : '切換至乙太靈界';
        if (hasSoul) return '靈魂已驗證';
        if (isConfirmed) return '具現化完成';
        if (isWritePending) return '等待靈魂確認...';
        if (isConfirming) return '具現化中...';
        return '確認靈魂具現化';
    };

    // Whether the fingerprint should pulse/glow
    const isActive = isConnected && !hasSoul && !isConfirmed;
    const isComplete = hasSoul || isConfirmed;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center gap-2 w-full max-w-[300px] mx-auto"
        >
            {/* Glass Card Container */}
            <div className="relative w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 flex flex-col items-center gap-5 overflow-hidden">

                {/* Background glow effect */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${isProcessing ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent animate-pulse" />
                </div>

                {/* Scanning line animation (only during active processing) */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 pointer-events-none overflow-hidden"
                        >
                            <motion.div
                                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                                animate={{ y: [0, 260, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Wrong Network Warning */}
                <AnimatePresence>
                    {isWrongNetwork && !isSwitching && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-500/20 w-full"
                        >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[10px] text-amber-300/80">Wrong plane detected. Tap to switch.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* === Central Fingerprint Area (Clickable) === */}
                <button
                    onClick={handleAction}
                    disabled={isProcessing || (isComplete && !isWrongNetwork)}
                    className="relative z-10 group flex flex-col items-center gap-4 focus:outline-none disabled:cursor-default cursor-pointer w-full"
                >
                    {/* Fingerprint Icon with rings */}
                    <div className="relative">
                        {/* Outer ring */}
                        <motion.div
                            className={`absolute -inset-4 rounded-full border transition-colors duration-500 ${isComplete ? 'border-emerald-500/40' :
                                isProcessing ? 'border-purple-500/30 animate-pulse' :
                                    'border-zinc-700/30 group-hover:border-purple-500/20'
                                }`}
                            animate={isProcessing ? { scale: [1, 1.08, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        />

                        {/* Inner glow ring */}
                        <motion.div
                            className={`absolute -inset-1 rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.15)]' :
                                isProcessing ? 'bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.15)]' :
                                    'bg-transparent group-hover:bg-purple-500/5'
                                }`}
                        />

                        {/* The Icon */}
                        {isComplete ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                <CheckCircle className="relative w-16 h-16 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]" />
                            </motion.div>
                        ) : isProcessing ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            >
                                <Fingerprint className="relative w-16 h-16 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]" />
                            </motion.div>
                        ) : (
                            <Fingerprint className="relative w-16 h-16 text-zinc-500 group-hover:text-purple-400 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.1)] group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]" />
                        )}
                    </div>

                    {/* Action Text */}
                    <div className="flex flex-col items-center gap-0.5">
                        <motion.span
                            key={getActionLabelCN()}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-sm font-medium tracking-wide ${isComplete ? 'text-emerald-300' :
                                isProcessing ? 'text-purple-300' :
                                    'text-zinc-300 group-hover:text-white'
                                } transition-colors`}
                        >
                            {getActionLabelCN()}
                        </motion.span>
                        <motion.span
                            key={getActionLabel()}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className={`text-[10px] uppercase tracking-widest ${isComplete ? 'text-emerald-500/60' :
                                isProcessing ? 'text-purple-400/60' :
                                    'text-zinc-600 group-hover:text-zinc-400'
                                } transition-colors`}
                        >
                            {getActionLabel()}
                        </motion.span>
                    </div>
                </button>

                {/* Error display (styled subtly) */}
                <AnimatePresence>
                    {writeError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="z-10 text-[10px] text-red-400/80 text-center max-w-[240px] leading-tight"
                        >
                            {writeError.message.split('\n')[0].slice(0, 80)}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View Transaction Link (Success only) */}
                <AnimatePresence>
                    {isConfirmed && txHash && (
                        <motion.a
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            href={`https://sepolia.basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="z-10 flex items-center gap-1 text-[10px] text-emerald-500/60 hover:text-emerald-400 transition-colors"
                        >
                            View Proof <ExternalLink className="w-3 h-3" />
                        </motion.a>
                    )}
                </AnimatePresence>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                {/* Archetype label (Passport style) */}
                <div className="z-10 flex items-center justify-between w-full text-[10px] text-zinc-600">
                    <span className="uppercase tracking-widest">Type</span>
                    <span className="font-medium text-zinc-400 tracking-wide">
                        {archetypeName} <span className="text-zinc-600">Lvl {level}</span>
                    </span>
                </div>

                {/* Disconnect (very subtle) */}
                {isConnected && (
                    <button
                        onClick={() => disconnect()}
                        className="z-10 text-[9px] text-zinc-700 hover:text-red-400/70 transition-colors tracking-wider uppercase"
                    >
                        Reset Identity
                    </button>
                )}
            </div>

            {/* Disclaimer (outside card) */}
            <div className="text-[9px] text-zinc-700 text-center leading-relaxed mt-1">
                <p>Secured by cryptography. You own this artifact forever.</p>
                <p>由密碼學守護。此靈魂石將永久屬於你。</p>
            </div>
        </motion.div>
    );
}
