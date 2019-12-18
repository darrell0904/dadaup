import './styles/index.less';
//  默认配置
import defaults from "./defaults";
import { PaginationConfig } from './types/index'
// import './fonts/iconfont.less';

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
      content: '',
      className: 'darrell-pagination-prev',
    },
    {
      id: 'next',
      content: '',
      className: 'darrell-pagination-next',
    },
    {
      id: 'jump-prev',
      content: '•••',
      className: 'darrell-pagination-jump-prev',
    },
    {
      id: 'jump-next',
      content: '•••',
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
  
        if (target.nodeName.toLocaleLowerCase() == "a") {
          if (target.id === "prev") {
            this.prevPage();
          } else if (target.id === "next") {
            this.nextPage();
          } else if (target.id === "jump-prev") {
            this.jumpPrevPage();
          } else if (target.id === "jump-next") {
            this.jumpNextPage();
          } else if (target.id === "page") {
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
   * 前一页
   */
  private prevPage () {
    this.current--;
  }

  /**
   * 后一页
   */
  private nextPage () {
    this.current++;
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
    const pageBufferSize = this.options.showLessItems ? 3 : 5;
    this.current = Math.max(1, this.current - pageBufferSize);
  }

  /**
   * 跳到省略号 后一批
   */
  private jumpNextPage () {
    const pageBufferSize = this.options.showLessItems ? 3 : 5;
    this.current = Math.min(this.pageCount, this.current + pageBufferSize);
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
   * 创建 Li 元素
   * @param liItemInfo 
   */
  private createLiHtml (liItemInfo: Array<any>) {
    let fragment = document.createDocumentFragment();

    let liEle = document.createElement("li");
    let aEle = document.createElement("a");
    let spanEle = document.createElement("span");

    const id = liItemInfo[0].id;
    const className = liItemInfo[0].className;
    const content = liItemInfo[0].content;

    const current = this.current;

    liEle.setAttribute('class', className);

    aEle.setAttribute('href', 'javascript:;');
    aEle.setAttribute('id', id);

    if (id === 'prev') {
      aEle.setAttribute('class', `iconfont icon-left ${Pagination.CLASS_NAME.LINK}`);
    } else if (id === 'next') {
      aEle.setAttribute('class', `iconfont icon-right ${Pagination.CLASS_NAME.LINK}`);
    } else if (id === 'jump-prev') {
      spanEle.setAttribute('class', `iconfont icon-shuangzuojiantou- ${Pagination.CLASS_NAME.ICONLINK}`);
      aEle.setAttribute('class', Pagination.CLASS_NAME.ELLIPSIS);
      liEle.appendChild(spanEle);
    } else if (id === 'jump-next') {
      spanEle.setAttribute('class', `iconfont icon-shuangyoujiantou- ${Pagination.CLASS_NAME.ICONLINK}`);
      aEle.setAttribute('class', Pagination.CLASS_NAME.ELLIPSIS);
      liEle.appendChild(spanEle);
    } else if (id === 'page') {
      if (current === parseInt(content, 10)) {
        Pagination.addClass(liEle, Pagination.CLASS_NAME.ITEM_ACTIVE);
      }

      aEle.setAttribute('class', Pagination.CLASS_NAME.LINK);
    }

    aEle.innerHTML = content;
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
    const isDisabled = this.options.disabled;
    const isSmall = this.options.size;

    const fragment = this.showPages();

    let UlEle = document.createElement("ul");
    UlEle.appendChild(fragment);

    UlEle.setAttribute('class', 'darrell-pagination');

    if (isDisabled) {
      Pagination.addClass(UlEle, 'darrell-pagination-disabled');
    }

    if (isSmall) {
      Pagination.addClass(UlEle, 'mini');
    }

    this.pageElement.appendChild(UlEle);
  }

  /**
   * 循环渲染相应的 Li 元素
   * @param begin 
   * @param end 
   */
  renderDom (begin: number, end: number) {
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

  }
}

const pagination = new Pagination('#pagination', {
  total: 500,
  // disabled: true,
  // showLessItems: true,
  // size: 'small',
  onChange: (page: any, pageSize: any) => {
    console.log('---page---', page);
    console.log('---pageSize---', pageSize);
  }
});

export default Pagination;