import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import BirthyearForm from './BirthyearForm'

const Authors = (props) => {
  if (!props.show) {
    return null
  }

  const result = useQuery(ALL_AUTHORS)

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token &&
        <BirthyearForm setError={props.setError} authors={result.data.allAuthors}/>
      }
    </div>
  )
}

export default Authors
