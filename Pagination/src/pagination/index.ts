import './styles/index.less';
//  默认配置
import defaults from "./defaults";
import { PaginationConfig } from './types/index'
import Select from '../select/index';

class Pagination {
  private options: PaginationConfig;
  private pageElement: any;
  private total: any;
  private current: any;
  private pageCount: any;
  private pageSize: any;


	constructor(selector: any, options = {}) {
    // 默认配置
    this.options = Object.assign(defaults, options);
    this.init(selector);
  }

  private static CLASS_NAME = {
    ITEM: 'pagination-item',
    ITEM_ACTIVE: 'darrell-pagination-item-active',
    LINK: 'darrell-pagination-link',
    ICONLINK: 'darrell-pagination-item-link-icon',
    ELLIPSIS: 'darrell-pagination-item-ellipsis',
  }

  private static PAGE_INFOS = [
    {
      id: 'prev',
      className: 'darrell-pagination-prev',
    },
    {
      id: 'next',
      className: 'darrell-pagination-next',
    },
    {
      id: 'jump-prev',
      className: 'darrell-pagination-jump-prev',
    },
    {
      id: 'jump-next',
      className: 'darrell-pagination-jump-next',
    }
  ];

  getPageInfos (className: any, content: any) {
    return {
      id: 'page',
      content,
      className,
    };
  }

  /**
   * 添加事件的方法函数
   * @param element
   * @param type
   * @param handler
   */
  private addEvent (element: any, type: any, handler: any) {
    // 添加绑定
    if (element.addEventListener) {
      // 使用DOM2级方法添加事件
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      // 使用IE方法添加事件
      element.attachEvent("on" + type, handler);
    } else {
      // 使用DOM0级方法添加事件
      element["on" + type] = handler;
    }
  }

  /**
   * 模仿jQuery $()
   * @param selector
   * @param context
   */
  private $(selector:any, context?:any) {
    context = arguments.length > 1 ? context : document;
    return context ? context.querySelectorAll(selector) : null;
  }

  /**
   * 改变页数
   */
  private changePage () {
    let pageElement = this.pageElement;
    const isDisabled = this.options.disabled;

    if (!isDisabled) {
      this.addEvent(pageElement, 'click', (ev: any) => {
        let e = ev || window.event;
        let target = e.target || e.srcElement;

        const parentNode = target.parentNode;
  
        if (parentNode && parentNode.nodeName.toLocaleLowerCase() == "li") {
          if (parentNode.id === "prev") {
            if (!this.hasPrev()) return false;
            this.prevPage();
          } else if (parentNode.id === "next") {
            if (!this.hasNext()) return;

            this.nextPage();
          } else if (parentNode.id === "jump-prev") {
            this.jumpPrevPage();
          } else if (parentNode.id === "jump-next") {
            this.jumpNextPage();
          } else if (parentNode.id === "page") {
            this.goPage(parseInt(target.innerHTML, 10));
          } else {
            return;
          }

          this.renderPages();
          this.options.onChange && this.options.onChange(this.current, this.pageSize);
        }
      });
    }
  }

  /**
   * 添加事件的方法
   */
  private changePageNew () {
    let pageElement = this.pageElement;
    const isDisabled = this.options.disabled;

    const liEles = this.$('.liEventTarget' ,pageElement);

    if (!isDisabled) {

      for (let i = 0; i < liEles.length; i++) {
        const liItem = liEles[i];

        this.addEvent(liItem, 'click', (ev: any) => {
          let e = ev || window.event;
          let target = e.currentTarget;

          if (target.nodeName.toLocaleLowerCase() == "li") {
            if (target.id === "prev") {
              this.prevPage();
            } else if (target.id === "next") {
              this.nextPage();
            } else if (target.id === "jump-prev") {
              this.jumpPrevPage();
            } else if (target.id === "jump-next") {
              this.jumpNextPage();
            } else if (target.id === "page") {
              this.goPage(parseInt(target.childNodes[0].innerHTML, 10));
            } else {
              return;
            }
            this.renderPages();
            this.options.onChange && this.options.onChange(this.current, this.pageSize);
          }
        })
      }
    }
  }

  /**
   * 前一页
   */
  private prevPage () {
    // this.current--;
    if (this.hasPrev()) {
      this.current = this.getPrevPage();
    }
  }

  private getPrevPage () {
    return this.current - 1 > 0 ? this.current - 1 : 0;
  }

  /**
   * 后一页
   */
  private nextPage () {
    // this.current++;
    if (this.hasNext()){
      this.current = this.getNextPage();
    }
  }

  private getNextPage () {
    return this.current + 1 > this.pageCount ? this.pageCount : this.current + 1;
  }

  /**
   * 取到某一页
   * @param current 
   */
  private goPage (current: number) {
    this.current = current;
  }

  /**
   * 跳到省略号 前一批
   */
  private jumpPrevPage () {
    this.current = this.getJumpPrevPage();
  }

  private getJumpPrevPage () {
    const pageBufferSize = this.options.showLessItems ? 3 : 5;
    return Math.max(1, this.current - pageBufferSize);
  }

  /**
   * 跳到省略号 后一批
   */
  private jumpNextPage () {
    this.current = this.getJumpNextPage();
  }

  private getJumpNextPage () {
    const pageBufferSize = this.options.showLessItems ? 3 : 5;
    return Math.min(this.pageCount, this.current + pageBufferSize);
  }

  /**
   * 是否有前一页
   */
  private hasPrev = () => {
    return this.current > 1;
  }

  /**
   * 是否有后一页
   */
  private hasNext = () => {
    return this.current < this.pageCount;
  }

  /**
   * 添加 class 名
   */
  private static addClass = (elem: any, className: any) => {
    if (elem.className) {
      const oriName = elem.className;
      const newClass = oriName + ' ' + className;
      elem.className = newClass;
    } else {
      elem.className = className;
    }
  }

  /**
   * 
   */
  private getIcon = (icon: any): any => {
    let aEle = document.createElement("a");

    return icon || aEle;
  }

  /**
   * 默认 获取每一个 icon 的 a 标签样式
   */
  private getEveryIconType = (): any => {
    let prevIconEle = document.createElement("a");
    let nextIconEle = document.createElement("a");

    let jumpPrevWrapEle = document.createDocumentFragment();

    let jumpPrevIconEle = document.createElement("a");
    let jumpPrevSpanEle = document.createElement("span");

    let jumpNextWrapEle = document.createDocumentFragment();
    let jumpNextIconEle = document.createElement("a");
    let jumpNextSpanEle = document.createElement("span");

    prevIconEle.setAttribute('class', `iconfont icon-left ${Pagination.CLASS_NAME.LINK}`);

    nextIconEle.setAttribute('class', `iconfont icon-right ${Pagination.CLASS_NAME.LINK}`);

    jumpPrevSpanEle.setAttribute('class', `iconfont icon-shuangzuojiantou- ${Pagination.CLASS_NAME.ICONLINK}`);
    jumpPrevIconEle.setAttribute('class', Pagination.CLASS_NAME.ELLIPSIS);
    jumpPrevIconEle.innerHTML = '•••';
    jumpPrevWrapEle.appendChild(jumpPrevSpanEle);
    jumpPrevWrapEle.appendChild(jumpPrevIconEle);

    jumpNextSpanEle.setAttribute('class', `iconfont icon-shuangyoujiantou- ${Pagination.CLASS_NAME.ICONLINK}`);
    jumpNextIconEle.setAttribute('class', Pagination.CLASS_NAME.ELLIPSIS);
    jumpNextIconEle.innerHTML = '•••';
    jumpNextWrapEle.appendChild(jumpNextSpanEle);
    jumpNextWrapEle.appendChild(jumpNextIconEle);

    return {
      prevIconEle,
      nextIconEle,
      jumpPrevWrapEle,
      jumpNextWrapEle,
    }
  }

  /**
   * 默认的 render 方法
   */
  static defaultItemRender = (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: any) => {
    return element;
  }

  /**
   * 创建 Li 元素
   * @param liItemInfo 
   */
  private createLiHtml (liItemInfo: Array<any>) {
    let fragment = document.createDocumentFragment();

    const itemRender = this.options.itemRender || Pagination.defaultItemRender;

    let liEle = document.createElement("li");
    // let aEle = document.createElement("a");
    // let spanEle = document.createElement("span");

    const id = liItemInfo[0].id;
    const className = liItemInfo[0].className;
    const content = liItemInfo[0].content;

    const current = this.current;

    liEle.setAttribute('class', `${className} liEventTarget`);
    liEle.setAttribute('id', id);

    let aEle;

    // aEle.setAttribute('href', 'javascript:;');
    // aEle.setAttribute('id', id);

    if (id === 'prev') {
      // aEle.setAttribute('class', `iconfont icon-left ${Pagination.CLASS_NAME.LINK}`);
      if (!this.hasPrev()) {
        Pagination.addClass(liEle, "darrell-pagination-disabled");
      }
      aEle = itemRender(
        this.getPrevPage(),
        'prev',
        this.getIcon(this.getEveryIconType().prevIconEle)
      )
    } else if (id === 'next') {
      // aEle.setAttribute('class', `iconfont icon-right ${Pagination.CLASS_NAME.LINK}`);
      if (!this.hasNext()) {
        Pagination.addClass(liEle, "darrell-pagination-disabled");
      }
      aEle = itemRender(
        this.getNextPage(),
        'prev',
        this.getIcon(this.getEveryIconType().nextIconEle)
      )
    } else if (id === 'jump-prev') {
      // spanEle.setAttribute('class', `iconfont icon-shuangzuojiantou- ${Pagination.CLASS_NAME.ICONLINK}`);
      // aEle.setAttribute('class', Pagination.CLASS_NAME.ELLIPSIS);
      // liEle.appendChild(spanEle);
      aEle = itemRender(
        this.getJumpPrevPage(),
        'jump-prev',
        this.getIcon(this.getEveryIconType().jumpPrevWrapEle)
      )
    } else if (id === 'jump-next') {
      // spanEle.setAttribute('class', `iconfont icon-shuangyoujiantou- ${Pagination.CLASS_NAME.ICONLINK}`);
      // aEle.setAttribute('class', Pagination.CLASS_NAME.ELLIPSIS);
      // liEle.appendChild(spanEle);
      aEle = itemRender(
        this.getJumpNextPage(),
        'jump-prev',
        this.getIcon(this.getEveryIconType().jumpNextWrapEle)
      )
    } else if (id === 'page') {
      if (current === parseInt(content, 10)) {
        Pagination.addClass(liEle, Pagination.CLASS_NAME.ITEM_ACTIVE);
      }

      let aEleNew = document.createElement("a");
      aEleNew.innerHTML = content;

      aEle = itemRender(
        parseInt(content, 10),
        'page',
        aEleNew,
      )
    }

    liEle.appendChild(aEle);
    fragment.appendChild(liEle);

    return fragment;
  }

  /**
   * 往 html 片段中 前 添加 html
   * @param fragment 
   * @param datas 
   */
  private addFragmentBefore (fragment: any, datas: any) {
    fragment.insertBefore(this.createLiHtml(datas), fragment.firstChild);
  }

  /**
   * 往 html 片段中 后 添加 html
   * @param fragment 
   * @param datas 
   */
  private addFragmentAfter (fragment: any, datas: any) {
    fragment.appendChild(this.createLiHtml(datas));
  }

  /**
   * 渲染页面
   */
  private renderPages () {
    this.pageElement.innerHTML = "";

    const current = this.current;
    const pageSize = this.pageSize;
    const total = this.total;
    const pageCount = this.pageCount;

    const isDisabled = this.options.disabled;
    const isSmall = this.options.size;
    const showTotal = this.options.showTotal;
    const showSizeChanger = this.options.showSizeChanger;
    const showQuickJumper = this.options.showQuickJumper;
    const hideOnSinglePage = this.options.hideOnSinglePage;

    const simple = this.options.simple;

    if (hideOnSinglePage) {
      if (pageCount === 1) {
        return false;
      }
    }

    let fragment: any = ''; 

    if (!simple) {
      fragment = this.showPages();
    } else {
      fragment = this.simplePages();
    }

    let UlEle = document.createElement("ul");
    UlEle.appendChild(fragment);

    UlEle.setAttribute('class', 'darrell-pagination');

    if (simple) {
      Pagination.addClass(UlEle, 'darrell-pagination-simple');
    }

    if (isDisabled) {
      Pagination.addClass(UlEle, 'darrell-pagination-disabled');
    }

    if (isSmall) {
      Pagination.addClass(UlEle, 'mini');
    }

    if (showTotal && typeof showTotal === 'function' && !simple) {
      let LiTextEle = document.createElement("li");
      LiTextEle.setAttribute('class', 'darrell-pagination-total-text');

      const TotalText = showTotal(
        this.total,
        [
          this.total === 0 ? 0 : (current - 1) * pageSize + 1,
          current * pageSize > total ? total : current * pageSize,
        ]
      );

      LiTextEle.innerHTML = TotalText;

      UlEle.insertBefore(LiTextEle, UlEle.firstChild);
    }

    if (showSizeChanger && !simple) {
      // 放改变 size 的框
      let LiEle = document.createElement("li");
      LiEle.setAttribute('id', 'select');
      LiEle.setAttribute('class', 'darrell-pagination-options');

      UlEle.appendChild(LiEle);
    }

    if (showQuickJumper && !simple) {
      let quickJumperEle = this.createQuickJumperDom();
      UlEle.appendChild(quickJumperEle);
    }

    this.pageElement.appendChild(UlEle);

    if (showSizeChanger && !simple) {
      new Select('#select', {
        value: this.pageSize,
        currentPage: this.current,
        disabled: isDisabled,
        onShowSizeChange: (current: number, size: number) => {
          // pageSize
          this.pageSize = size;

          // 总页数
          this.pageCount = Math.ceil(this.total / this.pageSize);

          // 当前页数
          if (current > this.pageCount) {
            current = this.pageCount;
          } else if (current < 1) {
            current = 1
          }

          this.current = current;

          this.renderPages();
          this.options.onShowSizeChange && this.options.onShowSizeChange(current, size);
        },
      });
    }
  }

  private getValidValue = (inputValue: any): number => {
    const current = this.current;
    return !inputValue || isNaN(inputValue) ? current : Number(inputValue);
  }

  // private inputChange = (ev: any) => {
  //   let e = ev || window.event;
  //   let target = e.target || e.srcElement;

  //   const value = target.value;
  // }

  private inputKeyUp = (ev: any) => {
    let e = ev || window.event;
    const keyCode = e.keyCode;
    const target = e.target || e.srcElement;
    const value = target.value;

    if (keyCode === 13) {
      this.jumpToPage(this.getValidValue(value));
    }
  }

  private inputBlur = (ev: any) => {
    let e = ev || window.event;
    let target = e.target || e.srcElement;
    const value = target.value;
    this.jumpToPage(this.getValidValue(value));
  }

  private jumpToPage = (value: any) => {
    if (value > this.pageCount) {
      value = this.pageCount;
    } else if (value < 1) {
      value = 1;
    }

    if (value === this.current) return;

    this.current = value;

    this.renderPages();
    this.options.onChange && this.options.onChange(this.current, this.pageSize);
  }

  /**
   * 创建快速跳转页面的 html
   */
  private createQuickJumperDom () {
    const isDisabled = this.options.disabled;

    let fragment = document.createDocumentFragment();

    let liEle = document.createElement("li");
    let divEle = document.createElement("div");
    let inputEle = document.createElement("input");

    liEle.setAttribute('class', 'darrell-pagination-options');
    liEle.setAttribute('id', 'quickJumper');

    inputEle.setAttribute('type', 'text');

    divEle.setAttribute('class', 'darrell-pagination-options-quick-jumper');

    // divEle.innerHTML = `跳至<input type="text" onclick="${this.inputClick}" value />页`;
    let myText = document.createTextNode("跳至");
    let myText2 = document.createTextNode("页");

    // inputEle.oninput = this.inputChange;
    inputEle.onkeyup = this.inputKeyUp;
    inputEle.onblur = this.inputBlur;

    if (isDisabled) {
      inputEle.setAttribute('disabled', 'disabled');
    }


    divEle.appendChild(myText);
    divEle.appendChild(inputEle);
    divEle.appendChild(myText2);

    liEle.appendChild(divEle);

    fragment.appendChild(liEle);

    return fragment;
  }

  /**
   * 循环渲染相应的 Li 元素
   * @param begin 
   * @param end 
   */
  private renderDom (begin: number, end: number) {
    let fragment = document.createDocumentFragment();
    let str = "";
    for (let i = begin; i <= end; i++) {
      this.addFragmentAfter(fragment, [
        this.getPageInfos('darrell-pagination-item', i)
      ]);
    }
    return fragment;
  }

  /**
   * 通过页数，渲染相应的 分页 html
   */
  private showPages () {
    const current = this.current;
    const allPages = this.pageCount;
    const pageBufferSize = this.options.showLessItems ? 1 : 2;

    let fragment = document.createDocumentFragment();

    if (allPages <= 5 + pageBufferSize * 2) {
      const fragmentHtml = this.renderDom(1, allPages);
      fragment.appendChild(fragmentHtml);
    } else {
      let left = Math.max(1, current - pageBufferSize);
      let right = Math.min(current + pageBufferSize, allPages);

      if (current - 1 <= pageBufferSize) {
        right = 1 + pageBufferSize * 2;
      }

      if (allPages - current <= pageBufferSize) {
        left = allPages - pageBufferSize * 2;
      }

      const fragmentHtml = this.renderDom(left, right);
      fragment.appendChild(fragmentHtml);

      if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
        this.addFragmentBefore(fragment, [Pagination.PAGE_INFOS[2]]);
      }

      if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
        this.addFragmentAfter(fragment, [Pagination.PAGE_INFOS[3]]);
      }

      if (left !== 1) {
        this.addFragmentBefore(fragment, [
          this.getPageInfos('darrell-pagination-item', 1)
        ]);
      }

      if (right !== allPages) {
        this.addFragmentAfter(fragment, [
          this.getPageInfos('darrell-pagination-item', allPages)
        ]);
      }
    }

    this.addFragmentBefore(fragment, [Pagination.PAGE_INFOS[0]]);

    this.addFragmentAfter(fragment, [Pagination.PAGE_INFOS[1]]);

    return fragment;
  }

  /**
   * 简单的 分页 page style
   */
  private simplePages () {
    const current = this.current;
    const allPages = this.pageCount;

    let fragment = document.createDocumentFragment();

    let liPrevEle = document.createElement("li");

    let liSimpleWrap = document.createElement("li");
    let InputEle = document.createElement("input");
    let SpanEle = document.createElement("span");

    let liNextEle = document.createElement("li");

    liPrevEle.setAttribute('class', 'darrell-pagination-prev');
    liPrevEle.innerHTML = "<a  class='iconfont icon-left'></a>";

    liNextEle.setAttribute('class', 'darrell-pagination-next');
    liNextEle.innerHTML = "<a  class='iconfont icon-right'></a>";

    liSimpleWrap.setAttribute('class', 'darrell-pagination-simple-pager');
    InputEle.setAttribute('type', 'text');
    InputEle.setAttribute('value', current);
    SpanEle.setAttribute('class', 'darrell-pagination-slash');
    SpanEle.innerHTML = '/';
    let textEle = document.createTextNode(allPages);

    liSimpleWrap.appendChild(InputEle);
    liSimpleWrap.appendChild(SpanEle);
    liSimpleWrap.appendChild(textEle);

    fragment.appendChild(liPrevEle);
    fragment.appendChild(liSimpleWrap);
    fragment.appendChild(liNextEle);

    InputEle.onkeyup = this.inputKeyUp;
    InputEle.onblur = this.inputBlur;

    return fragment;
  }

  /**
   * render 分页 html 核心代码 这里是渲染相应的字符串
   * @param current 
   * @param allPages 
   * @param pageBufferSize 
   */
  private showPages1 (current: number, allPages: number, pageBufferSize: number) {
    let str = '';

    if (allPages <= 5 + pageBufferSize * 2) {
      for (let i = 1; i <= allPages; i++) {
          str = str + ' ' + i;
      }
    } else {
      let left = Math.max(1, current - pageBufferSize);
      let right = Math.min(current + pageBufferSize, allPages);
      
      if (current - 1 <= pageBufferSize) {
        right = 1 + pageBufferSize * 2;
      }

      if (allPages - current <= pageBufferSize) {
        left = allPages - pageBufferSize * 2;
      }

      for (let i = left; i <= right; i++) {
        str = str + ' ' + i;
      }

      if (current - 1 >= pageBufferSize * 2 && current !== 1 + 2) {
        str = '... ' + str;
      }

      if (allPages - current >= pageBufferSize * 2 && current !== allPages - 2) {
        str = str + ' ...';
      }

      if (left !== 1) {
        str = 1 + ' ' + str;
      }

      if (right !== allPages) {
        str = str + ' ' + allPages;
      }
    }

    return str.trim();
  }

  /**
   * 初始化相应的 分页函数
   * @param selector
   */
  private init (selector:any) {

  	// 分页器元素
    this.pageElement = this.$(selector)[0];

    // 数据总数
    this.total = this.options.total;
    // 当前页码
    this.current = this.options.current || this.options.defaultCurrent;
    // 一页显示多少数据
    this.pageSize = this.options.pageSize || this.options.defaultPageSize;
    // 总页数
    this.pageCount = Math.ceil(this.total / this.pageSize);

    // 渲染
    this.renderPages();

    // 改变页数并触发事件
    this.changePage();

    // this.changePageNew();

  }
}

const pagination = new Pagination('#pagination', {
  total: 500,
  // disabled: true,
  // showLessItems: true,
  // size: 'small',
  // showTotal: (total: any, range: any) => {
  //   return `${range[0]}-${range[1]} of ${total} items`;
  // },
  showSizeChanger: true,
  showQuickJumper: true,
  hideOnSinglePage: true,
  simple: false,
  onChange: (page: any, pageSize: any) => {
    console.log('---page---', page);
    console.log('---pageSize---', pageSize);
  },
  onShowSizeChange: (page: any, size: any) => {
    console.log('---page--11-', page);
    console.log('---size--11-', size);
  },
  // itemRender: (current: any, type: any, originalElement: any): any => {
  //   function createAEle (content: string) {
  //     let aEle = document.createElement("a");
  //     aEle.innerHTML = content;
  //     return aEle;
  //   }

  //   if (type === 'prev') {
  //     return createAEle('上一个');
  //   }

  //   if (type === 'next') {
  //     return createAEle('下一个');
  //   }

  //   if (type === 'page') {
  //     return createAEle(`第${current}只`);
  //   }

  //   return originalElement;
  // }
});

export default Pagination;