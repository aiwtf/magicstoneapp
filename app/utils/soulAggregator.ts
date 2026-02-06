
// 1. Define the input: A single fragment from an AI ritual
export interface SoulFragment {
    id: string;             // Unique ID (timestamp + random)
    source: 'ChatGPT' | 'Gemini' | 'Claude' | 'Unknown';
    // 'Unknown' added to handle legacy or general cases
    timestamp: number;
    archetype: string;
    keywords: string[];
    dimensions: {
        chaos: number;
        logic: number;
        empathy: number;
        mysticism: number;
    };
    visual_seed: string;
    soul_color: string;
    summary: string;
}

// 2. Define the output: The combined "Philosopher's Stone" state
export interface SoulComposite {
    fragments: SoulFragment[]; // History of all injections
    density: number;           // 0.0 to 1.0 (The progress bar)

    // Aggregated Stats
    dimensions: {
        chaos: number;
        logic: number;
        empathy: number;
        mysticism: number;
    };

    keywords: string[];        // Union of all keywords
    archetype: string;         // The latest or dominant archetype
    visual_seed: string;       // The active seed for rendering
    soul_color: string;        // Latest color
    summary: string;           // Latest summary
}

// 3. Density Curve Logic
// 1 Fragment = 0.59 (Blurry/Ghostly)
// 2 Fragments = 0.84 (Solidifying)
// 3+ Fragments = approaches 1.0 (Crystalline)
function calculateDensity(count: number): number {
    if (count === 0) return 0;
    if (count === 1) return 0.59;

    // Simple growth formula: Base + (Count-1 * Boost)
    const base = 0.59;
    const boost = 0.25;
    const val = base + ((count - 1) * boost);
    return Math.min(1.0, val);
}

// 4. The Main Merge Function
export function aggregateSoul(
    currentComposite: SoulComposite | null,
    newFragment: SoulFragment
): SoulComposite {

    // Start with existing fragments or empty array
    const allFragments = currentComposite
        ? [...currentComposite.fragments, newFragment]
        : [newFragment];

    const count = allFragments.length;

    // A. Average the Dimensions
    // We re-calculate from scratch to avoid floating point drift
    const totalDims = allFragments.reduce((acc, frag) => ({
        chaos: acc.chaos + frag.dimensions.chaos,
        logic: acc.logic + frag.dimensions.logic,
        empathy: acc.empathy + frag.dimensions.empathy,
        mysticism: acc.mysticism + frag.dimensions.mysticism,
    }), { chaos: 0, logic: 0, empathy: 0, mysticism: 0 });

    const avgDimensions = {
        chaos: Math.round(totalDims.chaos / count),
        logic: Math.round(totalDims.logic / count),
        empathy: Math.round(totalDims.empathy / count),
        mysticism: Math.round(totalDims.mysticism / count),
    };

    // B. Merge Keywords (Set Union to remove duplicates)
    const keywordSet = new Set<string>();
    allFragments.forEach(f => f.keywords.forEach(k => keywordSet.add(k)));

    // C. Update Archetype & Seed
    // For MVP, the LATEST ritual influences the visual texture the most
    const latest = newFragment;

    return {
        fragments: allFragments,
        density: calculateDensity(count),
        dimensions: avgDimensions,
        keywords: Array.from(keywordSet).slice(0, 15), // Keep top 15 tags
        archetype: latest.archetype,
        visual_seed: latest.visual_seed,
        soul_color: latest.soul_color,
        summary: latest.summary
    };
}
