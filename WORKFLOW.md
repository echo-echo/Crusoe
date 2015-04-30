# Workflow

1. Pick a small thing to fix
2. Make a waffle for it, which will give a you an issue number
3. `git pull` to make sure you have the latest updates
4. Make a new branch with the topic then '#' then the issue number of your waffle (e.g `git checkout -b map#23`)
5. Once you've made your changes on your branch, commit them.
6. `git pull --rebase origin master`
7. If you have merge conflicts do `git mergetool --tool=opendiff` and resolve the merges, then run `git rebase --contine` and repeat #7
8. Once all the merges are resolved, push your branch to GitHub (e.g. `git push origin map#23`)
9. Make a pull request from your branch, and start it with "Closes [ISSUE_NUMBER]" (e.g. "Closes #23 - new messages are now included on map")
10. Someone else will review your pull request and merge it in or give you feedback to change before merging
