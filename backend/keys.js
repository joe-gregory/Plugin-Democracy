require("dotenv").config();

module.exports = {
  mongo_missing_link: process.env.MONGO_MISSING_LINK,
  session: process.env.SESSION,
  jwtSecret: process.env.JWT_SECRET,
  gmailEmail: process.env.GMAIL_EMAIL,
  gmailPassword: process.env.GMAIL_PASSWORD,
  aws_access_key: process.env.AWS_ACCESS_KEY,
  aws_secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
  aws_bucket_region: process.env.AWS_BUCKET_REGION,
  aws_bucket_name: process.env.AWS_BUCKET_NAME,
};
