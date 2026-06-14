import { generateAccessToken, generateRefreshToken } from './jwt.js';

export const sendToken = async (user, statusCode, res, message = 'Success') => {
  const payload = { _id: user._id, role: user.role, email: user.email };

  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Persist refresh token on user document
  user.refreshToken = refreshToken;
  user.lastLogin    = new Date();
  await user.save({ validateBeforeSave: false });

  const cookieOptions = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(statusCode)
    .json({
      success: true,
      message,
      accessToken,
      user,
    });
};