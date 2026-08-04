export type VenuePosition = {
  left: number;
  top: number;
};

export type PerimeterVenueLayout = {
  cardWidth: number;
  cardHeight: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  clearWidth: number;
  clearHeight: number;
  columns: number;
  rows: number;
  positions: VenuePosition[];
};

export function buildPerimeterVenueLayout(count: number, cardWidth: number, cardHeight: number): PerimeterVenueLayout {
  const itemCount = Math.max(0, Math.floor(count));
  if (!itemCount) {
    return { cardWidth, cardHeight, width: 960, height: 720, centerX: 480, centerY: 360, clearWidth: 480, clearHeight: 320, columns: 0, rows: 0, positions: [] };
  }

  const sideTotal = Math.ceil(itemCount / 2) + 2;
  let columns = Math.max(3, Math.ceil(sideTotal * 4 / 7));
  let rows = Math.max(3, sideTotal - columns);
  while (columns * 2 + (rows - 2) * 2 < itemCount) {
    if (columns / rows < 4 / 3) columns += 1;
    else rows += 1;
  }

  const gapX = 48;
  const gapY = 78;
  const sidePadding = 100;
  const topPadding = 150;
  const bottomPadding = 120;
  const width = sidePadding * 2 + columns * cardWidth + (columns - 1) * gapX;
  const height = topPadding + bottomPadding + rows * cardHeight + (rows - 1) * gapY;
  const left = sidePadding;
  const right = width - sidePadding - cardWidth;
  const top = topPadding;
  const bottom = height - bottomPadding - cardHeight;
  const clearLeft = left + cardWidth;
  const clearRight = right;
  const clearTop = top + cardHeight;
  const clearBottom = bottom;
  const centerX = (clearLeft + clearRight) / 2;
  const centerY = (clearTop + clearBottom) / 2;
  const slots: VenuePosition[] = [];
  for (let column = 0; column < columns; column += 1) slots.push({ left: left + column * (cardWidth + gapX), top });
  for (let row = 1; row < rows - 1; row += 1) slots.push({ left: right, top: top + row * (cardHeight + gapY) });
  for (let column = columns - 1; column >= 0; column -= 1) slots.push({ left: left + column * (cardWidth + gapX), top: bottom });
  for (let row = rows - 2; row >= 1; row -= 1) slots.push({ left, top: top + row * (cardHeight + gapY) });

  const positions = Array.from({ length: itemCount }, (_, index) => slots[Math.floor(index * slots.length / itemCount)]);
  return {
    cardWidth,
    cardHeight,
    width,
    height,
    centerX,
    centerY,
    clearWidth: Math.max(0, clearRight - clearLeft),
    clearHeight: Math.max(0, clearBottom - clearTop),
    columns,
    rows,
    positions,
  };
}
