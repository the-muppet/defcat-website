import { useState } from "react";


interface DeckCard {
    quantity: number;
    board_type: string;
    cards: {
        name: string;
        mana_cost: string | null;
        type_line: string | null;
        cmc: number | null;
        image_url: string | null;
    } | null;
}

export function ColorDistribution({ cards }: { cards: DeckCard[] }) {
    const [hoveredColor, setHoveredColor] = useState<string | null>(null);

    // Calculate color distribution based on mana costs
    const colorCounts = cards.reduce((acc, dc) => {
        const manaCost = dc.cards?.mana_cost || '';
        const quantity = dc.quantity;

        // Count each color symbol
        if (manaCost.includes('{W}')) acc.W = (acc.W || 0) + quantity;
        if (manaCost.includes('{U}')) acc.U = (acc.U || 0) + quantity;
        if (manaCost.includes('{B}')) acc.B = (acc.B || 0) + quantity;
        if (manaCost.includes('{R}')) acc.R = (acc.R || 0) + quantity;
        if (manaCost.includes('{G}')) acc.G = (acc.G || 0) + quantity;
        if (!manaCost || manaCost === '' || /^{\d+}$/.test(manaCost)) {
            acc.C = (acc.C || 0) + quantity; // Colorless
        }

        return acc;
    }, {} as Record<string, number>);

    const colorInfo: Record<string, { name: string; gradient: string; glow: string; icon: string }> = {
        W: { name: 'White', gradient: 'url(#gradient-w)', glow: '#fef3c7', icon: 'w' },
        U: { name: 'Blue', gradient: 'url(#gradient-u)', glow: '#93c5fd', icon: 'u' },
        B: { name: 'Black', gradient: 'url(#gradient-b)', glow: '#6b7280', icon: 'b' },
        R: { name: 'Red', gradient: 'url(#gradient-r)', glow: '#fca5a5', icon: 'r' },
        G: { name: 'Green', gradient: 'url(#gradient-g)', glow: '#86efac', icon: 'g' },
        C: { name: 'Colorless', gradient: 'url(#gradient-c)', glow: '#d1d5db', icon: 'c' },
    };

    const totalSymbols = Object.values(colorCounts).reduce((a, b) => a + b, 0);

    if (totalSymbols === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No color data available
            </div>
        );
    }

    const sortedColors = Object.entries(colorCounts).sort(([, a], [, b]) => b - a);

    const colorStyles: Record<string, string> = {
        W: '#fbbf24',
        U: '#3b82f6',
        B: '#6b7280',
        R: '#ef4444',
        G: '#22c55e',
        C: '#9ca3af',
    };

    return (
        <div className="space-y-4">
            {/* Stacked Bar Chart */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Color Distribution</span>
                    <span className="font-medium">{totalSymbols} symbols</span>
                </div>

                <div className="relative h-12 bg-accent/30 rounded-lg overflow-hidden border border-border">
                    <div className="flex h-full">
                        {sortedColors.map(([color, count]) => {
                            const percentage = (count / totalSymbols) * 100;
                            const isHovered = hoveredColor === color;

                            return (
                                <div
                                    key={color}
                                    className="relative transition-all duration-200 ease-out cursor-pointer"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: colorStyles[color],
                                        opacity: hoveredColor && !isHovered ? 0.4 : 1,
                                        transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                                    }}
                                    onMouseEnter={() => setHoveredColor(color)}
                                    onMouseLeave={() => setHoveredColor(null)}
                                >
                                    {/* Tooltip on hover */}
                                    {isHovered && (
                                        <div className="absolute left-1/2 -translate-x-1/2 -top-14 bg-popover text-popover-foreground px-3 py-2 rounded-md text-sm font-medium shadow-lg border whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <i className={`ms ms-${colorInfo[color].icon} ms-cost ms-shadow text-lg`} />
                                                <span>{colorInfo[color].name}: {count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Simple Legend */}
            <div className="space-y-1.5">
                {sortedColors.map(([color, count]) => {
                    const percentage = ((count / totalSymbols) * 100).toFixed(1);
                    const info = colorInfo[color];
                    const isHovered = hoveredColor === color;

                    return (
                        <div
                            key={color}
                            className="relative group"
                            onMouseEnter={() => setHoveredColor(color)}
                            onMouseLeave={() => setHoveredColor(null)}
                        >
                            <div className={`
                                flex items-center justify-between p-3 rounded-lg border cursor-pointer
                                transition-all duration-150 ease-out
                                ${isHovered
                                    ? 'bg-accent border-border shadow-md'
                                    : 'bg-card border-border/50 hover:bg-accent/50'
                                }
                            `}>
                                <div className="flex items-center gap-3">
                                    <i className={`ms ms-${info.icon} ms-cost ms-shadow text-2xl`} />
                                    <span className="font-medium text-sm">{info.name}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="font-bold tabular-nums">{count}</span>
                                    <span className="text-sm text-muted-foreground tabular-nums min-w-[3.5rem] text-right">
                                        {percentage}%
                                    </span>
                                </div>
                            </div>

                            {/* Tooltip on hover */}
                            {isHovered && (
                                <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-popover text-popover-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-lg border whitespace-nowrap">
                                    {count} {info.name} symbols ({percentage}%)
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-popover" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}