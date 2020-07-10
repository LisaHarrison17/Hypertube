let mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const uniqueValidator = require('mongoose-unique-validator');

let userSchema = mongoose.Schema({
    firstname:{
        type: String
    },
    lastname:{
        type: String
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String
    },
    password:{
        type: String,
        required: true
    },
});

let Users = module.exports = mongoose.model('User', userSchema);