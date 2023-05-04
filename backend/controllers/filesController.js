const s3Client = require("@aws-sdk/client-s3");
const keys = require("../keys");
const s3 = new s3Client.S3Client({
  credentials: {
    accessKeyId: keys.aws_access_key,
    secretAccessKey: keys.aws_secret_access_key,
  },
  region: keys.aws_bucket_region,
});

async function uploadProfilePicture(request, response) {
  let output = {};
  output.success = false;
  output.messages = [];

  const params = {
    Bucket: keys.aws_bucket_name,
    Key: "profile-pictures/" + request.user._id,
    Body: request.file.buffer,
    ContentType: request.file.mimetype,
  };

  const command = new s3Client.PutObjectCommand(params);

  try {
    await s3.send(command);
  } catch (error) {
    console.log(error);
    output.messages.push({
      severity: "error",
      message: "Error uploading profile picture",
    });
    return response.status(500).json(output);
  }

  output.messages.push({
    severity: "success",
    message: "successfully uploaded profile picture",
  });
  response.json(output);
}

async function getProfilePicture(request, response) {
  const getObjectParams = {
    Bucket: keys.aws_bucket_name,
    Key: "profile-pictures/" + request.user._id,
  };

  const command = new s3Client.GetObjectCommand(getObjectParams);

  try {
    const data = await s3.send(command);
    response.set("Content-Type", "application/octet-stream"); // set the Content-Type header
    data.Body.pipe(response); // pipe the readable stream to the response object
  } catch (error) {
    response.status(500).send();
  }
}

module.exports = {
  uploadProfilePicture,
  getProfilePicture,
};
