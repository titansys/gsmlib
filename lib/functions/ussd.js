'use strict'

const php = require('locutus/php')

module.exports = function(modem) {
    modem.addListener({
        process: (response) => {
            if (response.substr(0, 6).trim() == "+CUSD:" && response.substr(-6).trim() == ", 15") {
                response = php.strings.ltrim(response.trim(), '+CUSD: 1,"')
                response = php.strings.rtrim(response, '", 15')
                modem.emit('onNewIncomingUSSD', {
                    status: 'Incoming USSD',
                    data: {
                        response
                    }
                })
            }
        },
    })

    modem.sendUSSD = (command, callback, timeout = 1000) => {
        if (callback == undefined) {
            return new Promise((resolve, reject) => {
                modem.sendUSSD(command, (result, error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }, timeout)
            })
        }
        const item = modem.executeCommand(`AT+CUSD=1,"${command}",15`, (result, error) => {
            callback(result, error)
        }, false, timeout)
        item.logic = (newpart) => {
            // console.log({newpart})
            if ((newpart == ">" || newpart == 'OK')) {
                return {
                    resultData: {
                        status: 'success',
                        request: 'ussd',
                        data: newpart,
                    },
                    returnResult: true,
                }
            } else if (newpart == 'ERROR') {
                return {
                    resultData: {
                        status: 'fail',
                        request: 'ussd',
                        data: 'Cannot exec ussd'
                    },
                    returnResult: true,
                }
            }
        }
    }
}
