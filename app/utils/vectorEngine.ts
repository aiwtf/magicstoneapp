/**
 * vectorEngine.ts - Client-Side Soul Vectorization
 *
 * Uses @xenova/transformers to generate 384-dim embeddings
 * from SoulComposite data, running entirely in the browser.
 *
 * Model: Xenova/all-MiniLM-L6-v2 (small, fast, 384 dims)
 * Cost: Free (runs on user's device)
 * Privacy: Raw text never leaves the browser
 */

import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers';
import { SoulComposite } from './soulAggregator';

// Singleton pipeline instance
let extractorInstance: FeatureExtractionPipeline | null = null;
let isLoading = false;

/**
 * Get or create the singleton embedding pipeline.
 * The model is downloaded once and cached in the browser's Cache API.
 */
async function getExtractor(): Promise<FeatureExtractionPipeline> {
    if (extractorInstance) return extractorInstance;

    if (isLoading) {
        // Wait for the existing load to finish
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return extractorInstance!;
    }

    isLoading = true;
    try {
        extractorInstance = await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2',
            { progress_callback: undefined }
        );
        return extractorInstance;
    } finally {
        isLoading = false;
    }
}

/**
 * Build a descriptive text string from SoulComposite for embedding.
 * Combines archetype, core tension, and essence into a single passage.
 */
function buildSoulText(soulData: SoulComposite): string {
    const parts: string[] = [];

    // Archetype identity
    if (soulData.archetype_name) {
        parts.push(soulData.archetype_name);
    }

    // Core tension description
    if (soulData.core_tension) {
        if (typeof soulData.core_tension === 'string') {
            parts.push(soulData.core_tension);
        } else if (soulData.core_tension.description) {
            parts.push(soulData.core_tension.description);
        }
    }

    // Essence summary
    if (soulData.essence_summary) {
        parts.push(soulData.essence_summary);
    }

    // Philosophical root for extra semantic depth
    if (soulData.resonance_meta?.philosophical_root) {
        parts.push(soulData.resonance_meta.philosophical_root);
    }

    // Keywords for additional context
    if (soulData.keywords?.length) {
        parts.push(soulData.keywords.slice(0, 5).join(', '));
    }

    return parts.join('. ');
}

/**
 * Generate a 384-dimensional soul vector from SoulComposite.
 *
 * @param soulData - The composite soul data to vectorize
 * @returns A number[] of length 384 (the embedding)
 * @throws If the model fails to load or inference fails
 */
export async function generateSoulVector(soulData: SoulComposite): Promise<number[]> {
    const text = buildSoulText(soulData);

    if (!text.trim()) {
        throw new Error('Soul data is empty, cannot generate vector');
    }

    const extractor = await getExtractor();

    // Generate embedding with mean pooling and normalization
    const output = await extractor(text, {
        pooling: 'mean',
        normalize: true,
    });

    // Convert from Tensor to plain number array
    const vector = Array.from(output.data as Float32Array);

    return vector;
}
