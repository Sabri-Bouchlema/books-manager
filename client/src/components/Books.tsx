import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Label,
  Loader
} from 'semantic-ui-react'

import { deleteBook, getBooks } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookName: string
  loadingBooks: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: '',
    loadingBooks: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value })
  }

  onEditButtonClick = (bookId?: string) => {
    this.props.history.push(`/books/${bookId}/edit`)
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId != bookId)
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingBooks: false
      })
    } catch (e) {
      alert(`Failed to fetch books: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Books</Header>

        {this.renderCreateBookInput()}

        {this.renderBooks()}
      </div>
    )
  }

  renderCreateBookInput() {
    return (
      <Grid.Row>

        <Grid.Column width={16}>

          <Button
            icon
            color="blue"
            onClick={() => this.onEditButtonClick()}
          >
            <Icon name="add" />
          </Button>

        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Books
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        {this.state.books.map((book) => {
          return (
            <Grid.Row key={book.bookId}>
              <Grid.Column width={4} verticalAlign="middle">
                <Grid.Row >
                  {book.published === true && <Label> <Icon name='check' /> Published </Label>}
                  {book.published === false && <Label>💡 Writing </Label>}
                </Grid.Row>
                <Grid.Row >
                  {book.attachmentUrl && (
                    <Image src={book.attachmentUrl} size="small" wrapped />
                  )}
                </Grid.Row>
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                <Grid.Row >
                  <b>{book.name}</b>
                </Grid.Row>

                <Grid.Row >
                  {book.description}
                </Grid.Row>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBookDelete(book.bookId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
