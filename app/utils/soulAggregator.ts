
// 1. Define the input: A single fragment from an AI ritual
import { SoulDimensions } from './soulEngine';

export interface SoulFragment {
    id: string;
    source: string;
    timestamp: number;

    // Identity Tags
    archetype_name: string;
    archetype_description: string;
    mbti_type?: string;        // e.g., INTJ
    enneagram_type?: string;   // e.g., Type 4
    keywords: string[];        // Kept for UI compatibility

    // Deep Narratives
    core_tension?: string;     // e.g., Freedom vs Belonging
    narrative_phase?: string;  // e.g., The Awakening
    cognitive_biases?: string[];

    // The 8-Dimensional Soul Vector
    dimensions: SoulDimensions;

    confidence_score: number;

    // Visual/Meta
    visual_seed: string;
    soul_color: string;
}

export interface SoulComposite {
    fragments: SoulFragment[];
    density: number;

    // Aggregated Stats
    dimensions: SoulDimensions;
    keywords: string[];

    // Latest Meta
    archetype_name: string;
    archetype_description?: string;
    mbti_type?: string;
    enneagram_type?: string;
    core_tension: string;
    narrative_phase: string;
    cognitive_biases: string[];

    visual_seed: string;
    soul_color: string;
}

// 3. Density Curve Logic
function calculateDensity(count: number): number {
    if (count === 0) return 0;
    if (count === 1) return 0.59;
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

    const allFragments = currentComposite
        ? [...currentComposite.fragments, newFragment]
        : [newFragment];

    const count = allFragments.length;

    // A. Average the Dimensions
    const totalDims = allFragments.reduce((acc, frag) => ({
        structure: acc.structure + frag.dimensions.structure,
        luminosity: acc.luminosity + frag.dimensions.luminosity,
        resonance: acc.resonance + frag.dimensions.resonance,
        ethereal: acc.ethereal + frag.dimensions.ethereal,
        volatility: acc.volatility + frag.dimensions.volatility,
        entropy: acc.entropy + frag.dimensions.entropy,
        cognitive_rigidness: acc.cognitive_rigidness + frag.dimensions.cognitive_rigidness,
        narrative_depth: acc.narrative_depth + frag.dimensions.narrative_depth,
    }), {
        structure: 0, luminosity: 0, resonance: 0, ethereal: 0,
        volatility: 0, entropy: 0, cognitive_rigidness: 0, narrative_depth: 0
    });

    const avgDimensions: SoulDimensions = {
        structure: Math.round(totalDims.structure / count),
        luminosity: Math.round(totalDims.luminosity / count),
        resonance: Math.round(totalDims.resonance / count),
        ethereal: Math.round(totalDims.ethereal / count),
        volatility: Math.round(totalDims.volatility / count),
        entropy: Math.round(totalDims.entropy / count),
        cognitive_rigidness: Math.round(totalDims.cognitive_rigidness / count),
        narrative_depth: Math.round(totalDims.narrative_depth / count),
    };

    // B. Merge Keywords
    const keywordSet = new Set<string>();
    allFragments.forEach(f => f.keywords.forEach(k => keywordSet.add(k)));

    // C. Update Archetype & Meta (Latest wins)
    const latest = newFragment;

    return {
        fragments: allFragments,
        density: calculateDensity(count),
        dimensions: avgDimensions,
        keywords: Array.from(keywordSet).slice(0, 15),

        archetype_name: latest.archetype_name,
        archetype_description: latest.archetype_description,
        mbti_type: latest.mbti_type,
        enneagram_type: latest.enneagram_type,
        core_tension: latest.core_tension || "Unresolved",
        narrative_phase: latest.narrative_phase || "Wandering",
        cognitive_biases: latest.cognitive_biases || [],

        visual_seed: latest.visual_seed,
        soul_color: latest.soul_color
    };
}
