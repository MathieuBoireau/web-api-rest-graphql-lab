/**
 * @type { import('connect/index').NextHandleFunction } authorize
 */
function authorize(req, res, next, permission) {
  if (!req.auth) {
    throw { message: `${req.method} ${req.baseUrl}${req.path} Unauthorized`, code: 401}
  }
  const { user } = req.auth;
  if (user.permission !== permission) {
    throw { message: `${req.method} ${req.baseUrl}${req.path} Forbidden`, code: 403}
  }
}

module.exports.authorizeUser = function (req, res, next) {
  authorize(req, res, next, "user");
};

module.exports.authorizeAgent = function (req, res, next) {
  authorize(req, res, next, "agent");
};
