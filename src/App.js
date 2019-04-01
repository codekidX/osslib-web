import React, { Component } from "react"
import ActionBar from "./ActionBar"
import {
  Alert,
  Card,
  Button,
  Col,
  Container,
  ListGroup,
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

    this._copyJsonToClipboard = this._copyJsonToClipboard.bind(this)
    // this.showAlertWith = this.showAlertWith.bind(this)
    this._ddItemClicked = this._ddItemClicked.bind(this)
    this._addClicked = this._addClicked.bind(this)

    this.state = {
      projects,
      active: -1,
      activeNode: "",
      rawLinks,
      projectsData,
      haslibs: false,
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

  showAlertWith(msg, type) {
    this.setState({
      uichild: [...this.state.uichild, { msg, type }]
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

  _addClicked = () => {
    if (this.state.active < 0) {
      this.showAlertWith("Select or Create a new project", "danger")
      return
    }

    if (this.projectPath === "") {
      this.showAlertWith("Empty project path", "danger")
    } else {
      if (this.projectPath.split("/").length !== 2) {
        this.showAlertWith("Not a valid project path for githubs", "danger")
      } else {
        let exists = this.state.projects[this.state.activeNode].some(
          element => {
            return element.name === this.projectPath
          }
        )
        if (exists) {
          this.showAlertWith("Already using this library", "danger")
          return
        }
        this.addRepo(this.projectPath)
        this.projectPath = ""
      }
    }
  }

  _ddItemClicked = (value, index) => {
    this.setState({
      active: index,
      activeNode: value,
      ddTitle: value
    })
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
    this.showAlertWith("Copied !", "info")
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
      .then(res => {
        if (res.status === 404) {
          return undefined
        }
        return res.json()
      })
      .then(info => {
        if (info === undefined) {
          this.showAlertWith("ERROR: Repository does not exist.", "danger")
          return
        }
        this.saveRepo(info)
      })
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
    ).then(async res => {
      let txt = res.status === 404 ? "" : await res.text()
      let licenseRes = await fetch(ghinfo.license.url)
      let licenseBody = await licenseRes.json()
      let lib = {
        name: ghinfo.full_name,
        description: ghinfo.description,
        creator: ghinfo.owner.login,
        license: ghinfo.license,
        readme: txt,
        license_exp: licenseBody.body
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
          <ActionBar
            _projectPathChanged={this._projectPathChanged}
            _dialogShow={this._dialogShow}
            _addClicked={this._addClicked}
            _ddItemClicked={this._ddItemClicked}
            active={this.state.active}
            projects={this.state.projects}
            ddTitle={this.state.ddTitle}
          />
          <br />
          {this.state.uichild.map((e, idx) => {
            return (
              <Alert dismissable="true" variant={e.type}>
                {e.msg}
              </Alert>
            )
          })}
          &nbsp; &nbsp;
          {this.state.active >= 0 ? (
            <Card>
              {this.state.projects[this.state.activeNode].length > 0 ? (
                <Button
                  class="copy-button"
                  variant="primary"
                  onClick={this._copyJsonToClipboard}
                >
                  Copy to clipboard
                </Button>
              ) : (
                <Button
                  class="copy-button"
                  variant="primary"
                  onClick={this._copyJsonToClipboard}
                  disabled
                >
                  Copy to clipboard
                </Button>
              )}

              <Card.Body>
                <ListGroup>
                  {this.state.projects[this.state.activeNode].map(e => {
                    let repoUrl = `https://github.com/${e.name}`
                    return (
                      <ListGroup.Item>
                        <Row style={{ textAlign: "center" }}>
                          <Col>
                            <a
                              rel="noopener noreferrer"
                              target="_blank"
                              href={repoUrl}
                            >
                              {e.name}
                            </a>
                          </Col>
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
