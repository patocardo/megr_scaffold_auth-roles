# [Work in progress] megr_scaffold_auth-roles
- Authorization and roles. With Mongo, ExpressJs, GraphQL, React in Typescript and MaterialUI
- This code is still in development **do not use yet**

## How to use it
1. Fork
2. Set-up the database. This code uses a free space at Mongo.Alive
3. Install back-end and front-end
4. Start back-end and front-end
5. Build upon it.

## TODOS
- Error logging and normalization
- Redaction of code conventions
- Development of automated tests
- Separate transpiling/buildings between environments

## Notes on aproaches

### Global reducer
Instead of Redux and MobX, Context + useReducer were used. I will keep this approach until a good argument in permormance or operativity emerges.
Regarding the scalabilty. `switch` was changed by a regular object with functions. Which is very easy to extend.

### Global async reducer
The starting point was use a serie of functions in a object named _consign_ and pass it with the context's value, toghether with state and dispatch.
Those functions where initialized with the dispatch, so in their use, it isn't required to send the dispacher function as an argument.
The solution was good enough to solve the async reducer problem. And much more easier than Redux-Thunk or Redux-Saga.
However, the custom-hook approach is more robust, less verbose and require less type-validation. So, this is the chosen.