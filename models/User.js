const { Schema, model } = require('mongoose')

const User = new Schema({
    imgSrc: { type: String, default: 'avatar.png' },
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: false, required: true },
    lastname: { type: String, required: true },
    password: { type: String, required: true },
    roles: [{ type: String, ref: 'Role' }],
    currency: {
        value: { type: String, required: true, default: 'usd' },
        label: { type: String, required: true, default: 'USD' }
    }

})


module.exports = model('User', User)
