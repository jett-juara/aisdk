await page.route('**/api/auth/login', async (route) => {
  const response = await route.fetch();
  const request = route.request();
  console.log(JSON.stringify({
    url: request.url(),
    method: request.method(),
    postData: request.postData(),
    status: response.status(),
    body: await response.text(),
  }));
  await route.fulfill({
    response,
  });
});
