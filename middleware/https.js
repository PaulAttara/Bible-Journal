function https(req, res, next) {
    // if(process.env.NODE_ENV){
    //     res.redirect('https://' + req.headers.host + req.url);
    // }
    next();
}

module.exports = https