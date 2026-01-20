import { useState, useEffect } from 'react';
import { useAura } from '../../sdk';
import { resources } from './resources';
import { Character } from './ui'; // Import type from UI
import { enrichCharactersPrompt } from './prompts';

export interface UseCharactersProps {
    characters?: Character[];
    query?: string;
    title?: string;
    updateWindow?: (data: any) => void;
}

export const useCharactersLogic = ({
    characters: initialCharacters = [],
    query,
    title,
    updateWindow
}: UseCharactersProps) => {
    const { proxy, llm } = useAura(); // We only need proxy for TMDB, LLM maybe later for enrichment

    const [characters, setCharacters] = useState<Character[]>(initialCharacters);
    const [isLoading, setIsLoading] = useState(!initialCharacters.length && !!query);
    const [error, setError] = useState('');
    const [fetchedTitle, setFetchedTitle] = useState(title || 'Characters');

    // Initial sync removed to avoid prop/state conflicts. 
    // We rely on useState initialization for the "uncontrolled" part of the pattern.


    // Search Logic
    useEffect(() => {
        const shouldSearch = query && characters.length === 0; // Avoid re-search if hydrated

        if (shouldSearch) {
            performSearch(query!);
        }
    }, [query]); // Dependencies: only query. If query changes, we search.

    // Persistence Effect
    useEffect(() => {
        if (updateWindow) {
            const timeoutId = setTimeout(() => {
                updateWindow({
                    props: {
                        characters,
                        title: fetchedTitle, // Use current state title
                        query, // Persist query
                        // We do NOT persist isLoading or error typically, as we want to restore "content"
                    }
                });
            }, 1000); // Debounce updates
            return () => clearTimeout(timeoutId);
        }
    }, [characters, fetchedTitle, query, updateWindow]);


    const performSearch = async (q: string) => {
        setIsLoading(true);
        setError('');
        console.log(`[CharactersAIR] Searching for "${q}"...`);

        try {
            // 1. Search for Movie first (default preference)
            // We could parallelize or check for "series" hint? 
            // For now, simple waterfall: Try Movie -> If no result -> Try TV.

            let bestMedia: any = null;
            let mediaType = 'movie';

            // Movie Search
            const movieData = await proxy.fetch(resources.api.tmdb.search.config, { params: { query: q } });
            if (movieData.results && movieData.results.length > 0) {
                let results = movieData.results;

                // Check if query contains a year (e.g., "Godfather 2012")
                const yearMatch = q.match(/\b(19|20)\d{2}\b/);
                const targetYear = yearMatch ? yearMatch[0] : null;

                if (targetYear) {
                    // Prioritize exact year match
                    const yearExact = results.find((m: any) => m.release_date && m.release_date.startsWith(targetYear));
                    if (yearExact) {
                        bestMedia = yearExact;
                    } else {
                        // Fallback to popularity if year provided but no match found
                        bestMedia = results.sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))[0];
                    }
                } else {
                    // No year specified? Default to popularity (Classic Godfather wins over 2012 remake)
                    bestMedia = results.sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))[0];
                }
            } else {
                // TV Search
                mediaType = 'tv';
                const tvData = await proxy.fetch(resources.api.tmdb.searchTV.config, { params: { query: q } });
                if (tvData.results && tvData.results.length > 0) {
                    bestMedia = tvData.results[0];
                }
            }

            if (!bestMedia) {
                setError("No movie or series found.");
                setIsLoading(false);
                return;
            }

            const mediaId = bestMedia.id;
            const newTitle = bestMedia.title || bestMedia.name || q;
            setFetchedTitle(newTitle);

            // 2. Fetch Credits
            let creditsConfig = mediaType === 'movie'
                ? { ...resources.api.tmdb.credits.config }
                : { ...resources.api.tmdb.creditsTV.config };

            // Manually replace {id} as proxy doesn't handle templates
            creditsConfig.url = creditsConfig.url.replace('{id}', String(mediaId)) as any;

            const creditsData = await proxy.fetch(creditsConfig, { params: {} });

            if (creditsData && creditsData.cast) {
                // Map to Character interface
                const mapped: Character[] = creditsData.cast.slice(0, 12).map((c: any) => ({
                    id: c.id,
                    name: c.character || c.name, // Character name
                    role: c.name, // Actor name
                    imageUrl: c.profile_path ? `https://image.tmdb.org/t/p/w500${c.profile_path}` : undefined,
                    description: '', // Could use LLM to generating brief bio
                    traits: []
                }));

                setCharacters(mapped);

                // Enrich in background (non-blocking) - enrich all fetched characters (limited to 12 by slice above)
                // We'll use the LLM to get descriptions and traits
                enrichCharacters(mapped, newTitle, q);

                // Persist only after successful fetch (handled by effect now)

            } else {
                setError("No cast information found.");
            }

        } catch (err) {
            console.error("[CharactersAIR] Search failed", err);
            setError("Failed to load characters.");
        } finally {
            setIsLoading(false);
        }
    };

    const enrichCharacters = async (chars: Character[], mediaTitle: string, originalQuery?: string) => {
        try {
            const charNames = chars.map(c => c.name).join(", ");
            const prompt = enrichCharactersPrompt(mediaTitle, charNames);

            const response = await llm.invoke(resources.api.llm.enrich, {
                messages: [{ role: 'user', content: prompt }]
            });

            // Parse response - assuming simple JSON format
            const cleanContent = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
            const enrichedData = JSON.parse(cleanContent);

            if (Array.isArray(enrichedData)) {
                setCharacters(prev => {
                    const next = [...prev];
                    enrichedData.forEach((data: any, i: number) => {
                        if (next[i]) {
                            // Explicitly map only expected fields to avoid overwriting id, name, or role
                            next[i] = {
                                ...next[i],
                                description: data.description,
                                traits: data.traits
                            };
                        }
                    });

                    // Persist enriched data (handled by effect now)


                    return next;
                });
            }

        } catch (e) {
            console.warn("[CharactersAIR] Enrichment failed", e);
        }
    };

    return {
        characters,
        isLoading,
        error,
        title: fetchedTitle
    };
};
