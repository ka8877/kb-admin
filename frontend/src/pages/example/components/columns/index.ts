import type { GridColDef } from '@mui/x-data-grid'
import type { ExampleItem } from '../../../../types/example'

export const exampleColumns: GridColDef<ExampleItem>[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: '이름', flex: 1, minWidth: 120 },
  { field: 'email', headerName: '이메일', flex: 1, minWidth: 180 },
  { field: 'status', headerName: '상태', width: 140 },
  { field: 'createdAt', headerName: '생성시각', flex: 1, minWidth: 200 },
]
