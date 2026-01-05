export type GridColumn = {
  dataField: string
  caption: string
  dataType?: 'string' | 'number' | 'date' | 'boolean' | 'object'
  format?: string
  cssClass?: string
  cellTemplate?: string
  hidingPriority?: number
}