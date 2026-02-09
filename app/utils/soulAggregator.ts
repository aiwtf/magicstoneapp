// 1. Define the input: A single fragment from an AI ritual
import { SoulDimensions, OperatingSystem, DeepSoulAnalysis } from './soulEngine';

export interface SoulFragment {
    id: string;
    source: string;
    timestamp: number;

    // Identity Tags
    archetype_name: string;
    archetype_description: string;

    // Deep Soul Protocol
    core_tension?: string | { conflict: string; description: string }; // Support both string (legacy) and object (new)
    operating_system?: OperatingSystem;
    depth_analysis?: DeepSoulAnalysis;
    resonance_meta?: { visual_aesthetic: string; philosophical_root: string }; // "resonance" conflicts with dimension name

    mbti_type?: string;
    enneagram_type?: string;
    keywords: string[];

    // Legacy/Optional
    narrative_phase?: string;
    cognitive_biases?: string[];

    // The 8-Dimensional Soul Vector
    dimensions: SoulDimensions;

    confidence_score: number;
    visual_seed: string;
    soul_color: string;
}

export interface SoulComposite {
    fragments: SoulFragment[];
    density: number;

    dimensions: SoulDimensions;
    keywords: string[];

    // Latest Meta
    archetype_name: string;
    archetype_description?: string;

    core_tension: string | { conflict: string; description: string };
    operating_system?: OperatingSystem;
    depth_analysis?: DeepSoulAnalysis;
    resonance_meta?: { visual_aesthetic: string; philosophical_root: string };

    mbti_type?: string;
    enneagram_type?: string;
    narrative_phase: string;
    cognitive_biases: string[];

    visual_seed: string;
    soul_color: string;
    confidence_score: number;
}

// 3. Density Curve Logic
function calculateDensity(count: number, avgConfidence: number): number {
    let baseDensity = 0;
    if (count === 1) baseDensity = 0.6;
    else if (count === 2) baseDensity = 0.8;
    else if (count >= 3) baseDensity = 1.0;
    const finalDensity = baseDensity * (avgConfidence / 100);
    return parseFloat(finalDensity.toFixed(2));
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

    // Calculate Average Confidence
    const totalConf = allFragments.reduce((acc, f) => acc + (f.confidence_score || 50), 0);
    const avgConf = totalConf / count;

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
        density: calculateDensity(count, avgConf),
        dimensions: avgDimensions,
        keywords: Array.from(keywordSet).slice(0, 15),

        archetype_name: latest.archetype_name,
        archetype_description: latest.archetype_description,

        // Deep Protocol Fields (New)
        operating_system: latest.operating_system,
        depth_analysis: latest.depth_analysis,

        mbti_type: latest.mbti_type,
        enneagram_type: latest.enneagram_type,
        core_tension: latest.core_tension || "Unresolved",
        narrative_phase: latest.narrative_phase || "Wandering",
        cognitive_biases: latest.cognitive_biases || [],

        visual_seed: latest.visual_seed,
        soul_color: latest.soul_color,
        confidence_score: Math.round(avgConf)
    };
}
