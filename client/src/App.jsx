import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Notify from "./components/Notify";
import { useApolloClient } from '@apollo/client'
import LoginForm from "./components/LoginForm";
import Recommendations from "./components/Recommendations";
import { useQuery, useSubscription, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED, ME } from './queries'

// function that takes care of manipulating cache
export const updateCache = async (cache, query, addedBook, client) => {  
  // helper that is used to eliminate saving same book twice  
  const uniqByTitle = (a) => {    
    let seen = new Set()    
    return a.filter((item) => {      
      let k = item.title     
      return seen.has(k) ? false : seen.add(k)    
    })  
  }
  const data = cache.readQuery(query);

    if(data){
      cache.writeQuery({
        ...query,
        data: {
          allBooks: uniqByTitle([...data.allBooks, addedBook]),
        },
      });
    }
    else{
      client.query(query)
    }
    
}

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const result = useQuery(ME)

  const [filterGenre, setFilterGenre] = useState('all genres')
  const genreOptions = ['refactoring', 'agile', 'patterns', 'design', 'crime', 'classic', 'all genres']

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      notify(`${addedBook.title} added`)
      const genre_list = [...addedBook.genres, 'all genres']
      genre_list.forEach((g) => {
        updateCache(client.cache, { query: ALL_BOOKS, variables: {genre: g} }, addedBook, client)
      })
    },
  })

  useEffect(()=>{
    const savedToken = localStorage.getItem('books-user-token')
    if(savedToken){
      setToken(savedToken)
    }
  },[])

  const notify = (message) => {    
    setErrorMessage(message)    
    setTimeout(() => {      
      setErrorMessage(null)    
    }, 10000)  
  }

  const logout = () => {    
    setToken(null)    
    localStorage.clear()    
    client.resetStore()  
    setPage("authors")
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ?
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommendations")}>recommendations</button>
            <button onClick={logout}>logout</button>
          </>
          :
          <button onClick={() => setPage("login")}>login</button>
        }
      </div>
      
      <Notify errorMessage={errorMessage} />

      <Authors show={page === "authors"} setError={notify} token={token}/>

      <Books show={page === "books"} setError={notify} genre={filterGenre} genres={genreOptions} setGenre={setFilterGenre}/>

      <NewBook show={page === "add"} setError={notify} filterGenre={filterGenre}/>

      <LoginForm show={page === "login"} setToken={setToken} setError={notify} setPage={setPage}/>

      <Recommendations show={page === "recommendations"} favGenre={result?.data?.me?.favoriteGenre}/>
    </div>
  );
};

export default App;
