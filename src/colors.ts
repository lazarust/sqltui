// Minimal color palette (Tokyo Night style)
// Expand to full theming system later

export const colors = {
	// Backgrounds
	background: "#1a1b26",
	headerBg: "#1f2335",
	selectedBg: "#283457",
	selectedBgEdit: "#3d59a1",
	activeCellBg: "#2f3b63",

	// Text
	text: "#c0caf5",
	muted: "#565f89",
	white: "#ffffff",

	// Accents
	accent: "#7aa2f7",
	border: "#565f89",

	// Status
	error: "#f7768e",

	// Extended palette for improved styling
	rowIndicator: "#7aa2f7",  // Selection arrow color
	rowNumber: "#565f89",     // Gutter number color
	statusText: "#9ece6a",    // Status indicators (edit mode)
	hoverBg: "#1f2335",       // Hover/alternating row bg
} as const;

export type Colors = typeof colors;
