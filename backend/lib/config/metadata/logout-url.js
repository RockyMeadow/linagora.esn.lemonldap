module.exports = (dependencies) => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'string',
    format: 'uri'
  };

  return {
    validator: createValidator(schema)
  };
};
