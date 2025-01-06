import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_BOOKS, CREATE_BOOK, ALL_AUTHORS } from '../queries'
import { updateCache } from '../App'
import { useApolloClient } from '@apollo/client'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const client = useApolloClient()

  const [ createBook ] = useMutation(CREATE_BOOK, {
    refetchQueries: [
        {query: ALL_AUTHORS},
    ],
    onError: (error) => {      
      const messages = error.graphQLErrors.map(e => e.message).join('\n')      
      props.setError(messages)    
    },
    update: (cache, response) => {    
      const genre_list = [...response.data.addBook.genres, 'all genres']
      genre_list.forEach((g) => {
        updateCache(cache, { query: ALL_BOOKS, variables: {genre: g} }, response.data.addBook, client)
      })   
    },
  })

  const submit = async (event) => {
    event.preventDefault()

    createBook({ variables: { title, published: parseInt(published), author, genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook