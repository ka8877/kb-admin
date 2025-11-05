import type { GridColDef } from '@mui/x-data-grid'
import type { RowItem } from '../../types'

export const listColumns: GridColDef<RowItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'qst_id', headerName: '질문아이디', width: 120 },
  { field: 'service_nm', headerName: '서비스명', flex: 1, minWidth: 140 },
  { field: 'qst_ctnt', headerName: '질문내용', flex: 2, minWidth: 300 },
  { field: 'parent_id', headerName: '부모아이디', width: 140 },
  { field: 'parent_nm', headerName: '부모아이디명', flex: 1, minWidth: 160 },
  { field: 'imp_start_date', headerName: '노출시작일시', width: 180 },
  { field: 'imp_end_date', headerName: '노출종료일시', width: 180 },
  { field: 'updatedAt', headerName: '마지막수정일시', width: 180 },
  { field: 'registeredAt', headerName: '반영일시', width: 180 },
  { field: 'status', headerName: '데이터등록반영상태', width: 140 },
]


