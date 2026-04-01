const extractUserData = (req) => {
  const customUser = req.headers['x-user-data'];
  if (customUser) {
    try { return JSON.parse(customUser); } catch(e) {}
  }
  return req.session?.user;
};

const requireAuth = (req, res, next) => {
  const user = extractUserData(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
  req.session = req.session || {};
  req.session.user = user; // Set it for downstream controllers
  next();
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = extractUserData(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden. You do not have permission.' });
    }
    
    req.session = req.session || {};
    req.session.user = user;
    next();
  };
};

module.exports = {
  requireAuth,
  requireRole
};
