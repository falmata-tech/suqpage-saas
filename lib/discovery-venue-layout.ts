export type VenuePosition = {
  left: number;
  top: number;
};

export type ScrollableVenueLayout = {
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
  layers: number;
  safeInset: number;
  positions: VenuePosition[];
};

export function buildScrollableSharedLocationVenueLayout(
  count: number,
  cardWidth: number,
  cardHeight: number,
  availableWidth: number,
  availableHeight = 520,
): ScrollableVenueLayout {
  const itemCount = Math.max(0, Math.floor(count));
  const width = Math.max(cardWidth + 48, Math.floor(Number.isFinite(availableWidth) ? availableWidth : 760));
  const sideInset = width < 480 ? 24 : width < 900 ? 40 : 56;
  const gapX = width < 480 ? 20 : 32;
  const gapY = width < 480 ? 38 : 48;
  const usableWidth = Math.max(cardWidth, width - sideInset * 2);
  const columns = itemCount
    ? Math.max(1, Math.min(4, itemCount, Math.floor((usableWidth + gapX) / (cardWidth + gapX))))
    : 0;
  const rows = columns ? Math.ceil(itemCount / columns) : 0;
  const topInset = width < 480 ? 126 : 142;
  const bottomInset = 104;
  const minimumContentHeight = topInset + rows * cardHeight + Math.max(0, rows - 1) * gapY + bottomInset;
  const height = Math.max(
    Number.isFinite(availableHeight) ? Math.floor(availableHeight) : 520,
    minimumContentHeight,
  );
  const verticalRoom = Math.max(0, height - topInset - bottomInset - rows * cardHeight);
  const distributedGapY = rows > 1 ? Math.max(gapY, Math.floor(verticalRoom / (rows - 1))) : 0;
  const singleRowOffset = rows === 1 ? Math.floor(verticalRoom / 2) : 0;
  const positions = Array.from({ length: itemCount }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rowStart = row * columns;
    const rowCount = Math.min(columns, itemCount - rowStart);
    const rowWidth = rowCount * cardWidth + Math.max(0, rowCount - 1) * gapX;
    const rowLeft = Math.max(sideInset, (width - rowWidth) / 2);
    return {
      left: Math.round(rowLeft + column * (cardWidth + gapX)),
      top: topInset + singleRowOffset + row * (cardHeight + distributedGapY),
    };
  });

  return {
    cardWidth,
    cardHeight,
    width,
    height,
    centerX: width / 2,
    centerY: height / 2,
    clearWidth: 0,
    clearHeight: 0,
    columns,
    rows,
    layers: rows,
    safeInset: sideInset,
    positions,
  };
}
