const extractUserData = (req) => {
  let user = null;
  const customUser = req.headers['x-user-data'];
  if (customUser) {
    try { user = JSON.parse(customUser); } catch(e) { console.error('JSON Parse error on x-user-data:', e); }
  }
  if (!user && req.session?.user) {
    user = req.session.user;
  }
  console.log(`[Auth Check] Path: ${req.path}, User ID: ${user?.id || 'null'}, Role: ${user?.role || 'null'}`);
  return user;
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
