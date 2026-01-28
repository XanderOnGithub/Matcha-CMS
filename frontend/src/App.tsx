import "./App.css"

import { useQuery } from '@tanstack/react-query'

function App() {

  const { data, isLoading, error } = useQuery({
      queryKey: ['hello-api'],
      queryFn: () => fetch('/api/hello').then(res => res.json())
    })

  return (
    <div className="">

      { isLoading && <p>Loading...</p>}
      
      {error && <p>Error: {(error as Error).message}</p>}

      {data && <p>Message from API: {data.message}</p>}


    </div>
  )
}

export default App
