import React, { Component } from 'react';
import axios from 'axios';

import { GET_ORGANIZATION } from './queries';
import './App.css';
import Form from './components/Form';
import Organization from './components/Organization';

const TITLE = 'React GraphQL GitHub Client';

const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_TOKEN}`
  }
});

class App extends Component {

  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null
  };

  onChange = this.onChange.bind(this);

  componentDidMount () {
    this.onFetchFromGitHub();
  }

  onChange (event) {
    this.setState({ path: event.target.value })
  }

  onSubmit (event) {
    event.preventDefault();
  }

  onFetchFromGitHub () {
    axiosGitHubGraphQL
      .post('', { query: GET_ORGANIZATION})
      .then(result => {
        this.setState(() => ({
          organization: result.data.data.organization,
          errors: result.data.errors
        }))
      })
      .catch(err =>  console.log(err));
  }

  render() {
    const { path, organization, errors } = this.state;
    return (
      <div>
        <h1>{TITLE}</h1>
        <Form path={path}
              onChange={this.onChange}
              onSubmit={this.onSubmit}/>
        <hr/>
        {
          organization ? (
            <Organization organization={organization} errors={errors}/>
            ) : (
            <p>No information yet ...</p>
            )
        }
      </div>
    );
  }
}

export default App;
