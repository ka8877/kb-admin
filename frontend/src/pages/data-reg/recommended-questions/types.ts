export type RowItem = {
  no: number
  qst_id: string
  service_nm: string
  qst_ctnt: string
  parent_id:string | null
  parent_nm:string | null
  imp_start_date:string
  imp_end_date:string
  updatedAt: string
  registeredAt: string
  status: 'in_service'|'out_of_service'
}

