const uniteResponse = require('../middleware/uniteResponse');
module.exports = (app) => {

  // const home = require('./home')
  const snkrs = require('./snkrs')(app)
  require('./user')(app)
  require('./upload')(app)
  require('./menu')(app)
// Handle errors
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.statusCode || 500).send(uniteResponse.fail(err.message))
  })
  // app.use('/', home)
}
