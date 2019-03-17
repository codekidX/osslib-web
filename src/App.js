import React, { Component } from "react"
import {
  Alert,
  Card,
  Form,
  Navbar,
  Button,
  Dropdown,
  DropdownButton,
  Col,
  Container,
  ListGroup,
  InputGroup,
  FormControl,
  Modal,
  Row
} from "react-bootstrap"
import "./App.css"

class App extends Component {
  inputName = ""
  projectPath = ""
  constructor(props) {
    super(props)
    /**
     * {
     *  name:"",
     * rawjson: {
     * link: "",
     * name: "",
     * readme: "",
     * lisence: ""
     * }
     * rawLinks: [all links]
     * }
     */
    let projects = localStorage.getItem("projects")
    let projectsData = localStorage.getItem("pd")
    let rawLinks = localStorage.getItem("rawlinks")

    if (projectsData == null) {
      let empty = {}
      localStorage.setItem("pd", JSON.stringify(empty))
      projectsData = empty
    }

    console.log("render is called")
    if (projects == null) {
      let empty = {}
      localStorage.setItem("projects", JSON.stringify(empty))
      projects = {}
    } else {
      projects = JSON.parse(projects)
    }

    if (rawLinks == null) {
      let empty = []
      localStorage.setItem("rawlinks", JSON.stringify(empty))
      rawLinks = []
    }

    this._ddItemClicked = this._ddItemClicked.bind(this)
    this._addClicked = this._addClicked.bind(this)
    this._copyJsonToClipboard = this._copyJsonToClipboard.bind(this)

    this.state = {
      projects,
      active: -1,
      activeNode: "",
      rawLinks,
      projectsData,
      uichild: [],
      showCreateDialog: false
    }
    if (this.state.projects.length === 0 || this.state.active === -1) {
      this.state.ddTitle = "Projects"
    } else {
      this.state.ddTitle = this.state.projects[this.state.active]
    }
  }

  _addLib(libUrl) {
    this.setState({ projectsData: this.projectsData.ad })
    localStorage.setItem("rawlinks", JSON.stringify(this.state.rawLinks))
    localStorage.setItem("pd", JSON.stringify(this.state.projectsData))
  }

  _ddItemClicked = (value, index) => {
    this.setState({
      active: index,
      activeNode: value,
      ddTitle: value
    })
  }

  _addClicked = () => {
    if (this.state.active < 0) {
      this.showErrorWith("Select or Create a new project")
      return
    }

    if (this.projectPath === "") {
      this.showErrorWith("Empty project path")
    } else {
      if (this.projectPath.split("/").length !== 2) {
        this.showErrorWith("Not a valid project path for githubs")
      } else {
        let exists = this.state.projects[this.state.activeNode].some(
          element => {
            return element.name === this.projectPath
          }
        )
        if (exists) {
          this.showErrorWith("Already using this library")
          return
        }
        this.addRepo(this.projectPath)
        this.projectPath = ""
      }
    }
  }

  showErrorWith(msg) {
    this.setState({
      uichild: [...this.state.uichild, msg]
    })

    setTimeout(() => {
      let cloneUiChild = this.state.uichild
      cloneUiChild.pop()
      this.setState({ uichild: cloneUiChild })
    }, 2000)
  }

  _dialogClose = () => {
    this.setState({ showCreateDialog: false })
  }

  _dialogShow = () => {
    this.setState({ showCreateDialog: true })
  }

  _copyJsonToClipboard = () => {
    var textField = document.createElement("textarea")
    textField.innerText = JSON.stringify(
      this.state.projects[this.state.activeNode],
      null,
      2
    )
    document.body.appendChild(textField)
    textField.select()
    document.execCommand("copy")
    textField.remove()
  }

  _createNameChanged = e => {
    this.inputName = e.target.value
  }

  _projectPathChanged = e => {
    this.projectPath = e.target.value
  }

  _onCreateClicked = () => {
    this._dialogClose()
    this.appendProject(this.inputName)
  }

  appendProject(name) {
    let projects = this.state.projects
    projects[
      name
        .trim()
        .replace(/\s/g, "")
        .toLowerCase()
    ] = []
    this.setState({ projects: projects })
    localStorage.setItem("projects", JSON.stringify(this.state.projects))
    this.inputName = ""
  }

  addRepo(path) {
    fetch("https://api.github.com/repos/" + path)
      .then(res => res.json())
      .then(info => this.saveRepo(info))
  }

  removeRepo(name) {
    let projects = this.state.projects
    let libs = projects[this.state.activeNode]
    projects[this.state.activeNode] = libs.filter(lib => lib.name !== name)
    this.setState({ projects: projects })
    localStorage.setItem("projects", JSON.stringify(projects))
  }

  saveRepo(ghinfo) {
    fetch(
      "https://raw.githubusercontent.com/" +
        ghinfo.full_name +
        "/master/README.md",
      {
        headers: { "content-type": "text/plain" }
      }
    ).then(async readme => {
      let txt = await readme.text()
      let lib = {
        name: ghinfo.full_name,
        description: ghinfo.description,
        creator: ghinfo.owner.login,
        license: ghinfo.license,
        readme: txt
      }

      let projects = this.state.projects
      projects[this.state.activeNode].push(lib)
      this.setState({ projects: projects })
      localStorage.setItem("projects", JSON.stringify(projects))
    })
  }

  render() {
    return (
      <div className="App" class="container-fluid">
        <Container>
          <Navbar className="bg-light justify-content-between">
            <Form inline>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text id="basic-addon1">
                    https://github.com/
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  placeholder="Project"
                  aria-label="Username"
                  aria-describedby="basic-addon1"
                  onChange={this._projectPathChanged}
                />
                &nbsp;
                <Button variant="success" onClick={this._addClicked}>
                  Add
                </Button>
                &nbsp;
                <Button variant="danger" onClick={this._addClicked}>
                  Remove
                </Button>
                &nbsp;
                <Button
                  variant="outline-primary"
                  onClick={() => this._dialogShow()}
                >
                  Create
                </Button>
              </InputGroup>
            </Form>
            <DropdownButton
              id="dropdown-basic-button"
              title={this.state.ddTitle}
              onClick={this._projectDropdownClicked}
            >
              {Object.keys(this.state.projects).map((e, i, array) => (
                <Dropdown.Item onSelect={() => this._ddItemClicked(e, i)}>
                  {e}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </Navbar>
          <br />
          {this.state.uichild.map((e, idx) => {
            return (
              <Alert dismissable="true" variant="danger">
                {e}
              </Alert>
            )
          })}
          &nbsp; &nbsp;
          {this.state.active >= 0 ? (
            <Card>
              <Button
                class="copy-button"
                variant="primary"
                onClick={this._copyJsonToClipboard}
              >
                Copy to clipboard
              </Button>
              <Card.Body>
                <ListGroup>
                  {this.state.projects[this.state.activeNode].map(e => {
                    return (
                      <ListGroup.Item>
                        <Row style={{ textAlign: "center" }}>
                          <Col>{e.name}</Col>
                          <Col>
                            <Button
                              variant="danger"
                              onClick={() => this.removeRepo(e.name)}
                            >
                              Delete Library
                            </Button>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    )
                  })}
                </ListGroup>
              </Card.Body>
            </Card>
          ) : (
            <p />
          )}
        </Container>

        <Modal show={this.state.showCreateDialog} onHide={this._dialogClose}>
          <Modal.Header closeButton>
            <Modal.Title>Create a new project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Create a new project so that you can save osslib.json for separate
            projects. This is saved in your machine locally.
            <br />
            <br />
            <FormControl
              placeholder="Project name"
              aria-label="Username"
              aria-describedby="basic-addon1"
              onChange={this._createNameChanged}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this._dialogClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this._onCreateClicked}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default App
