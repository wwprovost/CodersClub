
export function getDimension(element, name) {
  return parseInt(getComputedStyle(element)[name].replace("px", ""));
}

export class VerticalSplitter {

  /**
   * upper, lower, and splitter must be siblings.
   * upperMin and lowerMin are pixel measurements.
   * initialPosition is either a pixel measurement for the upper height,
   *   or a percentage (i.e. 1-99)
   * percentage is false in the first case, true in the second
   */
  constructor(upper, lower, splitter, upperMin, lowerMin, initialPosition, percentage) {
    this.upper = upper;
    this.lower = lower;
    this.splitter = splitter;
    this.upperMin = upperMin;
    this.lowerMin = lowerMin;
    this.initialPosition = initialPosition;
    this.percentage = percentage;

    this.container = this.splitter.parentNode;
    this.dragging = false;

    this.upperHeight = getDimension(this.upper, "height");
    this.lowerHeight = getDimension(this.lower, "height")
    this.totalHeight = this.upperHeight + this.lowerHeight;

    if (typeof this.initialPosition != "undefined") {
      this.updateTotalHeight();
      this.setHeights((typeof this.percentage != "undefined")
        ? this.totalHeight * this.initialPosition / 100
        : this.initialPosition);

      this.totalWidth = getDimension(this.container, "width");
      this.setWidths();
    }

    this.splitter.onmousedown = ev => {
        this.dragging = true;
        this.latestY = ev.clientY;
      };

    this.container.onmousemove =
      ev => {
        if (this.dragging) {
          let delta = ev.clientY - this.latestY;
          this.latestY = ev.clientY;
          this.setHeights(this.upperHeight + delta);
        }
      };

    this.container.onmouseup =
      this.container.onmouseleave =
        ev => { this.dragging = false; };

    this.container.onresize = ev => {
        this.totalWidth = getDimension(this.container, "width");
        this.setWidths();

        let proportion = this.upperHeight / this.totalHeight;
        this.updateTotalHeight();
        this.setHeights(this.totalHeight * proportion);
      };
  }

  updateTotalHeight() {
    this.totalHeight = getDimension(this.container, "height") -
      getDimension(this.upper, "margin") * 2 -
      getDimension(this.lower, "margin") * 2 -
      getDimension(this.splitter, "margin") * 2;
  }

  setHeights(upperHeight) {
    this.upperHeight = upperHeight;
    this.lowerHeight = this.totalHeight - this.upperHeight;

    // Force minima if initial setup or window resize
    if (!this.dragging) {
      if (this.totalHeight < this.upperMin + this.lowerMin) {
        let upperShare = this.upperMin / (this.upperMin + this.lowerMin);
        this.upperHeight = this.totalHeight * upperShare;
        this.lowerHeight = this.totalHeight - this.upperHeight;
      } else if (this.upperHeight < this.upperMin) {
        this.lowerHeight -= this.upperMin - this.upperHeight;
        this.upperHeight = this.upperMin;
      } else if (this.lowerHeight < this.lowerMin) {
        this.upperHeight -= this.lowerMin - this.lowerHeight;
        this.lowerHeight = this.lowerMin;
      }
    }

    // Now, in those cases plus dragging in-bounds of the minima,
    // update the DOM heights and fire resize events to children:
    if (this.upperHeight >= this.upperMin &&
        this.lowerHeight >= this.lowerMin) {
      this.upper.style.height = "" + this.upperHeight + "px";
      this.lower.style.height = "" + this.lowerHeight + "px";

      this.upper.dispatchEvent(new Event("resize"));
      this.lower.dispatchEvent(new Event("resize"));
    }
  }

  setWidths() {
    this.upper.style.width = this.totalWidth -
        getDimension(this.upper, "margin");
    this.lower.style.width = this.totalWidth -
        getDimension(this.lower, "margin");
    this.splitter.style.width = this.totalWidth -
        getDimension(this.splitter, "margin");

    this.upper.dispatchEvent(new Event("resize"));
    this.lower.dispatchEvent(new Event("resize"));
  }
}

export class HorizontalSplitter {

  /**
   * left, right, and splitter must be siblings.
   * leftMin and rightMin are pixel measurements.
   * initialPosition is either a pixel measurement for the left width,
   *   or a percentage (i.e. 1-99)
   * percentage is false in the first case, true in the second
   */
  constructor(left, right, splitter, leftMin, rightMin, initialPosition, percentage) {
    this.left = left;
    this.right = right;
    this.splitter = splitter;
    this.leftMin = leftMin;
    this.rightMin = rightMin;
    this.initialPosition = initialPosition;
    this.percentage = percentage;

    this.container = this.splitter.parentNode;
    this.dragging = false;

    this.leftWidth = getDimension(this.left, "width");
    this.rightWidth = getDimension(this.right, "width")
    this.totalWidth = this.leftWidth + this.rightWidth;

    if (typeof this.initialPosition != "undefined") {
      this.updateTotalWidth();
      this.setWidths((typeof this.percentage != "undefined")
        ? this.totalWidth * this.initialPosition / 100
        : this.initialPosition);

      this.totalHeight = getDimension(this.container, "height");
      this.setHeights();
    }

    this.splitter.onmousedown = ev => {
        this.dragging = true;
        this.latestX = ev.clientX;
      };

    this.container.onmousemove =
      ev => {
        if (this.dragging) {
          let delta = ev.clientX - this.latestX;
          this.latestX = ev.clientX;
          this.setWidths(this.leftWidth + delta);
        }
      };

    this.container.onmouseup =
      this.container.onmouseleave =
        ev => { this.dragging = false; };

    this.container.onresize = ev => {
        this.totalHeight = getDimension(this.container, "height");
        this.setHeights();

        let proportion = this.leftWidth / this.totalWidth;
        this.updateTotalWidth();
        this.setWidths(this.totalWidth * proportion);
      };
  }

  updateTotalWidth() {
    this.totalWidth = getDimension(this.container, "width") -
      getDimension(this.left, "margin") * 2 -
      getDimension(this.left, "padding") * 2 -
      getDimension(this.left, "borderWidth") * 2 -
      getDimension(this.right, "margin") * 2 -
      getDimension(this.right, "padding") * 2 -
      getDimension(this.right, "borderWidth") * 2 -
      getDimension(this.splitter, "width") -
      getDimension(this.splitter, "margin") * 2 -
      getDimension(this.splitter, "padding") * 2 -
      getDimension(this.splitter, "borderWidth") * 2;//TODO propagate to vsplitter
  }

  setWidths(leftWidth) {
    this.leftWidth = leftWidth;
    this.rightWidth = this.totalWidth - this.leftWidth;

    // Force minima if initial setup or window resize
    if (!this.dragging) {
      if (this.totalWidth < this.leftMin + this.rightMin) {
        let leftShare = this.leftMin / (this.leftMin + this.rightMin);
        this.leftWidth = this.totalWidth * leftWidth;
        this.rightWidth = this.totalWidth - this.leftWidth;
      } else if (this.leftWidth < this.leftMin) {
        this.rightWidth -= this.leftMin - this.leftWidth;
        this.leftWidth = this.leftin;
      } else if (this.rightWidth < this.rightMin) {
        this.leftWidth -= this.rightMin - this.rightWidth;
        this.rightWidth = this.rightMin;
      }
    }

    // Now, in those cases plus dragging in-bounds of the minima,
    // update the DOM widths and fire resize events to children:
    if (this.leftWidth >= this.leftMin &&
        this.rightWidth >= this.rightMin) {

      this.left.style.width = "" + this.leftWidth + "px";
      this.splitter.style.marginLeft = this.left.style.width;
      this.right.style.width = "" + this.rightWidth + "px";

      this.left.dispatchEvent(new Event("resize"));
      this.right.dispatchEvent(new Event("resize"));
    }
  }

  setHeights() {
    this.left.style.height = "" + (this.totalHeight -
        getDimension(this.left, "margin") * 2 -
        getDimension(this.left, "padding") * 2 -
        getDimension(this.left, "borderWidth") * 2) + "px";

    this.splitter.style.height = "" + (this.totalHeight -
        getDimension(this.splitter, "margin") * 2 -
        getDimension(this.splitter, "padding") * 2 -
        getDimension(this.splitter, "borderWidth") * 2) + "px";

    this.right.style.height = "" + (this.totalHeight -
        getDimension(this.right, "margin") * 2 -
        getDimension(this.right, "padding") * 2 -
        getDimension(this.right, "borderWidth") * 2) + "px";

    this.left.dispatchEvent(new Event("resize"));
    this.right.dispatchEvent(new Event("resize"));
  }
}

