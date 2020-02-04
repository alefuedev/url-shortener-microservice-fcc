let mongoose = require('mongoose')

let urlSchema = mongoose.Schema({original_url: String, short_url: String})

module.exports = mongoose.model('URL', urlSchema)
