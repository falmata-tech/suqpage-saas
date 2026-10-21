#include <yoga/Yoga.h>
#include <iomanip>
#include <iostream>
#include <vector>

// Isolated geometry using the Yoga sources installed with React Native. This
// intentionally does not stand in for rendered text or a physical APK journey.
int main() {
  int mode, count;
  float innerWidth, density, basisPercent, gap, grow;
  while (std::cin >> mode >> innerWidth >> density >> count >> basisPercent >> gap >> grow) {
    auto config = YGConfigNew();
    YGConfigSetPointScaleFactor(config, density);
    auto root = YGNodeNewWithConfig(config);
    auto grid = YGNodeNewWithConfig(config);
    YGNodeStyleSetWidth(root, innerWidth + 36);
    YGNodeStyleSetPadding(root, YGEdgeHorizontal, 18);
    YGNodeInsertChild(root, grid, 0);
    YGNodeStyleSetFlexDirection(grid, YGFlexDirectionRow);
    YGNodeStyleSetFlexWrap(grid, YGWrapWrap);
    YGNodeStyleSetJustifyContent(grid, YGJustifySpaceBetween);
    YGNodeStyleSetGap(grid, YGGutterAll, gap);
    std::vector<YGNodeRef> cards;
    for (int i = 0; i < count; ++i) {
      auto card = YGNodeNewWithConfig(config);
      YGNodeStyleSetWidthPercent(card, 100);
      YGNodeStyleSetBorder(card, YGEdgeAll, 1);
      YGNodeStyleSetHeight(card, 100);
      YGNodeInsertChild(grid, card, i);
      cards.push_back(card);
    }
    YGNodeCalculateLayout(root, YGUndefined, YGUndefined, YGDirectionLTR);
    const float reportedWidth = YGNodeLayoutGetWidth(grid);
    for (auto card : cards) {
      if (mode == 0) {
        // Previous showroom algorithm reuses pixel-rounded onLayout width.
        YGNodeStyleSetWidth(card, (reportedWidth - gap) / 2);
      } else if (mode == 1) {
        YGNodeStyleSetWidthAuto(card);
        YGNodeStyleSetFlexBasisPercent(card, basisPercent);
        YGNodeStyleSetFlexGrow(card, grow);
        YGNodeStyleSetMinWidth(card, 0);
      } else if (mode == 3) {
        // Previous Featured algorithm ignores its fixed gap at small widths.
        YGNodeStyleSetWidthPercent(card, 48);
      }
    }
    YGNodeCalculateLayout(root, YGUndefined, YGUndefined, YGDirectionLTR);
    std::cout << std::setprecision(9) << "{\"reportedWidth\":" << reportedWidth << ",\"cards\":[";
    for (int i = 0; i < count; ++i) {
      if (i) std::cout << ',';
      std::cout << "{\"x\":" << YGNodeLayoutGetLeft(cards[i])
        << ",\"y\":" << YGNodeLayoutGetTop(cards[i])
        << ",\"width\":" << YGNodeLayoutGetWidth(cards[i]) << '}';
    }
    std::cout << "]}\n";
    YGNodeFreeRecursive(root);
    YGConfigFree(config);
  }
}
