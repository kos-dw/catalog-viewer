import PhotoSwipeDynamicCaption from "https://cdnjs.cloudflare.com/ajax/libs/photoswipe-dynamic-caption-plugin/1.2.7/photoswipe-dynamic-caption-plugin.esm.min.js";
import Lightbox from "https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.1/photoswipe-lightbox.esm.min.js";
import pswpModule from "https://cdnjs.cloudflare.com/ajax/libs/photoswipe/5.4.1/photoswipe.esm.min.js";

/**
 * photoswipeのラッパー関数
 * @param {string} gallerySelector
 */
export default function PhotoswipeWrapper(gallerySelector) {
  const arrow =
    '<svg class="pswp__icn" viewBox="0 0 60 100"><polyline points="53.543 2.648 6.279 49.911 53.721 97.352" style="fill:none; stroke:#fafafa; stroke-width:3px;"/></svg>';

  /**
   * 画像のサイズを取得してdata属性にセットする
   * @param {string} src
   * @returns {Promise<Map<string, number>>}
   */
  const setSize = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () =>
        resolve(
          new Map([
            ["width", img.width],
            ["height", img.height],
          ])
        );
      img.onerror = (e) => reject(e);
    });
  };
  document.querySelectorAll(gallerySelector).forEach((gallery) => {
    gallery.querySelectorAll("a").forEach((a) => {
      setSize(a.href).then(
        (size) =>
          (a.dataset.pswpWidth = size.get("width")) &&
          (a.dataset.pswpHeight = size.get("height"))
      );
    });
  });

  /**
   * PhotoswipeLightboxの初期化
   */
  const lightbox = new Lightbox({
    gallery: gallerySelector,
    children: "a",
    pswpModule: pswpModule,
    arrowPrevSVG: arrow,
    arrowNextSVG: arrow,
  });

  new PhotoSwipeDynamicCaption(lightbox, {
    type: "auto",
  });

  lightbox.init();
}
