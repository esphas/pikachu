
'use strict';

const axios = require('axios');

/**
 * Pikachu
 */
class Pikachu {

  constructor() {
  }

  async launch() {
  }

  displayErrors(errors) {
    console.error(errors[0].message);
  }

  /**
   * Wrapper for GitHub GraphQL API
   * @returns {Promise<Response>}
   */
  graphql(options) {
    let { token, query } = options;
    if (token == null || query == null) {
      throw "Insufficient Arguments";
    }
    return axios.post('https://api.github.com/graphql', { query }, {
      headers: {
        // NOTE: for experimental api createIssue
        // https://developer.github.com/v4/mutation/createissue/
        "Accept": "application/vnd.github.starfire-preview+json",
        "Authorization": `bearer ${token}`
      }
    });
  }

  /**
   * @private
   */
  async createIssue(options) {
    let { token, repositoryId, body } = options;
    // NOTE: createIssue is an unstable api
    // https://developer.github.com/v4/mutation/createissue/
    let data = await this.graphql({ token,
      query: `mutation {
        createIssue(input: {
          title: "Pikachu",
          repositoryId: "${repositoryId}",
          body: "${body}"
        }) {
          issue {
            id
          }
        }
      }`
    });
    return data.data.data.issue.id;
  }

  /**
   * @private
   */
  async addComment(options) {
    let { token, subjectId, body } = options;
    await this.graphql({ token,
      query: `mutation {
        addComment(input: {
          subjectId: "${subjectId}",
          body: "${body}"
        }) {
          subject {
            id
          }
        }
      }`
    });
  }

  /**
   * @private
   */
  async postBody(options) {
    let { token, owner, repo, issue, body } = options;
    await this.graphql({ token,
      query: `query {
        repository(name: "${repo}", owner: "${owner}") {
          id
        }
      }`
    }).then(async (response) => {
      let data = response.data;
      if (data.errors) {
        this.displayErrors(data.errors);
        return;
      }
      let repositoryId = data.data.repository.id;
      if (issue == null) {
        await this.createIssue({ token, repositoryId, body });
      } else {
        await this.graphql({ token,
          query: `query {
            repository(name: "${repo}", owner: "${owner}") {
              issue(number: ${issue}) {
                id
              }
            }
          }`
        }).then(async (response) => {
          let data = response.data;
          if (data.errors) {
            this.displayErrors(data.errors);
            return;
          }
          let subjectId = data.data.repository.issue.id;
          await this.addComment({ token, subjectId, body });
        });
      }
    });
  }

  async uploadImage(options) {
    let { image } = options;
    // TODO
    return "";
  }

  /**
   */
  async postImage(options) {
    let url = await this.uploadImage(options.image);
    if (url === "") {
      return false;
    }
    options.body = `![](${url})`;
    await this.postBody(options);
    return true;
  }

}

module.exports = Pikachu;
