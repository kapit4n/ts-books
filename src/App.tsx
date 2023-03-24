import React, { useEffect } from 'react';
import './App.css';
import { UserContext } from './context/userContext';
import { IUser, ILoginUser } from './@types/user';
import PageContainer from './layout/PageContainer';
import Fetch from './lib/fetch'
import { AxiosResponse } from 'axios'

function App() {

  const [loginUser, setLoginUser] = React.useState<ILoginUser | null>({ username: "luisarce", password: "123456" })
  const [user, setUser] = React.useState<IUser | null>(null)

  // fetch the data
  useEffect(() => {
    async function fetchData() {
      const fetcher: Fetch<IUser> = new Fetch<IUser>()
      const userResponse = await fetcher.post("auth", loginUser ? {...loginUser}: null)
      setUser(userResponse)
    }

    fetchData()
  }, [])

  return (
    <div className="App">
      <UserContext.Provider value={user}>
        <PageContainer />
      </UserContext.Provider>
    </div>
  );
}

export default App;
