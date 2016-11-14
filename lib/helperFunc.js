module.exports.isAdmin = function() {
    return isAdmin
}

module.exports.adminLogout = function() {
    isAdmin = false
    return
}

module.exports.inputValidation = function() {
    req.checkBody('title', 'Title is empty').notEmpty()
    req.checkBody('author', 'Author is empty').notEmpty()
    req.checkBody('year', 'Year is empty').notEmpty()
}
