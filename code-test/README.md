# Node.js Coding Test - Feed Processing

# Intro

On a day-to-day basis Oddschecker processes millions of odds updates from over a hundred bookmaker feed providers. These feeds come in all kinds of formats and can sometimes be incomplete or badly structured. The challenge we face is consistently consuming all of these feeds and aggregating them into a standardised format that we can use to power our websites and apps.

To get a feel for what we do we'd like you to build two small RESTful services that can take an exmaple feed, transform its contents and replace the relevant terms with standard synonyms that we use.

**For this test there is no set time limit and you may pull in any external modules that you require to complete the test.**

Your code will be judged on a number of factors:
- **Code Quality**: Best practices, Use of up-to-date language features, reusability.
- **Latency/Throughput**: Your code will be load tested with concurrent requests to validate that latency and throughput remain relatively stable.

## Resources Provided:
- **oddschecker-schema.json**: A basic schema we map all bookmaker data to.
- **bookmaker-feed.json**: A bookmaker data feed to be mapped.
- **oddschecker.json**: An empty file to which you should write your mapped data.
- **synonyms.json**: A collection of synonyms to be used for mapping data.

## Oddschecker Schema Explained:
- **Category**: Any kind of sport.
- **Event**: Any kind of competition or league.
- **Subevent**: Any kind of match, race or game.
- **Market**: A grouping of bets following a similar theme that someone may wish to bet on (e.g. Game winner, First goalscorer, Final match score).
- **Bet**: Any kind of outcome avaialble to bet on within a market (e.g. player x will be first to score, final score will be 2-1).


# Task 1 - Synonyms
Create a RESTful service that exposes functionality to query the synonym data-set with a term and receive the standard Oddschecker name for that type of entity.

- The service should return the contents of the `oddschecker_keyword` field.
- The synonyms are grouped by `type` to define what they should be used for.

#### Constraints
- You cannot change the contents or structure of the `synonyms.json` file.

# Task 2 - Odds
Create a RESTful service that transforms the `bookmaker-feed` data into the
`oddschecker-schema` format and writes the result to the `oddschecker.json` file on start-up.

- You will notice that the bookmaker data is missing ID fields at certain levels. Due to the large number of feeds we process at Oddschecker it is not uncommon for us to receive varying levels of quality in the data we work with. To enable you to build the endpoints described below you will need to patch the data with your own unique IDs when the data is processed.

#### Constraints:
- All names in the output format should be standardized by making calls to the synonyms service created in task one to retrieve the standard Oddschecker name for that entity.
- You cannot change the contents or structure of the `bookmaker-feed.json` file.
- Each of the api endpoints listed below should be implemented.
- Each of the api endpoints listed below should be able to accept one or many ids of that type (e.g. many bet IDs) in a comma separated list.

#### API Spec:
- GET /api/events/:event_id
- GET /api/subevents/:subevent_id
- GET /api/markets/:market_id
- GET /api/bets/:bet_id

