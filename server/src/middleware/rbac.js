import { sendError } from '../utils/response.js';

export const ROLES = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  RECRUITER: 'RECRUITER',
  INTERVIEWER: 'INTERVIEWER',
};

// Normalize role strings from different formats (e.g. 'Administrator' -> 'ADMIN', 'HR Manager' -> 'HR_MANAGER')
export const normalizeRole = (role) => {
  if (!role) return ROLES.RECRUITER;
  const upper = role.toUpperCase().replace(/\s+/g, '_');
  if (upper.includes('ADMIN')) return ROLES.ADMIN;
  if (upper.includes('HR')) return ROLES.HR_MANAGER;
  if (upper.includes('INTERVIEW')) return ROLES.INTERVIEWER;
  return ROLES.RECRUITER;
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    if (!normalizedAllowed.includes(userRole)) {
      return sendError(
        res,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};
