module.exports = file => {
  const regex = /(?:.(?!\.))+$/g;
  const results = file.path.match(regex);
  return results[0];
};
