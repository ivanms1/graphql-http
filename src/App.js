import React, { Component } from 'react';
import axios from 'axios';

import { GET_ISSUES_OF_REPOSITORY, ADD_START, REMOVE_STAR } from './queries';
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

const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split('/');

  return axiosGitHubGraphQL.post('', {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository, cursor }
  });
};

const resolveIssuesQuery = (queryResult, cursor) => state => {
  const { data, errors } = queryResult.data;

  if(!cursor) {
    return {
      organization: data.organization,
      errors: errors
    };
  }

  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;
  const updatedIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updatedIssues,
        },
      },
    },
    errors
  };
};

const addStarToRepository = repositoryId => {
  return axiosGitHubGraphQL.post('', {
    query: ADD_START,
    variables: { repositoryId }
  });
};

const removeStarToRepository = repositoryId => {
  return axiosGitHubGraphQL.post('', {
    query: REMOVE_STAR,
    variables: { repositoryId }
  });
};

const resolveAddStarMutation = mutationResult => state => {
  const {
    viewerHasStarred
  } = mutationResult.data.data.addStar.starrable;

  const { totalCount } = state.organization.repository.stargazers;

  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: totalCount + 1
        }
      }
    }
  }
}

const resolveRemoveStarMutation = mutationResult => state => {
  const {
    viewerHasStarred
  } = mutationResult.data.data.removeStar.starrable;

  const { totalCount } = state.organization.repository.stargazers;
  
  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount:  totalCount - 1
        }
      }
    }
  }  
}

class App extends Component {

  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null
  };

  onChange = this.onChange.bind(this);
  onSubmit = this.onSubmit.bind(this);
  onFetchMoreIssues = this.onFetchMoreIssues.bind(this);
  onStarRepository = this.onStarRepository.bind(this);

  componentDidMount () {
    this.onFetchFromGitHub(this.state.path);
  };

  onChange (event) {
    this.setState({ path: event.target.value })
  };

  onSubmit (event) {
    event.preventDefault();
    this.onFetchFromGitHub(this.state.path)
  };

  onFetchFromGitHub (path, cursor) {
    getIssuesOfRepository(path, cursor)
    .then(result => {
      this.setState(resolveIssuesQuery(result ,cursor))
    })
  };

  onFetchMoreIssues () {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;

    this.onFetchFromGitHub(this.state.path, endCursor)
  };

  onStarRepository (repositoryId, viewerHasStarred) {

    if(viewerHasStarred) {
      removeStarToRepository(repositoryId)
      .then(mutationResult => {
        this.setState(resolveRemoveStarMutation(mutationResult))
      }) 
    }

    addStarToRepository(repositoryId)
    .then(mutationResult => {
      this.setState(resolveAddStarMutation(mutationResult))
    })
  };

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
            <Organization
              organization={organization}
              errors={errors}
              onFetchMoreIssues={this.onFetchMoreIssues}
              onStarRepository={this.onStarRepository}/>
            ) : (
            <p>No information yet ...</p>
            )
        }
      </div>
    );
  }
}

export default App;
