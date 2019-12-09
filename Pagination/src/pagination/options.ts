const noop = () => {}

export default {
  /**
   * 当前页数
   * number
   */
  current: 1,

  /**
   * 默认的当前页数
   * number
   */
  defaultCurrent: 1,

  /**
   * 默认的每页条数
   * number
   */
  defaultPageSize: 10,

  /**
   * 禁用分页
   * boolean
   */
  disabled: false,

  /**
   * 只有一页时是否隐藏分页器
   * boolean
   */
  hideOnSinglePage: false,

  /**
   * 用于自定义页码的结构，可用于优化 SEO
   * (page, type: 'page' | 'prev' | 'next', originalElement) => element
   */
  itemRender: '',

  /**
   * 每条页数
   * number
   */
  pageSize: 10,

  /**
   * 指定每页可以显示多少条
   * string[]
   */
  pageSizeOptions: ['10', '20', '30', '40'],

  /**
   * show less page items
   * boolean
   */
  showLessItems: false,

  /**
   * 是否可以快速跳转至某页
   * boolean | { goButton: ReactNode }
   */
  showQuickJumper: false,

  /**
   * 是否可以改变 pageSize
   * boolean
   */
  showSizeChanger: false,

  /**
   * 用于显示数据总量和当前数据顺序
   * Function(total, range)
   */
  showTotal: noop,

  /**
   * 当添加该属性时，显示为简单分页
   * boolean
   */
  simple: false,

  /**
   * 当为「small」时，是小尺寸分页
   * string
   */
  size: '',

  /**
   * 数据总数
   * number
   */
  total: 0,

  /**
   * 页码改变的回调，参数是改变后的页码及每页条数
   * Function(page, pageSize)
   */
  onChange: noop,

  /**
   * pageSize 变化的回调
   * Function(current, size)
   */
  onShowSizeChange: noop,

}