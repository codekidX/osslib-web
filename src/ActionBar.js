import { React, Component } from "react"
import {
  Form,
  Navbar,
  Button,
  Dropdown,
  DropdownButton,
  InputGroup,
  FormControl
} from "react-bootstrap"

export class ActionBar extends Component {
  render() {
    return (
      <div className="ActionBar">
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
              &nbsp; &nbsp;
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
      </div>
    )
  }
}
