import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Recommendations = (props) => {
  if (!props.show || !props.favGenre) {
    return null
  }

    const result = useQuery(ALL_BOOKS,  {
        variables: { genre: props.favGenre },
    })

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre <b>{props.favGenre}</b>
      </p>

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
    </div>
  )
}

export default Recommendations
