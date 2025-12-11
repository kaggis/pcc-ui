import { BrowserRouter,  Route, Routes } from 'react-router-dom'
import '@/App.css'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Footer from '@/components/Footer'
import Domains from '@/pages/Domains'
import Services from '@/pages/Services'
import Providers from '@/pages/Providers'
import PrefixDetails from '@/pages/Prefixes/PrefixDetails'
import { Prefixes } from '@/pages/Prefixes/Prefixes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PrefixEdit from '@/pages/Prefixes/PrefixEdit'
import { AuthProvider } from '@/auth/AuthProvider'
import PrefixLookup from '@/pages/Prefixes/PrefixLookup'
import Home from '@/pages/Home'
import PrefixEditStats from '@/pages/Prefixes/PrefixEditStats'
import AuthProtected from './routing/AuthProtected'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (
          error?.message?.includes('401') ||
          error?.message?.includes('Unauthorized')
        ) {
          return false
        }
        return failureCount < 3
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
})


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/">
        <AuthProvider>
          <div className="App">
            <div className="shadow-lg">
              <Header></Header>
            </div>
            <div className="flex flex-row gap-4">
              <div className="w-64 bg-[rgb(248,249,250)]">
                <Sidebar />
              </div>
              <div id="main" className="flex-1 p-4">
                <Routes>

                  <Route path="/" element={<Home />} />
                  <Route path="/prefixes" element={<AuthProtected><Prefixes /></AuthProtected>} />
                  <Route path="/prefixes/add" element={<AuthProtected><PrefixEdit /></AuthProtected>} />
                  <Route path="/domains" element={<AuthProtected><Domains /></AuthProtected>} />
                  <Route path="/services" element={<AuthProtected><Services /></AuthProtected>} />
                  <Route path="/providers" element={<AuthProtected><Providers /></AuthProtected>} />
                  <Route
                    path="/prefixes/:id"
                    element={<AuthProtected><PrefixDetails toDelete={false} /></AuthProtected>}
                  />
                  <Route
                    path="/prefixes/:id/delete"
                    element={<AuthProtected><PrefixDetails toDelete={true} /></AuthProtected>}
                  />

                  <Route path="/prefixes/:id/update" element={<AuthProtected><PrefixEdit /></AuthProtected>} />
                  <Route
                    path="/prefixes/editstatistics/:id"
                    element={<AuthProtected><PrefixEditStats /></AuthProtected>}
                  />
                  <Route
                    path="/lookup"
                    element={<AuthProtected><PrefixLookup /></AuthProtected>}
                  />

                </Routes>
              </div>
            </div>
            <div>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
