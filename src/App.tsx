import React, { useEffect } from 'react';
import './App.css';
import { UserContext } from './context/userContext';
import { IUser, ILoginUser } from './@types/user';
import PageContainer from './layout/Content';
import Fetch from './lib/fetch'
import Home from './pages/Home';
import BookDetails from './pages/BookDetail';
import About from './pages/About';
import Navbar from './layout/Navbar';
import { Routes, Route } from "react-router-dom";

function App() {

  const [loginUser, setLoginUser] = React.useState<ILoginUser | null>({ username: "luisarce", password: "123456" })
  const [user, setUser] = React.useState<IUser | null>(null)

  // fetch the data
  useEffect(() => {
    async function fetchData() {
      const fetcher: Fetch<IUser> = new Fetch<IUser>("auth")
      const userResponse = await fetcher.post(loginUser ? { ...loginUser } : null)
      setUser(userResponse)
    }

    fetchData()
  }, [])

  return (
    <div className="App">
      <Navbar />
      <UserContext.Provider value={user}>
        <PageContainer>
          <Routes>
            <Route path="/" element={<Home />} /> 
            <Route path="/home" element={<Home />} /> 
            <Route path="/detail/:bookId" element={<BookDetails />} /> 
            <Route path="/about" element={<About />} /> 
          </Routes>
        </PageContainer>
      </UserContext.Provider>
    </div>
  );
}

export default App;
