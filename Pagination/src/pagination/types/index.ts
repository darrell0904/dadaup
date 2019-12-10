// 一些配置参数
// 解释在 option.ts 上

export interface Pagination {
  current?: number

  defaultCurrent?: number

  defaultPageSize?: number

  disabled?: boolean

  hideOnSinglePage?: boolean

  itemRender?: (page: number, type: string, originalElement: HTMLElement) => HTMLElement

  pageSize?: number

  pageSizeOptions?: string[]

  showLessItems?: boolean

  showQuickJumper?: boolean

  showSizeChanger?: boolean

  showTotal?: (total: number, ranger: any) => any

  simple?: boolean

  size?: string

  total?: number

  onChange?: (page: number, pageSize: number) => void

  onShowSizeChange?: (current: number, size: number) => void

}