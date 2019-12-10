import { Pagination } from './types/index'
import { noop } from './helpers/utils'

const defaults: Pagination = {
  defaultCurrent: 1,

  defaultPageSize: 10,

  hideOnSinglePage: false,

  pageSizeOptions: ['10', '20', '30', '40'],

  showLessItems: false,

  showQuickJumper: false,

  showSizeChanger: false,

  size: '',

  total: 0,

  onChange: noop,

  onShowSizeChange: noop,
}