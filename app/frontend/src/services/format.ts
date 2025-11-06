export const fmt = new Intl.NumberFormat('fr-FR'); // 676 570 149
export const fmt1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
export const compact = new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 });
// compact.format(676570149) => "676,6 M"
