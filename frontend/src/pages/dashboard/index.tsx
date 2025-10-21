import { useQuery } from '@tanstack/react-query'
import { Button, Stack, Typography, Card, CardContent, Divider } from '@mui/material'
import { useCounterStore } from '../../store/counter'
import { helloApi } from '../../api'
import PageHeader from '../../components/common/PageHeader'
import Loading from '../../components/common/Loading'
import ErrorMessage from '../../components/common/ErrorMessage'

const DashboardPage: React.FC = () => {
  const { count, inc, reset } = useCounterStore()
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['hello'],
    queryFn: helloApi.getHello,
  })

  return (
    <Stack spacing={3}>
      <PageHeader title="대시보드" />

      <Card>
        <CardContent>
          <Typography variant="h6">React Query example</Typography>
          <Divider sx={{ my: 2 }} />
          {isLoading ? (
            <Loading />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <Typography>API says: {data?.message}</Typography>
          )}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Zustand counter</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ mb: 2 }}>Count: {count}</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => reset()}>Reset</Button>
            <Button variant="contained" onClick={() => inc()}>+1</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default DashboardPage
