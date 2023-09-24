export default class CatalogViewer {
  // フィールド宣言
  // ------------------------------------------------
  #wrapper;
  #itemList;
  #itemsPerPage;
  #chunks;
  #el;
  #pagenationChilds;
  #pageTurn;
  #api;
  #resourceMap;
  #lightbox;
  #lightboxSelector;
  currentChunk;
  chunkLength;

  /**
   * CatalogViewer のインスタンスを作成
   * @param {Object} props - プロパティオブジェクト
   * @param {string} props.containerSelector - コンテナのセレクタ
   * @param {string} props.api - データを提供するAPIのURL
   * @param {string} props.resourceMap - リソースマップのURL
   * @param {any} props.lightbox - 画像ポップアッププラグイン
   * @param {string} props.lightboxSelector - 画像ポップアッププラグインのセレクタ
   * @memberof CatalogViewer
   */
  constructor(props) {
    /** @type {HTMLDivElement} */
    this.#wrapper = document.querySelector(props.containerSelector);
    /** @type {{title:string,imgs_id:string}[]} アイテムリスト */
    this.#itemList = [];
    /** ページネーションの1ページあたりの要素数 */
    this.#itemsPerPage = 4;
    /**
     * 1ページごとに表示するアイテムの塊
     * @type {{ id: number; chunk: { title: string; imgs_id: string; }[];}[]}
     */
    this.#chunks = [];
    /** 要素のオブジェクト */
    this.#el = {
      /** @type {HTMLTemplateElement} */
      temp1: this.#wrapper.querySelector("[u-temp1]"),
      /** @type {HTMLTemplateElement} */
      temp2: this.#wrapper.querySelector("[u-temp2]"),
      /** @type {HTMLTemplateElement} */
      tempDummy: this.#wrapper.querySelector("[u-tempDummy]"),
      /** @type {HTMLTemplateElement} */
      tempPagination: this.#wrapper.querySelector("[u-tempPagination]"),
      /** @type {HTMLUListElement} */
      viewer: this.#wrapper.querySelector("[u-items]"),
      /** @type {HTMLUListElement} */
      pagination: this.#wrapper.querySelector("[u-pagination]"),
    };
    /**
     * 1ページごとに表示する
     * @type {{ id: Number, bullet: Node }[]}
     */
    this.#pagenationChilds = [];
    /**
     * ページ送りボタンの要素
     * @type {{ first: Node, prev: Node, next: Node, last: Node }}
     */
    this.#pageTurn = {};
    /** データを提供するAPIのURL */
    this.#api = props.api;
    /** リソースマップのURL */
    this.#resourceMap = props.resourceMap;
    /** 画像ポップアッププラグイン */
    this.#lightbox = props.lightbox;
    /** 画像ポップアッププラグインのセレクタ */
    this.#lightboxSelector = props.lightboxSelector;
    /** 現在の表示ブロック */
    this.currentChunk = 1;
  }

  // プライベートメソッド
  // ------------------------------------------------

  /**
   * 初期化
   * @memberof CatalogViewer
   */
  async #init() {
    // 表示ブロックのリストを作成
    try {
      const res = await fetch(this.#resourceMap);
      if (!res.ok) throw new Error("Fetch error");
      const json = await res.json();
      this.#itemList = json;
    } catch (e) {
      console.error(e.mesage);
    }
    this.#chunks = this.#createChunkArray(this.#itemList, this.#itemsPerPage);
    this.chunkLength = this.#chunks.length;

    // プレースホルダーをセット
    const fragment = document.createDocumentFragment();
    for (let i = 1; i <= this.#itemsPerPage; i++) {
      let nodeDummy = this.#el.tempDummy.content.cloneNode(true);
      fragment.append(nodeDummy);
    }
    this.#el.viewer.append(fragment);
  }

  /**
   * ページ遷移時の表示効果
   * @param { "on" | "off" } flag
   */
  #transitionEffect(flag) {
    const option = {
      duration: 200,
      fill: "forwards",
    };
    return new Promise((resolve, reject) => {
      if (flag === "on") {
        const animeOn = this.#el.viewer.animate(
          {
            opacity: 0,
          },
          option
        );
        animeOn.addEventListener("finish", resolve);
      } else {
        const animeOff = this.#el.viewer.animate(
          {
            opacity: 1,
          },
          option
        );
        animeOff.addEventListener("finish", resolve);
      }
    });
  }

  /**
   * 塊の作成
   * @param {{title:string,imgs_id:string}[]} itemArray 要素の配列
   * @param {number} chunkSize 塊のサイズ
   */
  #createChunkArray(itemArray, chunkSize) {
    const chunks = [];
    let chunkId = 1;
    for (
      let chunkStart = 0;
      chunkStart < itemArray.length;
      chunkStart += chunkSize
    ) {
      chunks.push({
        id: chunkId,
        chunk: itemArray.slice(chunkStart, chunkStart + chunkSize),
      });
      chunkId++;
    }
    return chunks;
  }

  /**
   * イメージリストの取得
   * @param {{title:string,imgs_id:string}[]} chunk アイテムリスト
   * @return {{image_paths:string[],imgs_id:string}[]}
   */
  async #getImageList(chunk) {
    try {
      const res = await fetch(this.#api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          list_of_id: chunk.map((row) => row.imgs_id),
        }),
      });
      if (!res.ok) throw new Error("Fetch error");
      const json = await res.json();
      return json;
    } catch (e) {
      console.error(e.mesage);
    }
  }

  /**
   * ページの表示
   * @param {number} chunkSize 塊のサイズ
   */
  async #viewChunk(id) {
    await this.#transitionEffect("on");

    const prevIndex = this.currentChunk;
    const nextIndex = id;

    this.currentChunk = nextIndex;

    const chunk = this.#chunks.find((chunk) => chunk.id === nextIndex).chunk;
    const imageList = await this.#getImageList(chunk);

    // 表示エリアの要素をリセット
    this.#el.viewer.innerHTML = "";

    // 表示エリアに要素を追加

    const fragmentOuter = document.createDocumentFragment();
    chunk.forEach((row) => {
      // template要素を複製してデータを挿入
      const tempOuter = this.#el.temp1.content.cloneNode(true);
      const fragmentInner = document.createDocumentFragment();
      tempOuter.querySelector('[u-attr="title"]').textContent = row.title;

      // 表示エリア内のネストした画像表示部にtempleteをクローンした要素を追加
      let list = imageList.find(
        (img) => row.imgs_id === img.imgs_id
      ).image_paths;
      list.forEach((path) => {
        const tempInner = this.#el.temp2.content.cloneNode(true);
        tempInner.querySelector('[u-attr="href"]').href = path;
        tempInner.querySelector('[u-attr="src"]').src = path;
        tempInner.querySelector('[u-attr="src"]').alt = row.title;
        if (path !== list[0])
          tempInner.querySelector('[u-attr="class"]').classList.add("d-none");
        fragmentInner.append(tempInner);
      });
      tempOuter.querySelector('[u-attr="images"]').append(fragmentInner);
      fragmentOuter.append(tempOuter);
    });

    this.#el.viewer.append(fragmentOuter);

    await this.#createPagenation();
    this.#el.pagination
      .querySelector(`[data-chunk="${this.currentChunk}"]`)
      .classList.add("active");
    await this.#transitionEffect("off");
  }

  /**
   * ページネーションを生成
   */
  async #createPagenation() {
    const fragment = document.createDocumentFragment();
    /**
     * バレットの追加
     * @param {string} transitionTarget
     * @param {string} text
     * @param {number} goto
     * @param {boolean} isPageTurn
     */
    this.#el.pagination.innerHTML = "";
    this.#pagenationChilds = [];
    const addBulletForArrow = async (transitionTarget, text, goto) => {
      const attr = "data-turn";
      const bullet = this.#el.tempPagination.content.cloneNode(true);
      const button = bullet.querySelector('[u-attr="chunk"]');
      button.setAttribute(attr, transitionTarget);
      button.textContent = text;
      button.addEventListener("click", async (e) => {
        await this.router(goto);
      });
      return bullet;
    };

    // ページ送りボタンをオブジェクトに追加[go to first]
    this.#pageTurn.first = await addBulletForArrow("first", "First", 1);
    // ページ送りボタンをオブジェクトに追加[go to prev]
    this.#pageTurn.prev = await addBulletForArrow(
      "prev",
      "<",
      this.currentChunk - 1
    );
    // ページ送りボタンをオブジェクトに追加[go to next]
    this.#pageTurn.next = await addBulletForArrow(
      "next",
      ">",
      this.currentChunk + 1
    );
    // ページ送りボタンをオブジェクトに追加[go to last]
    this.#pageTurn.last = await addBulletForArrow(
      "last",
      "Last",
      this.#chunks.length
    );

    // ページネーション表示
    this.#chunks.forEach(async (_, i) => {
      const index = i + 1;
      const attr = "data-chunk";
      const bullet = this.#el.tempPagination.content.cloneNode(true);
      const button = bullet.querySelector('[u-attr="chunk"]');
      button.setAttribute(attr, index.toString());
      button.textContent = index;
      button.addEventListener("click", async (e) => {
        await this.router(index);
      });

      this.#pagenationChilds.push({
        id: index,
        bullet,
      });
    });
    const visiblePagenationList = this.#filteringPagenation(this.currentChunk);
    visiblePagenationList.forEach((row) => fragment.append(row.bullet));

    // ページ送りボタンの表示
    fragment.prepend(this.#pageTurn.prev);
    fragment.prepend(this.#pageTurn.first);
    fragment.append(this.#pageTurn.next);
    fragment.append(this.#pageTurn.last);

    // 要素の一括追加
    this.#el.pagination.append(fragment);
  }

  /**
   * ページネーションのフィルタリング
   * @param {number} currentPage
   */
  #filteringPagenation(currentPage) {
    // 初期化
    const threshold = 2;
    let start = currentPage - threshold;
    let end = currentPage + threshold;
    for (let key in this.#pageTurn) {
      this.#pageTurn[key].querySelector("button").disabled = false;
    }

    // start付近の挙動
    if (currentPage < threshold + 1) {
      start = 1;
      end = threshold * 2 + 1;
      this.#pageTurn.first.querySelector("button").disabled = true;
      this.#pageTurn.prev.querySelector("button").disabled = true;
    }

    // last付近の挙動
    if (currentPage > this.#pagenationChilds.length - threshold) {
      start = this.#pagenationChilds.length - threshold * 2;
      end = this.#pagenationChilds.length;
      this.#pageTurn.next.querySelector("button").disabled = true;
      this.#pageTurn.last.querySelector("button").disabled = true;
    }

    // バレットの表示
    let visibledBullets = this.#pagenationChilds.filter(
      (row) => row.id >= start && row.id <= end
    );

    return visibledBullets;
  }

  // パブリックメソッド
  // ------------------------------------------------

  /**
   * 起動
   */
  async launch() {
    await this.#init();
    await this.router(1);
  }

  /**
   * チャンクの移動
   * @param {number} goto
   */
  async router(goto) {
    await this.#viewChunk(goto);
    try {
      this.#lightbox(this.#lightboxSelector);
    } catch (e) {
      console.error(e.message);
    }
  }
}
