# Workflow patches

GitHub requires the `workflow` OAuth scope to add or change files under
`.github/workflows/`. The session that prepared this branch did not have
it, so the workflow file is provided here as a git patch instead.

Apply it from a checkout with normal credentials:

```sh
git am .patches/*.patch
git rm -r .patches
git commit -m "ci: remove applied workflow patches"
git push
```

| Patch | Adds |
| ----- | ---- |
| `0001-ci-add-the-build-workflow.patch` | `.github/workflows/build.yml`: continuous integration for pushes and pull requests on `master` and `main`, running `npm install`, `npm run build --if-present` and `npm test` on Node.js 24 (the default target) and 22 on ubuntu-latest. No npm cache, because no lockfile is tracked. It replaces the removed Travis CI configuration. |

The patch is a plain addition; `git apply --check .patches/*.patch`
verifies that it applies.
