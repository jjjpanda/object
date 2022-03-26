const puppeteer = require('puppeteer');

module.exports = async () => {
  console.log("PUPPET STARTED")
  const browser = await puppeteer.launch({
    executablePath: process.env.object_browser_FILEPATH,
    userDataDir: process.env.object_data_FOLDERPATH
  });
  console.log("loaded browser")
  process.on("exit", async () => {
    console.log("STOPPING PUPPET")
    await browser.close()
  })
  const page = await browser.newPage();
  await page.setCookie({
      url: process.env.object_FULL_URL,
      name: "objecttoken",
      value: process.env.object_AUTH
  })
  await page.emulateCPUThrottling(6);
  console.log("page setup complete")
  await page.goto(process.env.object_FULL_URL);

  page.on('console', (msg) => console.log(msg.text()));
}