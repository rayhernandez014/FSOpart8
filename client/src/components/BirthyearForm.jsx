import { useQuery } from '@apollo/client'
import { EDIT_AUTHOR, ALL_AUTHORS} from '../queries'
import { useState } from 'react'
import { useMutation } from '@apollo/client'

const BirthyearForm = ({setError, authors}) => {

    const [name, setName] = useState('Robert Martin')
    const [year, setYear] = useState('')

    const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
        refetchQueries: [
            {query: ALL_AUTHORS},
        ],
        onError: (error) => {      
          const messages = error.graphQLErrors.map(e => e.message).join('\n')      
          setError(messages)    
        }  
      })

    const submit = async (event) => {
        event.preventDefault()

        editAuthor({ variables: { name, year: parseInt(year) } })

        setName('')
        setYear('')
    }

  return (
    <div>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>
            <div>
                name
                <select onChange={e => setName(e.target.value)}>
                    {authors.map((a)=>{
                        return (
                            <option key={a.name} value={a.name}>{a.name}</option>
                        )
                    })}
                </select>
            </div>
            <div>
                born
                <input
                    type="number"
                    value={year}
                    onChange={({ target }) => setYear(target.value)}
                />
            </div>
            <button type="submit">update author</button>
        </form>
    </div>
  )
}

export default BirthyearForm
