const sendResponse = (res, status, success, data, message) => {
    res.status(status).json({ success, data, message });
  };
  
  const sendSuccess = (res, data, message) => {
    sendResponse(res, 200, true, data, message);
  };
  
  const sendError = (res, status, message) => {
    sendResponse(res, status, false, null, message);
  };
  
  module.exports = {
    sendSuccess,
    sendError
  };