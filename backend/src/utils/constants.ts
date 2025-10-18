export const TIER_LIMIT = {
    FREE: 3, 
    STANDARD: 15, 
    PREMIUM: 999,
} as const;

export type TierType = keyof typeof TIER_LIMIT;

export const TIER_NAME: TierType[] = ['FREE', 'STANDARD', 'PREMIUM'];

export const isValidTier = (tier: string): tier is TierType => {
    return TIER_NAME.includes(tier as TierType);
};