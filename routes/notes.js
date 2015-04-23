var express = require('express');
var router = express.Router();

/* API */
router.get('/savenotes', function(req, res, next) {
    var db = req.db;
    //var tags = req.query.tags && req.query.tags.length ? req.query.tags.split(',') : []; //  handle multi tags later

    var rec = db.get('notes').insert({
        title : req.query.title,
        url : req.query.url,
        content : req.query.content,
        username : req.query.username,
        comments : req.query.comments,
        notebook : req.query.notebook,
        team : req.query.team,
        tags : req.query.tags,
        timestamp : new Date()
    });
    res.jsonp(rec.query);
});

router.get('/getnotes', function(req, res, next) {
    var db = req.db;
    var collection = db.get('notes');
    var filter = req.query.title ? {"title" : new RegExp(req.query.title)} : {}
    collection.find(filter, null, function(e, docs){
        res.jsonp(docs);
    });
});

/* Rendering */
router.get('/:username/notes', function(req, res, next){
    var db = req.db;
    var collection = db.get('notes');
    var filter = req.params.username ? {"username" : new RegExp(req.params.username)} : {}
    collection.find(filter, null, function(e, docs){
        res.render('notes',{
           notes : docs
        });
    });
});

router.get('/search', function(req, res, next){
    var db = req.db;
    var collection = db.get('notes');
    var filter = req.query.query ? { "$or" : [{"title" : new RegExp(req.query.query)}, {"content" : new RegExp(req.query.query)} ]}: {}
    collection.find(filter, null, function(e, docs){
        res.render('notes',{
            notes : docs
        });
    });
});

module.exports = router;
