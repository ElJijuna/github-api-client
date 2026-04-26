import { GitHubClient } from '../dist/index.js';

const gh = new GitHubClient();

async function test() {
  const owner = 'ElJijuna';
  const repository = 'gnome-ui';
  // List repositories for a user (https://docs.github.com/rest/repos/repos#list-repositories-for-a-user)
  const repos = await gh.user(owner).repos();
  repos.values.forEach(({ name }) => { 
    console.log('repo name: ', name);
  });
  console.log('total repos: ', repos.totalCount);

  // Get a repository (https://docs.github.com/rest/repos/repos#get-a-repository)
  const repo = await gh.repo(owner, repository).get();
  console.log('repo description: ', repo.description);
  console.log('repo stars: ', repo.stargazerCount);

  // List issues in a repository (https://docs.github.com/rest/issues/issues#list-repository-issues)
  const issues = await gh.repo(owner, repository).issues();
  issues.values.forEach(({ title }) => {
    console.log('issue title: ', title);
  });

   // Get an issue (https://docs.github.com/rest/issues/issues#get-an-issue)
   const issue = await gh.repo(owner, repository).issue(1).get();
   console.log('issue title: ', issue.title);

    // List pull requests in a repository (https://docs.github.com/rest/pulls/pulls#list-pull-requests)
    const pulls = await gh.repo(owner, repository).pullRequests();
    pulls.values.forEach(({ title }) => {
      console.log('pull request title: ', title);
    });

     // Get a pull request (https://docs.github.com/rest/pulls/pulls#get-a-pull-request)
     const pull = await gh.repo(owner, repository).pullRequest(1).get();
     console.log('pull request title: ', pull.title);

     // List commits in a repository (https://docs.github.com/rest/commits/commits#list-commits)
     const commits = await gh.repo(owner, repository).commits();
     commits.values.forEach(({ commit }) => {
       console.log('commit message: ', commit.message);
     });

      // Get a commit (https://docs.github.com/rest/commits/commits#get-a-commit)
      const commit = await gh.repo(owner, repository).commit('HEAD').get();
      console.log('commit message: ', commit.commit.message);

      // List public events for a user (https://docs.github.com/rest/activity/events#list-public-events-for-a-user)
      const events = await gh.user(owner).publicEvents({ per_page: 5 });
      events.values.forEach(({ type, created_at }) => {
        console.log('event type: ', type, '| date: ', created_at);
      });
      console.log('total events fetched: ', events.values.length);
}

test().catch(console.error);