'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', process.env.PORT || 5000)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
  res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === '123token!') {
    res.send(req.query['hub.challenge'])
  } else {
    res.send('Error, wrong token')
  }
})

// to post data
app.post('/webhook', function (req, res) {
  var data = req.body

  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function (entry) {
      //  var pageID = entry.id
      //  var timeOfEvent = entry.time

      // Iterate over each messaging event
      entry.messaging.forEach(function (event) {
        if (event.message) {
          receivedMessage(event)
        } else {
          console.log('Webhook received unknown event: ', event)
        }
      })
    })

    res.sendStatus(200)
  }
})

function receivedMessage (event) {
  var message = event.message
  var senderID = event.sender.id
  // var messageId = message.mid
  var messageText = message.text
  // var messageAttachments = message.attachments

  if (messageText) {
    sendTextMessage(senderID, messageText)
  }
}

function sendTextMessage (recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }

  callSendAPI(messageData)
}

function callSendAPI (messageData) {
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: 'EAAPzE3eKw70BAPDT3JhdVH8LkALeevKCDq6rzQEclMqyTtEAcgneHYh2SbW02TnBQFcQ25yPmPftAVO683neSujiA0TAPhXZAeYigvHyUszfoqIkqIHoVevDrEWZCx9jZBZAFurot1vuKJiseLj2u0iAQ67BJCk1huXrlh6ZCawZDZD'
      },
      method: 'POST',
      json: messageData
    },
    function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var recipientId = body.recipient_id
        var messageId = body.message_id

        if (messageId) {
          console.log(
            'Successfully sent message with id %s to recipient %s',
            messageId,
            recipientId
          )
        } else {
          console.log(
            'Successfully called Send API for recipient %s',
            recipientId
          )
        }
      } else {
        console.error(
          'Failed calling Send API',
          response.statusCode,
          response.statusMessage,
          body.error
        )
      }
    }
  )
}
// spin spin sugar
app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
