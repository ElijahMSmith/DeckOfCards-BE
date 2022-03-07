# DeckOfCards-BE

TODOS:

-   Better error handling for login/registration routes in particular, as needed by FE team.
-   Questions to answer:
    -   Is keeping a JWT array actually useful here?
    -   Are we allowed to keep JWTs and simply log in the users automatically with another GET route, as long as the JWT stored locally is valid?
        -   If this is valid, then seems like it's necessary.
        -   If the JWT is really just for one session and they need to log in every time, then it doesn't really make sense to keep.
