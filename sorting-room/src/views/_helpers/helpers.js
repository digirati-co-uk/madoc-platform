module.exports.register = function (Handlebars) {
  Handlebars.registerHelper('json', (obj) => JSON.stringify(obj));
};
