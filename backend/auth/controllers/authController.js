const  authService  = require('../services/authService');
const { sendSuccess, sendError } = require("../../shared/config/helpers/apiResponseHelper");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser(email, password);
    sendSuccess(res, { user, token }, 'Inicio de sesión exitoso');
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

const register = async (req , res) => {
  try{
    const {user ,token} = await authService.registerUser(req.body);
    sendSuccess(res, { user, token }, 'Registro exitoso');
  }catch (error) {
    sendError(res, 400, error.message);
  }
}

module.exports = { login , register };
