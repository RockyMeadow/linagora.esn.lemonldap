module.exports = (dependencies) => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      service: {
        type: 'string',
        minLength: 1
      },
      job_title: {
        type: 'string',
        minLength: 1
      },
      firstname: {
        type: 'string',
        minLength: 1
      },
      main_phone: {
        type: 'string',
        minLength: 1
      },
      lastname: {
        type: 'string',
        minLength: 1
      },
      email: {
        type: 'string',
        minLength: 1
      },
      description: {
        type: 'string',
        minLength: 1
      },
      office_location: {
        type: 'string',
        minLength: 1
      },
      building_location: {
        type: 'string',
        minLength: 1
      },
      'll-auth-domain': {
        type: 'string',
        minLength: 1
      },
      'll-auth-user': {
        type: 'string',
        minLength: 1
      }
    },
    required: [
      'll-auth-domain',
      'll-auth-user'
    ]
  };

  return {
    validator: createValidator(schema)
  };
};
