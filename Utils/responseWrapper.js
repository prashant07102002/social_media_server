const success = (statusCode, result) => {
    return {
        status: 'Ok',
        statusCode,
        result,

    }
}
const error = (statusCode, message) => {
    return {
        status: 'Error',
        statusCode,
        message,
    }
}
module.exports = {
    success,
    error
}