import './index.less';

class Pagination {

	constructor(selector, options = {}) {
    // 默认配置
    this.options = {
      curr: 1, // 当前页面
      pageShow: 2, // 当前页码面前后最多显示页码数
      ellipsis: true, // 是否出现省略号
      hash: false, // 是否 hash
    };
    Object.assign(this.options, options);
    this.init(selector);
  }

  static getClassName() {
  	return {
	    ITEM: 'pagination-item',
	    LINK: 'pagination-link',
	  };
  }

  // 模仿jQuery $()
  $(selector, context) {
    context = arguments.length > 1 ? context : document;
    return context ? context.querySelectorAll(selector) : null;
  }

  addFragmentAfter (fragment, datas) {
    fragment.appendChild(this.createHtml(datas));
  }

  createHtml (curpage) {
    let fragment = document.createDocumentFragment();
    let liEle = document.createElement("li");
    let aEle = document.createElement("a");

    liEle.setAttribute("class", Pagination.getClassName().ITEM);
    aEle.setAttribute("href", "javascript:;");
    aEle.setAttribute("id", 'id-' + curpage);

    aEle.setAttribute("class", Pagination.getClassName().LINK);

    aEle.innerHTML = curpage;
    liEle.appendChild(aEle);

    fragment.appendChild(liEle);

    console.log('---fragment---', fragment);

    return fragment;
  }

  init (selector) {
  	// 分页器元素
    this.pageElement = this.$(selector)[0];

    let fragment = document.createDocumentFragment();

    for(var i = 0; i < 5; i++) {
    	fragment.appendChild(this.createHtml(i));
    }

    this.pageElement.innerHTML = "";

    this.pageElement.appendChild(fragment);

  }
}

const pagination = new Pagination('#pagination', {});



// export default Pagination;