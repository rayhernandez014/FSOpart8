import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = (props) => {
  if (!props.show) {
    return null
  }

  const result = useQuery(ALL_BOOKS, {
    variables: { genre: props.genre },
  })

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
          filter by genre
          <select onChange={e => props.setGenre(e.target.value)} value={props.genre}>
              {props.genres.map((g)=>{
                  return (
                      <option key={g} value={g}>{g}</option>
                  )
              })}
          </select>
      </div>
    </div>
  )
}

export default Books
