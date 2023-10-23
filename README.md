# Coffee Facts API

A simple RESTful API that serves coffee facts and allows authenticated users to contribute new facts. Users can
authenticate via Gmail.

## TODO

- [ ] Add a frontend
    - [ ] In frontend, show one random fact from the DB for people to see
    - [ ] In frontend, add authentication
        - [ ] User profile page that lists the facts they've submitted
          - [ ] Add ability to delete facts
    - [ ] In frontend, add form to submit new facts for logged-in users
    - [ ] 
- [x] Add DB API to DigitalOcean droplet
    - Done - created separate repo for DB API endpoint

## Tech Stack

- Frontend: HTML, CSS, JS
- Backend: Node.js with Express
- Database: SQLite3
- Authentication: OAuth 2.0 (Gmail)

## Database Schema

### `coffee_facts` Table

| Column         | Data Type | Description                  |
|----------------|-----------|------------------------------|
| `id`           | INTEGER   | Auto-incremented primary key |
| `fact`         | TEXT      | The coffee fact text         |
| `source`       | TEXT      | Source of the fact           |
| `user_id`      | INTEGER   | ID of the user who added it  |
| `submitted_on` | DATETIME  | Timestamp of the submission  |

## Endpoints

- GET `/facts`: Fetch all coffee facts.
- POST `/facts`: Add a new coffee fact (Authenticated users only).

## Contributing

- Feel free to open issues or PRs!

## References
- [Auth0](https://auth0.com)
- [Add Authentication to Existing Node.js/Express Apps with Auth0 | Express and Auth Series Part 2](https://youtu.be/HTjfDUm1RsU?si=yv2VWos_LvcFiM9A)

