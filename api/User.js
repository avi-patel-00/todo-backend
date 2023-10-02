const express = require('express')
const bcrypt = require('bcrypt')

const router = express.Router()
const User = require("../models/User")

// sign up
router.post('/signup', (req, res) => {
    let { name, email, password, dateOfBirth } = req.body

    name = name.trim()
    email = email.trim()
    password = password.trim()
    dateOfBirth = dateOfBirth.trim()

    if (name == "" || email == "" || password == "" || dateOfBirth == "") {
        res.json({
            status: "Failed",
            message: "Empty input fields!"
        })
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        res.json({
            status: "Failed",
            message: "Invalid name entered"
        })
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        res.json({
            status: "Failed",
            message: "Invalid email entered"
        })
    }
    else if (!new Date(dateOfBirth).getTime()) {
        res.json({
            status: "Failed",
            message: "Invalid Date of Birth entered"
        })
    } else if (password.length < 8) {
        res.json({
            status: "Failed",
            message: "Password is too short!!"
        })
    } else {
        // if user exist
        User.find({ email }).then(result => {
            if (result.length) {
                res.json({
                    status: "Failed",
                    message: "User with provided email already exists!!"
                })
            } else {
                // Try to create new user

                // password handling
                const saltRounds = 10
                bcrypt.hash(password, saltRounds).then(hashPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashPassword, dateOfBirth
                    })

                    newUser.save().then(result => {
                        res.json({
                            status: "Success",
                            message: "User added successfully",
                            data: result,
                        })
                    }).catch(() => {
                        res.json({
                            status: "Failed",
                            message: "An error while adding user"
                        })
                    })
                }).catch(() =>
                    res.json({
                        status: "Failed",
                        message: "An error while encrypting password"
                    })
                )
            }
        }).catch(() => res.json({
            status: "Failed",
            message: "Something went wrong!!"
        })
        )
    }

})

// sign in
router.post('/signin', (req, res) => {
    let { email, password } = req.body

    email = email.trim()
    password = password.trim()


    if (email == "" || password == "") {
        res.json({
            status: "Failed",
            message: "Empty input fields!"
        })
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        res.json({
            status: "Failed",
            message: "Invalid email entered"
        })
    } else if (password.length < 8) {
        res.json({
            status: "Failed",
            message: "Password is too short!!"
        })
    } else {
        // if user exist
        User.find({ email }).then(result => {
            console.log("🚀 ~ result:", result[0].password)
            if (result.length) {
                bcrypt.compare(password, result[0].password).then(result => {
                    console.log("🚀 ~ result:", result)
                    if (result) {
                        res.json({
                            status: "Success",
                            message: "Sign in Successfully!!"
                        })
                    } else {
                        res.json({
                            status: "Failed",
                            message: "Invalid password!"
                        })
                    }
                })
            } else {
                res.json({
                    status: "Failed",
                    message: "Something went wrong!!"
                })
            }
        }).catch(() => res.json({
            status: "Failed",
            message: "User not found"
        })
        )
    }
})

module.exports = router