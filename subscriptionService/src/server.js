const app = require("./app");
const config = require("./config");

const PORT =
  config.PORT || 3002;

app.listen(PORT, () => {
  console.log(
    `Subscription Service running on port ${PORT}`
  );
});