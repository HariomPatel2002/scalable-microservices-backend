const app = require("./app");
const config = require("./config");

const PORT = config.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Admin Service running on port ${PORT}`);
});
