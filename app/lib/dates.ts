
// Date Utilities (replacing Python datetime)

export function getMonthsDiff(start: string | Date, end: string | Date): number {
    const s = new Date(start);
    const e = new Date(end);

    // Calculate difference in months
    let months = (e.getFullYear() - s.getFullYear()) * 12;
    months -= s.getMonth();
    months += e.getMonth();

    // Add 1 to be inclusive (if end is last day of month)
    // Heuristic similar to Python script
    return months <= 0 ? 0 : months + 1;
}

export function generateInstallmentRows(totalValue: number, count: number = 10): any[] {
    const installmentVal = totalValue / count;
    const discountVal = installmentVal * 0.90; // 10% discount for Pix

    const rows = [];
    for (let i = 1; i <= count; i++) {
        const desc = i === 1 ? "No início dos trabalhos" : `${(i - 1) * 30} dias após início`;
        rows.push({
            index: `${i.toString().padStart(2, '0')}/${count}`,
            description: desc,
            value: installmentVal,
            valuePix: discountVal
        });
    }
    return rows;
}

export function getCurrentDateExtenso(): string {
    const date = new Date();
    const months = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}
