
// Configuration Constants (Same as Python script)
const BASE_VALUE_2026 = 1097.00;

const DISCOUNT_TABLE: Record<number, number> = {
    12: 0.00,
    24: 0.07,
    36: 0.14,
    48: 0.22,
    60: 0.27,
    72: 0.31,
    84: 0.35,
    96: 0.40,
    108: 0.43,
    120: 0.45,
};

// Situation Factors
export function calculatePriceFactors(pages: number, folders: number): { pMult: number, fMult: number, label: string } {
    let situation = "A";
    let pMult = 1.0;

    // Page Factor Logic
    if (pages <= 200) { situation = "A"; pMult = 1.0; }
    else if (pages <= 400) { situation = "B"; pMult = 1.25; }
    else if (pages <= 600) { situation = "C"; pMult = 1.45; }
    else if (pages <= 800) { situation = "D"; pMult = 1.65; }
    else if (pages <= 1000) { situation = "E"; pMult = 1.85; }
    else { situation = "F"; pMult = 2.0; } // >1000

    // Folder Factor Logic
    let fMult = 1.0;
    if (folders > 90) fMult = 1.60;
    else if (folders > 80) fMult = 1.50;
    else if (folders > 70) fMult = 1.45;
    else if (folders > 60) fMult = 1.40;
    else if (folders > 50) fMult = 1.35;
    else if (folders > 40) fMult = 1.30;
    else if (folders > 30) fMult = 1.25;
    else if (folders > 20) fMult = 1.20;
    else if (folders > 10) fMult = 1.10;
    else fMult = 1.0;

    return { pMult, fMult, label: situation };
}

export interface PricingResult {
    baseMonthlyRaw: number;
    finalMonthly: number;
    totalValue: number;
    refTier: number;
    discountRate: number;
    savings: number;
    situation: string;
}

export function calculateComplexPrice(pages: number, folders: number, durationMonths: number): PricingResult {
    const { pMult, fMult, label } = calculatePriceFactors(pages, folders);
    const baseMonthlyAdjusted = BASE_VALUE_2026 * pMult * fMult;

    // Determine Discount based on Duration
    const tiers = Object.keys(DISCOUNT_TABLE).map(Number).sort((a, b) => a - b);
    let refTier = 12;
    let discountRate = 0.0;

    for (const t of tiers) {
        if (durationMonths >= t) {
            refTier = t;
            discountRate = DISCOUNT_TABLE[t];
        }
    }

    const finalMonthly = baseMonthlyAdjusted * (1 - discountRate);
    const totalValue = finalMonthly * durationMonths;
    const fullPrice = baseMonthlyAdjusted * durationMonths;
    const savings = fullPrice - totalValue;

    return {
        baseMonthlyRaw: baseMonthlyAdjusted,
        finalMonthly,
        totalValue,
        refTier,
        discountRate,
        savings,
        situation: label
    };
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}
