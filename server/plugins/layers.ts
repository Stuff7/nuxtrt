export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    html.bodyAppend.push("<div data-layer=\"dialog\"></div>");
  });
});
