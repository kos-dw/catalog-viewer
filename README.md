# catalog-viewer

## What's this?

このプログラムは、画像のリストをページネーション形式で表示するCatalogViewerクラスを実装しています。CatalogViewerクラスは、アイテムリストを指定されたページごとの塊に分割し、ページ送りボタンを通じてそれらの塊を表示します。また、画像ポップアップ機能も提供しています。ページ送りボタンや画像ポップアップ機能を制御するためのメソッドも含まれています。

## Usage

### 表示部分のマークアップ

表示させるためにtemplate要素等をマークアップします。

- **u-items**:表示する画像を追加するための親要素
- **u-pagination**:表示するページネーションを追加するための親要素
- **u-temp1**:画像ビューアーのためのtemplate要素
- **u-temp2**:ビューアー内の画像アイテムのためのtemplate要素
- **u-tempDummy**:プレースホルダーのためのtemplate要素
- **u-tempPagination**:ページネーションのためのtemplate要素

```html
<div id="catalog-viewer-with-pagenation" aria-label="コンテナ">
  <!-- 表示領域 ここから -->
  <div>
    <div class="mb-5" aria-label="ビューアー">
      <ul u-items class="row g-4 row-cols-3"></ul>
    </div>
    <div
      class="d-flex justify-content-between align-items-center"
      aria-label="ページネーション"
    >
      <div class="prev">
        <button type="button" class="btn btn-primary">PREV</button>
      </div>
      <ul
        u-pagination
        class="pager-wrapper d-flex justify-content-center align-items-center"
      ></ul>
      <div class="next">
        <button type="button" class="btn btn-primary">NEXT</button>
      </div>
    </div>
  </div>
  <!-- 表示領域 ここまで -->

  <!-- Template ビューアー -->
  <template u-temp1>
    <li class="col">
      <div data-gallery>
        <ul u-attr="images"></ul>
      </div>
      <h3 u-attr="title" class="fs-6 pe-5"></h3>
    </li>
  </template>
  <!-- Template ビューアー内の画像アイテム -->
  <template u-temp2>
    <li u-attr="class">
      <a u-attr="href" class="ratio ratio-16x9">
        <img
          u-attr="src"
          class="object-fit-cover"
          alt=""
          loading="lazy"
        />
      </a>
    </li>
  </template>
  <!-- Template プレースホルダー -->
  <template u-tempDummy>
    <li>
      <div class="placeholder-glow mb-3">
        <div class="placeholder bg-gray ratio ratio-16x9"></div>
      </div>
    </li>
  </template>
  <!-- Template ページネーション -->
  <template u-tempPagination>
    <li><button u-attr="chunk" class="pointer"></button></li>
  </template>
</div>
```

### イメージリストの作成

表示したい画像をjson形式でリスト化します。

```javascript
const imgList = [
  {
    "title": "sunt aut facere repellat",
    "imgs": [
      "./sample/001/26125582.jpg",
      "./sample/001/26125583.jpg",
      "./sample/001/430305.jpg"
    ]
  },
  {
    "title": "qui est esse",
    "imgs": [
      "./sample/002/26125584.jpg",
      "./sample/002/26140844.jpg",
      "./sample/002/26151459.jpg"
    ]
  },
  ・・・
];
```

### クラスのインスタンス生成

イメージのリストを、CatalogViewerクラスに渡し、その他必要な情報も提供してインスタンスを生成します。

```javascript

import CatalogViewer from "./js/modules/catalog-viewer.js";
import PhotoswipeWrapper from "./js/dist/photoswipe-wrapper.js";

const viewer = new CatalogViewer({
  // コンテナ要素のセレクタ
  containerSelector: "#catalog-viewer-with-pagenation",
  // イメージリスト
  itemList: itemList,
  // 画像ポップアッププラグイン
  lightbox: PhotoswipeWrapper,
  // ポップアップ要素のセレクタ
  lightboxSelector: "[data-gallery]",
  // 1ページに表示させる画像数
  itemsPerPage: 9,
});

```

### インスタンスの起動とページネーションの起動

```javascript

// インスタンス起動
viewer.launch();

// ページ送りボタン要素
const prevBtnEl = document.querySelector(
  "#catalog-viewer-with-pagenation .prev button"
);
const nextBtnEl = document.querySelector(
  "#catalog-viewer-with-pagenation .next button"
);

// ページ送りボタンの実装
prevBtnEl.addEventListener("click", (e) => {
  if (viewer.currentChunk > 1) {
    viewer.router(viewer.currentChunk - 1);
  }
});
nextBtnEl.addEventListener("click", (e) => {
  if (viewer.currentChunk < viewer.chunkLength) {
    viewer.router(viewer.currentChunk + 1);
  }
});

```
