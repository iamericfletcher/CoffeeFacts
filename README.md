# Coffee Facts API

Welcome to Coffee Facts API! This project is for anyone looking to learn about interacting with APIs, creating routes,
or, for those who love coffee, that amazing energizing elixir, to borrow a term from [Boston Dynamic's Spot the Dog with
Nature Documentary personality](https://youtu.be/djzOBZUFzTw?si=7GcjxQoGOI_IjBnP&t=438). Whether you're into coding or
want to help the project grow by contributing to the codebase or high-quality facts and their sources by logging into
the site, you're in the right place!

## Tech Stack

- **Frontend**: HTML, CSS, JS, Axios
- **Backend**: Node.js with Express
- **Database**: SQLite3 - currently hosted on DigitalOcean Droplet
- **Authentication**: OAuth 2.0, express-oauth2-jwt-bearer

## Database Schema

### `coffee_facts` Table - PUBLIC ROUTE

| Column         | Data Type | Description                  |
|----------------|-----------|------------------------------|
| `id`           | INTEGER   | Auto-incremented primary key |
| `fact`         | TEXT      | The coffee fact text         |
| `source`       | TEXT      | Source of the fact           |
| `submitted_on` | DATETIME  | Timestamp of the submission  |

### `coffee_facts` Table - PRIVATE ROUTE

| Column         | Data Type | Description                  |
|----------------|-----------|------------------------------|
| `id`           | INTEGER   | Auto-incremented primary key |
| `fact`         | TEXT      | The coffee fact text         |
| `source`       | TEXT      | Source of the fact           |
| `submitted_on` | DATETIME  | Timestamp of the submission  |
| `user_id`      | TEXT      | Auth0 user sub identifier    |

## API

### Overview

Built with **Express**, **SQLite3**, **Auth0 JWT**, and **express-oauth2-jwt-bearer**. Security measures include JWT
checks on all routes except `/public`.

### CoffeeFactsDBAPI Endpoints (Backend)

#### `GET /public`

- Fetches all public coffee facts.
- 🛡️ No authentication needed

#### `GET /private`

- Fetches all facts, including private ones.
- 🛡️ JWT Check

#### Other CRUD Endpoints

- `POST /addFact`, `PUT /editFact/:id`, `DELETE /deleteFact/:id`
- 🛡️ JWT Check

### CoffeeFacts Endpoints (Frontend)

Built with Axios to communicate with the backend where the database interactions take place.

#### `GET /`

- Fetches a random coffee fact to display on the homepage.

#### `GET /userProfile`

- Shows user-specific coffee facts.
- 🛡️ Requires Auth

#### `GET /editFact/:id` & `POST /editFact/:id`

- Fetch and update a specific fact.
- 🛡️ Requires Auth

#### `POST /submit`

- Adds a new coffee fact.
- 🛡️ Requires Auth

#### `POST /deleteFact/:id`

- Deletes a specific coffee fact.
- 🛡️ Requires Auth

## Contributing

- Open issues or PRs anytime!
- Log in to the website to contribute new high-quality coffee facts and sources.

## References

- [Auth0](https://auth0.com)
- [OAuth2 JWT Bearer GitHub](https://github.com/auth0/express-oauth2-jwt-bearer)
