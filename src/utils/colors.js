export const colorPalette = [
  '#FF6384', // Pink
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#32CD32', // Lime Green
  '#BA55D3', // Medium Orchid
  '#20B2AA', // Light Sea Green
  '#FF6347'  // Tomato
];

export const getPersonColor = (id) => colorPalette[(id - 1) % colorPalette.length];
