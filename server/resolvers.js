const { GraphQLError } = require('graphql')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
      bookCount: async () => await Book.collection.countDocuments(),
      authorCount: async () => await Author.collection.countDocuments(),
      allBooks: async (root, args) => {
  
        if(args.author){
          const book_list = await Book.find().populate('author')
          return [...book_list].filter((b)=>b.author.name === args.author)
        }
          
        if(args.genre && args.genre !== 'all genres'){
          return await Book.find({ genres: args.genre }).populate('author')
        }
          
        return await Book.find({}).populate('author')
      },
      allAuthors: async () => {
        console.log('author.find')
        const author_list = await Author.find({})
        
        const book_list = await Book.find().populate('author')
        console.log('book.find')

        author_list.forEach(a => {
          let count = 0
          book_list.forEach(book => {
            if(book.author.name === a.name){
              count++
            }
          });
          a.bookCount = count
        })

        return author_list
        
      },
      me: (root, args, context) => {
        return context.currentUser
      }
    },
    /*
    Author: {
      bookCount: async ({name}) => {
        let count = 0
        const book_list = await Book.find().populate('author')
        console.log('book.find')
        book_list.forEach(book => {
          if(book.author.name === name){
            count++
          }
        });
        return count
      }
    },
    */
    Mutation: {
      addBook: async (root, args, context) => {
  
        const currentUser = context.currentUser
  
          if (!currentUser) {        
            throw new GraphQLError('not authenticated', {          
              extensions: {            
                code: 'BAD_USER_INPUT',          
              }        
            })      
          }
  
        const authorExists = await Author.exists({name: args.author})
  
        let author
        
        if( !authorExists ){
          author = new Author({ name: args.author })
          try {
            await author.save()
          }
          catch (error) {
            throw new GraphQLError('Saving Author failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.name,
                error
              }
            })
          }
        }
        else{
          author = await Author.findOne({name: args.author})
        }
  
        const book = new Book({ ...args, author: author._id })
        try {
          await book.save()
        }
        catch (error) {
          throw new GraphQLError('Saving Book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
        
        pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author', {name: 1}) })

        return book.populate('author', {name: 1})
      },
      editAuthor: async (root, args, context) => {
  
        const currentUser = context.currentUser
  
          if (!currentUser) {        
            throw new GraphQLError('not authenticated', {          
              extensions: {            
                code: 'BAD_USER_INPUT',          
              }        
            })      
          }
  
        const author = await Author.findOne({ name: args.name })
        
        author.born = args.setBornTo
        
        try {
          await author.save()
        }
        catch (error) {
          throw new GraphQLError('Saving Author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
        return author
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
    
        return user.save()
          .catch(error => {
            throw new GraphQLError('Creating the user failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.username,
                error
              }
            })
          })
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
    
        if ( !user || args.password !== 'secret' ) {
          throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })        
        }
    
        const userForToken = {
          username: user.username,
          id: user._id,
        }
    
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
      },
    },
    Subscription: {
      bookAdded: {
        subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
      },
    },
}

module.exports = resolvers