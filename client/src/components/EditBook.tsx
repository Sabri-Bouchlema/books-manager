import * as React from 'react'
import { Form, Button, Checkbox } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getBook, getUploadUrl, uploadFile, patchBook, createBook } from '../api/books-api'
import { History } from 'history'

enum SaveState {
  Nothing,
  FetchingPresignedUrl,
  UploadingFile,
  SavingBook
}

interface EditBookProps {
  match: {
    params: {
      bookId: string
    }
  }
  auth: Auth,
  history: History
}

interface EditBookState {
  name: string
  description: string
  published: boolean
  file: any
  saveState: SaveState
}

export class EditBook extends React.PureComponent<EditBookProps, EditBookState> {

  state: EditBookState = {
    name: "",
    description: "",
    published: false,
    file: undefined,
    saveState: SaveState.Nothing
  }


  async componentDidMount() {
    try {
      const bookId = this.props.match.params.bookId;
      if (bookId !== "undefined") {
        const book = await getBook(this.props.auth.getIdToken(), this.props.match.params.bookId)
        this.setState({
          name: book.name,
          description: book.description,
          published: book.published
        })
      }
    } catch (e) {
      alert(`Failed to fetch book: ${e.message}`)
    }
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: event.target.value
    })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      description: event.target.value
    })
  }

  handlePublishedChange = async () => {
    console.log("jasja")
    try {
      this.setState({
        published: !this.state.published
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      const book = {
        name: this.state.name,
        description: this.state.description,
        published: this.state.published
      }

      this.setSaveState(SaveState.SavingBook)

      let bookId = this.props.match.params.bookId;
      if (bookId !== "undefined") {
        await patchBook(this.props.auth.getIdToken(), bookId, book);
      } else {
        const newBook = await createBook(this.props.auth.getIdToken(), book);
        bookId = newBook.bookId;
      }

      await getUploadUrl(this.props.auth.getIdToken(), bookId)

      if (this.state.file) {
        this.setSaveState(SaveState.FetchingPresignedUrl)
        const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), bookId)

        this.setSaveState(SaveState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)
      }
      alert('Book was saved!')

      this.props.history.push(`/`)
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setSaveState(SaveState.Nothing)
    }
  }

  setSaveState(saveState: SaveState) {
    this.setState({
      saveState
    })
  }

  render() {
    return (
      <div>
        {this.props.match.params.bookId === "undefined" && <h1>Create new book</h1>}
        {this.props.match.params.bookId !== "undefined" && <h1>Update book</h1>}

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              value={this.state.name}
              type="text"
              placeholder="Book name"
              onChange={this.handleNameChange}
            />
          </Form.Field>


          <Form.Field>
            <label>Description</label>
            <textarea
              value={this.state.description}
              placeholder="Book description"
              onChange={this.handleDescriptionChange}
            ></textarea>
          </Form.Field>


          <Form.Field>
            <label>Published</label>
            <input
              type="checkbox" checked={this.state.published}
              onChange={this.handlePublishedChange}
            />
          </Form.Field>

          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.saveState === SaveState.SavingBook && <p>Saving book</p>}
        {this.state.saveState === SaveState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.saveState === SaveState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.saveState !== SaveState.Nothing}
          type="submit"
        >
          Save
        </Button>
      </div>
    )
  }
}
