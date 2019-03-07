module.exports = {
  options: { algorithm: "aes256" },
  files: [
    "build.json",
    "signing.keystore",
    "src/environments/environment.prod.ts",
    "src/environments/environment.ts"
  ],
  warning: `🚨 If it's throwing ERR_INVALID_CALLBACK error that means your password is wrong`
};
