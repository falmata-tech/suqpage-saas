export type VenuePosition = {
  left: number;
  top: number;
};

export type VenueDistrictItem = {
  key: string;
  label: string;
};

export type VenueDistrict = {
  key: string;
  label: string;
  count: number;
  left: number;
  top: number;
  width: number;
  height: number;
  columns: number;
  rows: number;
  itemIndices: number[];
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
  layers: number;
  safeInset: number;
  positions: VenuePosition[];
};

export type DistrictVenueLayout = PerimeterVenueLayout & {
  districts: VenueDistrict[];
};

export function buildPerimeterVenueLayout(count: number, cardWidth: number, cardHeight: number): PerimeterVenueLayout {
  const itemCount = Math.max(0, Math.floor(count));
  if (!itemCount) {
    return { cardWidth, cardHeight, width: 960, height: 720, centerX: 480, centerY: 360, clearWidth: 480, clearHeight: 320, columns: 0, rows: 0, layers: 0, safeInset: 100, positions: [] };
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
  const contentWidth = columns * cardWidth + (columns - 1) * gapX;
  const contentHeight = rows * cardHeight + (rows - 1) * gapY;
  const sidePadding = Math.max(170, Math.ceil(contentWidth * .14));
  const topPadding = Math.max(200, Math.ceil(contentHeight * .15));
  const bottomPadding = Math.max(180, Math.ceil(contentHeight * .14));
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
    layers: 1,
    safeInset: sidePadding,
    positions,
  };
}

function rectangularRingSlots(columns: number, rows: number, left: number, right: number, top: number, bottom: number): VenuePosition[] {
  const slots: VenuePosition[] = [];
  for (let column = 0; column < columns; column += 1) {
    const progress = columns === 1 ? .5 : column / (columns - 1);
    slots.push({ left: left + (right - left) * progress, top });
  }
  for (let row = 1; row < rows - 1; row += 1) {
    const progress = row / (rows - 1);
    slots.push({ left: right, top: top + (bottom - top) * progress });
  }
  for (let column = columns - 1; column >= 0; column -= 1) {
    const progress = columns === 1 ? .5 : column / (columns - 1);
    slots.push({ left: left + (right - left) * progress, top: bottom });
  }
  for (let row = rows - 2; row >= 1; row -= 1) {
    const progress = row / (rows - 1);
    slots.push({ left, top: top + (bottom - top) * progress });
  }
  return slots;
}

export function buildLayeredPerimeterVenueLayout(count: number, cardWidth: number, cardHeight: number): PerimeterVenueLayout {
  const itemCount = Math.max(0, Math.floor(count));
  if (!itemCount) {
    return { cardWidth, cardHeight, width: 1120, height: 820, centerX: 560, centerY: 410, clearWidth: 600, clearHeight: 330, columns: 0, rows: 0, layers: 0, safeInset: 110, positions: [] };
  }

  const gapX = 40;
  const gapY = 52;
  const clearWidth = 600;
  const clearHeight = 330;
  let remaining = itemCount;
  let layerCount = 0;
  const layerOccupancy: number[] = [];
  while (remaining > 0) {
    const columns = 4 + layerCount * 2;
    const rows = 3 + layerCount * 2;
    const capacity = columns * 2 + (rows - 2) * 2;
    const occupancy = Math.min(remaining, capacity);
    layerOccupancy.push(occupancy);
    remaining -= occupancy;
    layerCount += 1;
  }

  const outerLayer = layerCount - 1;
  const outerLeftCenter = -clearWidth / 2 - gapX - cardWidth / 2 - outerLayer * (cardWidth + gapX);
  const outerTopCenter = -clearHeight / 2 - gapY - cardHeight / 2 - outerLayer * (cardHeight + gapY);
  const contentWidth = 2 * (Math.abs(outerLeftCenter) + cardWidth / 2);
  const contentHeight = 2 * (Math.abs(outerTopCenter) + cardHeight / 2);
  const safeInset = Math.max(180, Math.ceil(Math.max(contentWidth, contentHeight) * .13));
  const width = Math.ceil(contentWidth + safeInset * 2);
  const height = Math.ceil(contentHeight + safeInset * 2);
  const centerX = width / 2;
  const centerY = height / 2;
  const positions: VenuePosition[] = [];

  for (let layer = 0; layer < layerCount; layer += 1) {
    const columns = 4 + layer * 2;
    const rows = 3 + layer * 2;
    const leftCenter = -clearWidth / 2 - gapX - cardWidth / 2 - layer * (cardWidth + gapX);
    const rightCenter = -leftCenter;
    const topCenter = -clearHeight / 2 - gapY - cardHeight / 2 - layer * (cardHeight + gapY);
    const bottomCenter = -topCenter;
    const slots = rectangularRingSlots(columns, rows, leftCenter, rightCenter, topCenter, bottomCenter);
    const occupancy = layerOccupancy[layer];
    for (let index = 0; index < occupancy; index += 1) {
      const slot = slots[Math.floor(index * slots.length / occupancy)];
      positions.push({
        left: centerX + slot.left - cardWidth / 2,
        top: centerY + slot.top - cardHeight / 2,
      });
    }
  }

  return {
    cardWidth,
    cardHeight,
    width,
    height,
    centerX,
    centerY,
    clearWidth,
    clearHeight,
    columns: 4 + outerLayer * 2,
    rows: 3 + outerLayer * 2,
    layers: layerCount,
    safeInset,
    positions,
  };
}

function boundedVenueAspect(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.min(2.25, Math.max(.65, value)) : fallback;
}

export function buildExhibitionGridVenueLayout(count: number, cardWidth: number, cardHeight: number, targetAspect = 1.35): PerimeterVenueLayout {
  const itemCount = Math.max(0, Math.floor(count));
  if (!itemCount) {
    return { cardWidth, cardHeight, width: 1120, height: 760, centerX: 560, centerY: 380, clearWidth: 0, clearHeight: 0, columns: 0, rows: 0, layers: 0, safeInset: 170, positions: [] };
  }

  const desiredAspect = boundedVenueAspect(targetAspect, 1.35);
  let columns = 1;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let candidateColumns = 1; candidateColumns <= Math.min(8, itemCount); candidateColumns += 1) {
    const candidateRows = Math.ceil(itemCount / candidateColumns);
    const candidateCrossAisleWidth = candidateColumns >= 4 ? 108 : 0;
    const candidateCrossAisleHeight = candidateRows >= 4 ? 118 : 0;
    const candidateWidth = candidateColumns * cardWidth + (candidateColumns - 1) * 54 + candidateCrossAisleWidth;
    const candidateHeight = candidateRows * cardHeight + (candidateRows - 1) * 78 + candidateCrossAisleHeight;
    const candidateInset = Math.max(170, Math.ceil(Math.max(candidateWidth, candidateHeight) * .1));
    const candidateAspect = (candidateWidth + candidateInset * 2) / (candidateHeight + candidateInset * 2);
    const emptySlots = candidateColumns * candidateRows - itemCount;
    const score = Math.abs(Math.log(candidateAspect / desiredAspect)) + emptySlots * .025;
    if (score < bestScore) {
      columns = candidateColumns;
      bestScore = score;
    }
  }
  const rows = Math.ceil(itemCount / columns);
  const gapX = 54;
  const gapY = 78;
  const aisleAfterColumn = columns >= 4 ? Math.ceil(columns / 2) : columns;
  const aisleAfterRow = rows >= 4 ? Math.ceil(rows / 2) : rows;
  const crossAisleWidth = columns >= 4 ? 108 : 0;
  const crossAisleHeight = rows >= 4 ? 118 : 0;
  const contentWidth = columns * cardWidth + (columns - 1) * gapX + crossAisleWidth;
  const contentHeight = rows * cardHeight + (rows - 1) * gapY + crossAisleHeight;
  const safeInset = Math.max(170, Math.ceil(Math.max(contentWidth, contentHeight) * .1));
  const width = Math.ceil(contentWidth + safeInset * 2);
  const height = Math.ceil(contentHeight + safeInset * 2);
  const positions = Array.from({ length: itemCount }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rowStart = row * columns;
    const rowCount = Math.min(columns, itemCount - rowStart);
    const isPartialRow = rowCount < columns;
    const partialRowWidth = rowCount * cardWidth + (rowCount - 1) * gapX;
    const partialRowOffset = isPartialRow ? (contentWidth - partialRowWidth) / 2 : 0;
    return {
      left: safeInset + partialRowOffset + column * (cardWidth + gapX) + (!isPartialRow && column >= aisleAfterColumn ? crossAisleWidth : 0),
      top: safeInset + row * (cardHeight + gapY) + (row >= aisleAfterRow ? crossAisleHeight : 0),
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
    safeInset,
    positions,
  };
}

type DistrictDraft = VenueDistrict & {
  sourceOrder: number;
};

type PackedDistrict = DistrictDraft & {
  row: number;
};

function packDistrictShelves(districts: readonly DistrictDraft[], targetWidth: number, gap: number) {
  const packed: PackedDistrict[] = [];
  let cursorX = 0;
  let cursorY = 0;
  let row = 0;
  let rowHeight = 0;
  for (const district of districts) {
    if (cursorX > 0 && cursorX + district.width > targetWidth) {
      cursorX = 0;
      cursorY += rowHeight + gap;
      row += 1;
      rowHeight = 0;
    }
    packed.push({ ...district, left: cursorX, top: cursorY, row });
    cursorX += district.width + gap;
    rowHeight = Math.max(rowHeight, district.height);
  }

  const rowWidths = new Map<number, number>();
  const rowHeights = new Map<number, number>();
  for (const district of packed) {
    rowWidths.set(district.row, Math.max(rowWidths.get(district.row) || 0, district.left + district.width));
    rowHeights.set(district.row, Math.max(rowHeights.get(district.row) || 0, district.top + district.height));
  }
  const width = Math.max(...rowWidths.values());
  const height = Math.max(...rowHeights.values());
  return {
    width,
    height,
    packed: packed.map((district) => ({
      ...district,
      left: district.left + (width - (rowWidths.get(district.row) || width)) / 2,
    })),
  };
}

export function buildDistrictVenueLayout(items: readonly VenueDistrictItem[], cardWidth: number, cardHeight: number, targetAspect = 1.55): DistrictVenueLayout {
  if (!items.length) {
    return {
      ...buildExhibitionGridVenueLayout(0, cardWidth, cardHeight),
      districts: [],
    };
  }

  const districtByKey = new Map<string, DistrictDraft>();
  items.forEach((item, index) => {
    const existing = districtByKey.get(item.key);
    if (existing) {
      existing.count += 1;
      existing.itemIndices.push(index);
      return;
    }
    districtByKey.set(item.key, {
      key: item.key,
      label: item.label,
      count: 1,
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      columns: 0,
      rows: 0,
      itemIndices: [index],
      sourceOrder: index,
    });
  });

  const boothGapX = 34;
  const boothGapY = 52;
  const districtPaddingX = 38;
  const districtHeaderHeight = 64;
  const districtBottomPadding = 34;
  const districtGap = 64;
  const desiredAspect = boundedVenueAspect(targetAspect, 1.55);
  const drafts = [...districtByKey.values()].map((district) => {
    const aspectFactor = desiredAspect / 1.55;
    const columns = Math.min(6, Math.max(1, Math.ceil(Math.sqrt(district.count * aspectFactor))));
    const rows = Math.ceil(district.count / columns);
    return {
      ...district,
      columns,
      rows,
      width: districtPaddingX * 2 + columns * cardWidth + (columns - 1) * boothGapX,
      height: districtHeaderHeight + districtBottomPadding + rows * cardHeight + (rows - 1) * boothGapY,
    };
  });

  const maximumWidth = Math.max(...drafts.map((district) => district.width));
  const totalWidth = drafts.reduce((sum, district) => sum + district.width, 0) + districtGap * (drafts.length - 1);
  const targets = new Set<number>([maximumWidth, totalWidth]);
  for (let target = maximumWidth; target < totalWidth; target += Math.max(100, Math.floor(cardWidth / 2))) targets.add(target);

  let best: ReturnType<typeof packDistrictShelves> | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  const occupiedArea = drafts.reduce((sum, district) => sum + district.width * district.height, 0);
  for (const target of targets) {
    const candidate = packDistrictShelves(drafts, target, districtGap);
    const aspectPenalty = Math.abs(Math.log((candidate.width / candidate.height) / desiredAspect));
    const unusedRatio = 1 - occupiedArea / (candidate.width * candidate.height);
    const score = aspectPenalty * 3 + unusedRatio * .35;
    if (score < bestScore || (score === bestScore && candidate.width * candidate.height < (best?.width || 0) * (best?.height || 0))) {
      best = candidate;
      bestScore = score;
    }
  }

  if (!best) throw new Error("City Market district packing failed");

  const sideInset = 170;
  const topInset = 170;
  const bottomInset = 150;
  const width = Math.ceil(best.width + sideInset * 2);
  const height = Math.ceil(best.height + topInset + bottomInset);
  const positions = Array.from({ length: items.length }, () => ({ left: 0, top: 0 }));
  const districts = best.packed
    .sort((left, right) => left.sourceOrder - right.sourceOrder)
    .map((district) => {
      const placed = {
        ...district,
        left: district.left + sideInset,
        top: district.top + topInset,
      };
      district.itemIndices.forEach((itemIndex, localIndex) => {
        const row = Math.floor(localIndex / district.columns);
        const column = localIndex % district.columns;
        const rowStart = row * district.columns;
        const rowCount = Math.min(district.columns, district.count - rowStart);
        const rowWidth = rowCount * cardWidth + (rowCount - 1) * boothGapX;
        const contentWidth = district.columns * cardWidth + (district.columns - 1) * boothGapX;
        positions[itemIndex] = {
          left: placed.left + districtPaddingX + (contentWidth - rowWidth) / 2 + column * (cardWidth + boothGapX),
          top: placed.top + districtHeaderHeight + row * (cardHeight + boothGapY),
        };
      });
      return placed;
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
    columns: Math.max(...districts.map((district) => district.columns)),
    rows: districts.reduce((sum, district) => sum + district.rows, 0),
    layers: new Set(best.packed.map((district) => district.row)).size,
    safeInset: sideInset,
    positions,
    districts,
  };
}
