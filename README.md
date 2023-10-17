# Blocky
> A webserver for my portfolio / demo website. Also used to test out new technologies and coding fun.

## Installing

The frontend uses package(s) from the GitHub package registry.
Unfortunately at the time of writing, all packages hosted on GH require an authentication token to install.

For the project to compile successfully, you'll need to:

1. Create a personal access token with the `read:packages` scope.

2. Add the GitHub package registry to your `./.npmrc` file, replacing `GH_PAT` with your personal access token and `GITHUB_USERNAME` with your GitHub username:

```
//npm.pkg.github.com/:_authToken=GH_PAT
@GITHUB_USERNAME:registry=https://npm.pkg.github.com
```
