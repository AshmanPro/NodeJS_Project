# NodeJS_Project

This project was created 2 years before for NodeJS. 

This was an industry based project and was in development phase, 

# My Role and Responsibilities

My Role in this project was to work with the senior node developer and to create API's for front end mobile developers. 

- I have created a register API, which request the phone number from user and on the basis of PhoneNumber this sendVerificationCode API search the database, if that found, then it calls the third party to send a verification code as pin on the phone number. It will send the pin by creating a Token each time, and everytime a pin is created token was stored in the database. 

As this pin number was send through an SMS on your Phone, when you register. 

- For CodeVerification API, when user request the pincode, the API will search it in database and return a JSON of verified user and logged in. 

# Senior Dev Work

Now there was another requirement by the clients as the user cannot take any longer than 10minutes/{Anytime} to login. Hence the update token was used with time contraint, I haven't done that, that was done by senior developer.  

# Work Environment

For this project, team was using the following softwares, 

- Microsoft SQL Server
- WebStorm
- PostMan {API Testing}
