/**
 * Copyright (c) 2016 GrokSoft LLC - All Rights Reserved
 *
 * REST Note Server
 *
 * Test with:
 *      curl -i -H "Accept: application/json" -X GET http://localhost/api/notes
 *      curl -i -H "Accept: application/json" -X GET http://localhost/api/notes?query=milk
 *      curl -i -H "Accept: application/json" -X GET http://localhost/api/notes/2
 *      curl -i -H "Accept: application/json" -X GET http://localhost/api/notes/99 (Returns a 404)
 *      curl -i -H "Accept: application/json" -X POST -d '{"body" : "Pick up milk!"}' http://localhost/api/notes
 */
'use strict';

/**
 * note server
 */
(function () {
    var PORT      = 80; // Port to listen on
    var restify   = require('restify'); // Load the restify framework
    var fs        = require('fs'); // The file system
    var notesFile = "notes.json"; // The file to save the notes in

    /**
     * note data
     *
     * Some default data.
     * If the notes.json file exists, this data will be over written by the data in the file.
     */
    var notes  = [
        {
            "id"  : 1,
            "body": "This is note # 1"
        },
        {
            "id"  : 2,
            "body": "Note # 2 with a query of milk"
        },
        {
            "id"  : 3,
            "body": "Note # 3"
        },
        {
            "id"  : 4,
            "body": "Note # 4 with milk as well"
        }
    ];
    var idLast = notes[notes.length - 1].id;
    /** id to used to create the next note */

        // Create the note server
    var server = restify.createServer({
            name: "Bill Gray's Note Server", formatters: {
                'application/json': function (req, res, body, cb) {
                    var ret;
                    try {
                        ret = cb(null, JSON.stringify(body, null, '\t'));
                    } catch (e) {
                        res.statusCode = 400;
                        ret            = badRequest(body);
                    }
                    console.log(ret);
                    return ret;
                }
            }
        });

    // Load the restify plugins
    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    //
    // REST Service routes
    //

    /**
     * Get all notes with optional query parameter
     *
     * get /api/notes
     * get /api/notes?query=milk
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('/api/notes', function (req, res, next) {
        var ret   = [];
        var query = req.query.query;

        notes.forEach(function (note) {
            // Test for a query string
            if (query === undefined || note.body.search(query) != -1)
                ret.push(note);
        });
        if (ret.length == 0) {
            ret = notFound(res);
        }
        res.json(ret);
        next();
    });

    /**
     * Get a note by id
     *
     * get /api/notes/{id}
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('/api/notes/:id', function (req, res, next) {
        // There can not be duplicate notes, so always use the first element returned.
        var ret = notes.filter(function (note) {
            return note.id == req.params.id;
        })[0];
        if (ret === undefined) {
            ret = notFound(res);
        }
        res.json(ret);
        next();
    });

    /**
     * Create a new note
     *
     * post api/notes (body=note text)
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  The new note, or 400 if the note could not be created.
     */
    server.post('/api/notes', function (req, res, next) {
        var ret;

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            var body = typeof req.body !== "string"
                ? req.body.toString()
                : JSON.parse(req.body).body;
            idLast++;
            ret = {"id": idLast, "body": body};
            notes.push(ret);
            saveNotes();
            res.statusCode = 201; // Created
        }
        catch (e) {
            res.statusCode = 400;

            ret = badRequest(body);
        }
        res.json(ret);
        next();
    });

    //
    // Misc functions
    //

    /**
     * Return a json error showing a bad request
     *
     * @param body
     * @returns {{jse_shortmsg: string, jse_info: {}, message: string, statusCode: number, body: {code: string, message: string}, restCode: string}}
     */
    var badRequest = function (body) {
        var retJson = {
            "jse_shortmsg": "Invalid Data",
            "jse_info"    : {},
            "message"     : "Body contained invalid Data",
            "statusCode"  : 400,
            "body"        : {
                "code"   : "BadRequest",
                "message": "data invalid Body = " + body
            },
            "restCode"    : "BadRequest"
        };
        return retJson;
    };

    /**
     * Load the passed response with a 404 Not Found error and return the error text
     *
     * @param res  The response to modify
     * @returns {string} Note NOT found
     */
    var notFound = function (res) {
        res.statusCode = 404;

        var retJson = {
            "jse_shortmsg": "Note not found",
            "jse_info"    : {},
            "message"     : "Requested note was not found",
            "statusCode"  : 404,
            "body"        : {
                "code"   : "NotFound",
                "message": "Note was not found!"
            },
            "restCode"    : "NotFound"
        };

        return retJson; //"Note NOT found";
    };

    /**
     * Save the notes to a file
     */
    var saveNotes = function () {
        fs.writeFile(notesFile, JSON.stringify(notes), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved with %d notes.", notes.length);
        });
    };

    /**
     * Get the notes from the file.
     */
    var getNotes = function () {
        fs.exists(notesFile, function (exists) {
            if (exists) {
                fs.readFile(notesFile, function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    notes = JSON.parse(data);

                    /**
                     * Find the last id used so it can be incremented for a new note.
                     */
                    // If the file can not be manually edited we can get the largest id with the following
                    // idLast = notes[notes.length-1].id;

                    // Iterate through the notes to find the largest ID number in case it was manually edited.
                    notes.forEach(function (note) {
                        //console.log("idLast = %s note.id = %s", idLast, note.id);
                        idLast = Math.max(idLast, parseInt(note.id));
                    });
                    console.log("There are %d notes available.", notes.length);
                });
            }
            else {
                console.log("No Data file - using the default data");
            }
        });
    };

    //
    // Initialization
    //

    // Load the notes if the file exists.
    getNotes();

    // Have restify listen on the configured port
    server.listen(PORT, function () {
        console.log('%s listening at %s', server.name, server.url);
    });

})();