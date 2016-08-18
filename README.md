
#Bill Gray's Back-End & Front-End REST Example#

##Back-End RESTful Note Server.

- This REST server was created using node.js and restify. You will need node.js installed to run the server. You can download it here: https://nodejs.org
- The server comes with 4 notes in its data already. 2 of the notes have the word milk in them for testing the query. See the curl commands below for testing.
- Blank notes are not allowed to be added, there must be a body with the note. If no body is found a 400 (Bad Request) error will be returned.
- The server is located at /api

###Configuration:
By default the note server listens on port 80.
To change this, edit the port number on line 17 of the api/noteServer.js file.

###Run the server:
node api/noteServer.js

###Some Tests using curl:
curl -i -H "Accept: application/json" -X GET http://localhost/api/notes
curl -i -H "Accept: application/json" -X GET http://localhost/api/notes?query=milk
curl -i -H "Accept: application/json" -X GET http://localhost/api/notes/2
curl -i -H "Accept: application/json" -X GET http://localhost/api/notes/99 (Returns a 404)
curl -i -H "Accept: application/json" -X POST -d '{"body" : "Pick up milk!"}' http://localhost/api/notes

##Front-End Angular GitHub Issues Web page

- This web app retrieves the last 7 days of issues from the GitHub Angular Repository.
- The page is responsive and will auto switch from two to one column of issues when medium or small.
- The issues are shown as Markdown, so you see the same formatting as on the GitHub site. 
- There is a button on the right side that will toggle the display between one and two columns manually.
- There is a button on the left that will toggle the collapsing of all the note's body text, so you can see more titles on the screen at one time.
- Each issue shows show it's lock status with a green unlocked or red locked icon.
- Each issue also has a GitHub icon on the right side of the issues header. Click it to go to the GitHub page for that issue.
- The Web App is located at web/

###Run the Web App
Load the web/index.html with a browser
   


